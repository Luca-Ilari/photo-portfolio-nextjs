import path from "path";
import fs from "fs";
import sharp from "sharp";

export type imagesProperty = {
    fileName: string;
    fileUrl: string;
    width: number;
    height: number;
    orientation: number;
    type: string;
    blurDataURL: string;
};

export type galleryProperty = {
    title: string;
    path: string;
    preview_image: string;
    date: string;
    circuit?: string;
    blurb?: string;
};

const PUBLIC_DIR = path.join(process.cwd(), "public");
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
const SLUG_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const METADATA_CONCURRENCY = 8;

type CachedImage = { stamp: string; value: imagesProperty };

const imageCache = new Map<string, CachedImage>();

export function isValidSlug(slug: string): boolean {
    return SLUG_PATTERN.test(slug) && !slug.includes("..");
}

function isDirectory(target: string): boolean {
    try {
        return fs.statSync(target).isDirectory();
    } catch {
        return false;
    }
}

async function mapWithLimit<T, R>(
    items: T[],
    limit: number,
    task: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
    const results = new Array<R>(items.length);
    let cursor = 0;

    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (cursor < items.length) {
            const index = cursor++;
            results[index] = await task(items[index], index);
        }
    });

    await Promise.all(workers);
    return results;
}

async function readImage(
    galleryName: string,
    fileName: string,
    filePath: string,
): Promise<imagesProperty | null> {
    try {
        const pipeline = sharp(filePath, { failOn: "none" });
        const meta = await pipeline.metadata();
        const swapped = (meta.orientation ?? 1) >= 5;
        const width = (swapped ? meta.height : meta.width) ?? 0;
        const height = (swapped ? meta.width : meta.height) ?? 0;

        const preview = await sharp(filePath, { failOn: "none" })
            .rotate()
            .resize(24, 24, { fit: "inside" })
            .webp({ quality: 40 })
            .toBuffer();

        return {
            fileName,
            fileUrl: `/${galleryName}/${fileName}`,
            width,
            height,
            orientation: meta.orientation ?? 1,
            type: meta.format ?? "",
            blurDataURL: `data:image/webp;base64,${preview.toString("base64")}`,
        };
    } catch {
        console.error(`[gallery] immagine illeggibile: ${galleryName}/${fileName}`);
        return null;
    }
}

export async function getGallerySettings(folderName: string): Promise<galleryProperty> {
    const empty: galleryProperty = { title: "", path: folderName, preview_image: "", date: "" };

    if (!isValidSlug(folderName)) return empty;

    const settingsPath = path.join(PUBLIC_DIR, folderName, "settings.json");
    if (!fs.existsSync(settingsPath)) return empty;

    try {
        const parsed = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
        return {
            title: typeof parsed.title === "string" ? parsed.title : "",
            path: folderName,
            preview_image: parsed.preview_image ? `${folderName}/${parsed.preview_image}` : "",
            date: typeof parsed.date === "string" ? parsed.date : "",
            circuit: typeof parsed.circuit === "string" ? parsed.circuit : undefined,
            blurb: typeof parsed.blurb === "string" ? parsed.blurb : undefined,
        };
    } catch {
        console.error(`[gallery] settings.json malformato in: ${folderName}`);
        return empty;
    }
}

export async function getFolders(): Promise<galleryProperty[]> {
    let entries: fs.Dirent[];
    try {
        entries = fs.readdirSync(PUBLIC_DIR, { withFileTypes: true });
    } catch (error) {
        console.error("[gallery] impossibile leggere public/", error);
        return [];
    }

    const candidates = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((name) => !name.startsWith(".") && !name.startsWith("_") && isValidSlug(name));

    const settings = await Promise.all(candidates.map(getGallerySettings));

    return settings
        .filter((gallery) => gallery.title !== "")
        .sort((a, b) => b.date.localeCompare(a.date) || a.path.localeCompare(b.path));
}

export async function getImages(galleryName: string): Promise<imagesProperty[]> {
    if (!isValidSlug(galleryName)) return [];

    const dirPath = path.join(PUBLIC_DIR, galleryName);
    if (!isDirectory(dirPath)) return [];

    let entries: fs.Dirent[];
    try {
        entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch {
        return [];
    }

    const fileNames = entries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) => ALLOWED_EXT.has(path.extname(name).toLowerCase()))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

    const images = await mapWithLimit(fileNames, METADATA_CONCURRENCY, async (fileName) => {
        const filePath = path.join(dirPath, fileName);

        let stamp: string;
        try {
            const stats = fs.statSync(filePath);
            stamp = `${stats.mtimeMs}:${stats.size}`;
        } catch {
            return null;
        }

        const cached = imageCache.get(filePath);
        if (cached && cached.stamp === stamp) return cached.value;

        const image = await readImage(galleryName, fileName, filePath);
        if (image) imageCache.set(filePath, { stamp, value: image });
        return image;
    });

    return images.filter((image): image is imagesProperty => image !== null);
}
