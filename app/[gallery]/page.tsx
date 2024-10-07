"use server";
import path from "path";
import fs from "fs";
import Gallery from "@/components/Gallery";
import GalleryDescription from "@/components/GalleryDescription";
import { galleryProperty, getGallerySettings, imagesProperty } from "@/actions/actions";
import { notFound } from "next/navigation";

const getImageSize = (filePaths: string) => {
    const sizeOf = require("image-size");
    const dimensions = sizeOf(filePaths);
    return dimensions;
};

const getFileExtension = (filePath: string): string => {
    return path.extname(filePath).toLowerCase();
};

const getImages = async (galleryName: string): Promise<imagesProperty[]> => {
    "use server";
    const allowedFileType = [".png", ".jpeg", ".jpg", ".gif"];
    const directoryPath = path.join(__dirname, "../../../../public/" + galleryName);
    const fileNamesProperty: imagesProperty[] = [];
    let files;
    try {
        files = fs.readdirSync(directoryPath);
    } catch (error) {
        notFound();
    }

    files.forEach((fileName) => {
        const filePath: string = "./public/" + galleryName + "/" + fileName;
        if (fs.lstatSync(filePath).isDirectory()) {
            return;
        }

        //If file is an image (to avoid json and other stuff)
        if (allowedFileType.includes(getFileExtension(filePath))) {
            fileNamesProperty.push({
                fileName: fileName,
                fileUrl: "/" + galleryName + "/" + fileName,
                ...getImageSize(filePath),
            });
        }
    });

    return fileNamesProperty;
};

const GalleryPage = async ({ params }: { params: { gallery: string } }) => {
    const images: imagesProperty[] = await getImages(params.gallery);
    const gallerySettings: galleryProperty = await getGallerySettings(params.gallery);

    return (
        <>
            <Gallery galleryName={params.gallery} images={images}>
                <>
                    <GalleryDescription
                        title={"title: " + gallerySettings.title}
                        date={"date: " + gallerySettings.date}
                    />
                </>
            </Gallery>
        </>
    );
};

export default GalleryPage;
