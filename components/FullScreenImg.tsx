"use client";
import Image from "next/image";

const FullScreenImg = ({imagePath, setImagePath}: { imagePath: string; setImagePath: any }) => {
    return (
        <>
            <div className="modal" style={{display: imagePath ? "" : "none"}}>
                <span
                    className="close"
                    onClick={() => {
                        setImagePath("");
                    }}
                >
                    &times;
                </span>
                <div className="modal-image-container">
                    {imagePath === "" ? null :
                        <Image
                            src={imagePath}
                            alt="Full size image"
                            fill
                            style={{objectFit: "contain"}}
                            priority={true}
                            quality={"100"}
                        />
                    }
                </div>
            </div>
        </>
    );
};

export default FullScreenImg;
