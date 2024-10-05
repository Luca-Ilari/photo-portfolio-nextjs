"use server";
import path from "path";
import fs from "fs";
import Link from "next/link";
import Image from "next/image";

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

const searchFileInDir = (dirPath: string, fileName: string) => {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        // build the full path of the file
        const filePath = path.join(dirPath, file);

        if (file.endsWith(fileName)) {
            console.log("FOUND:", filePath);
            return filePath;
        }
    }
    return null;
};

export async function getGallerySettings(folderName: string): Promise<galleryProperty> {
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

const getFolders = async (): Promise<galleryProperty[]> => {
    "use server";
    const foldersFound: galleryProperty[] = [];
    const directoryPath = path.join("./public/");
    const files = fs.readdirSync(directoryPath);

    files.forEach(async (file) => {
        if (fs.lstatSync("./public/" + file).isDirectory()) {
            foldersFound.push(await getGallerySettings(file));
        }
    });

    return foldersFound;
};

export default async function Home() {
    const folders: galleryProperty[] = await getFolders();
    return (
        <>
            <div className="container">
                <h1>LUCA ILARI</h1>
                <div className="gallery-wrap">
                    {folders.map((v) => {
                        return (
                            <div className="item item-1" key={v.preview_image}>
                                <Link key={v.path} href={v.path}>
                                    <Image
                                        src={"/" + v.preview_image}
                                        fill
                                        style={{ objectFit: "cover" }}
                                        alt=""
                                        quality={100}
                                    />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
