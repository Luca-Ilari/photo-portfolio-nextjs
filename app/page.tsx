"use server";

import Link from "next/link";
import Image from "next/image";
import { galleryProperty, getFolders } from "@/actions/actions";

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
