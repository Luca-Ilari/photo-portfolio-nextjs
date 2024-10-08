"use server";

import Link from "next/link";
import Image from "next/image";
import {galleryProperty, getFolders} from "@/actions/actions";

export default async function Home() {
    const folders: galleryProperty[] = await getFolders();
    return (
        <>
            <div className="container">
                <h1>LUCA ILARI</h1>
                <div className="gallery-wrap">
                    {folders.map((v) => {
                        return (
                            <div className="item" key={v.preview_image}>
                                <Link key={v.path} href={v.path}>
                                    <Image
                                        src={"/" + v.preview_image}
                                        fill
                                        style={{objectFit: "cover"}}
                                        alt=""
                                        quality={50}
                                    />
                                <span style={{
                                    position: "absolute",
                                    bottom: 10,
                                    width: "100%",
                                    textAlign: "center"
                                }}>
                                    <p>{v.title}</p>
                                    <p>{v.date}</p>
                                </span>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
