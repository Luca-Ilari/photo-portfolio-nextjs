import path from "path";
import fs from "fs";

export type imagesProperty = {
    fileName: string;
    fileUrl: string;
    height: number;
    orientation: number;
    width: number;
    type: string;
};

export type galleryProperty = {
    title: string;
    path: string;
    preview_image: string;
    date: string;
};

const customIsDir = (path: string) => {
    try {
        fs.readdirSync(path).forEach((file) => {
            console.log(file);
        });
        return true;
    } catch (error) {
        return false;
    }
};

const searchFileInDir = (dirPath: string, fileName: string) => {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        // build the full path of the file
        const filePath = path.join(dirPath, file);

        if (file.endsWith(fileName)) {
            //console.log("FOUND:", filePath);
            return filePath;
        }
    }
    return null;
};

export async function getGallerySettings(folderName: string): Promise<galleryProperty> {
    "use server";
    const gallerySettingsPath: string | null = searchFileInDir(
        "./public/" + folderName,
        "settings.json"
    );

    if (gallerySettingsPath !== null) {
        try {
            const gallerySettings: galleryProperty = JSON.parse(
                fs.readFileSync(gallerySettingsPath, "utf8")
            );
            return {
                title: gallerySettings.title,
                path: folderName,
                preview_image: folderName + "/" + gallerySettings.preview_image,
                date: gallerySettings.date,
            };
        } catch (error) {
            console.error(
                "\nSETTINGS JSON FOR GALLERY " + folderName + " IS NOT PROPERLY FORMATTED\n"
            );
        }
    }
    return { title: folderName, path: folderName, preview_image: "", date: "" };
}

export async function getFolders(): Promise<galleryProperty[]> {
    "use server";
    const foldersFound: galleryProperty[] = [];
    const directoryPath = path.join(__dirname, "../../../public/");
    const files = fs.readdirSync(directoryPath);

    files.forEach(async (file) => {
        console.log("IS DIR", file, customIsDir("./public/" + file));
        console.log("PWD", __dirname);
        if (customIsDir("./public/" + file)) {
            foldersFound.push(await getGallerySettings(file));
        }
    });

    return foldersFound;
}
