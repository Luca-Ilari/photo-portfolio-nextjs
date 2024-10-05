"use server";
import path from "path";
import fs from "fs";
import Link from "next/link";
import Image from "next/image";
import { galleryProperty, getGallerySettings } from "@/actions/actions";

async function getFolders(): Promise<galleryProperty[]> {
    "use server";
    const foldersFound: galleryProperty[] = [];
    const directoryPath = path.join(__dirname, "../../../public/");
    const files = fs.readdirSync(directoryPath);

    files.forEach(async (file) => {
        if (fs. existsSync("./public/" + file)) {
            foldersFound.push(await getGallerySettings(file));
        }
    });

    return foldersFound;
}

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
