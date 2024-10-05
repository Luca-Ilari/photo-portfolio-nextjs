"use client";

import Image from "next/image";
import { ReactElement, useState } from "react";
import FullScreenImg from "./FullScreenImg";
import { imagesProperty } from "@/actions/actions";

const Gallery = ({
    images,
    galleryName,
    children,
}: {
    galleryName: string;
    images: imagesProperty[];
    children: ReactElement;
}) => {
    const [openedImage, setOpenedImage] = useState("");
    return (
        <>
            <div className="gallery-container">
                {children}
                <div className="gallery">
                    {images.map((v, idx) => {
                        return (
                            <div className="gallery-item" key={idx}>
                                <Image
                                    src={v.fileUrl}
                                    alt=""
                                    width={v.width / 3} //should be changed
                                    height={v.height / 3} //should be changed
                                    quality={"80"}
                                    onClick={() => {
                                        setOpenedImage(v.fileUrl);
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
            <FullScreenImg imagePath={openedImage} setImagePath={setOpenedImage} />
        </>
    );
};

export default Gallery;
