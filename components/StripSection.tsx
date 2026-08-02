"use client";

import Image from "next/image";
import Link from "next/link";
import { imagesProperty } from "@/actions/actions";
import { seriesIndex } from "@/lib/format";

const STRIP_SIZES = "(max-width: 600px) 400px, (max-width: 1100px) 620px, 960px";
const STRIP_LENGTH = 8;

interface StripSectionProps {
    slug: string;
    title: string;
    index: string;
    countLabel: string;
    photos: imagesProperty[];
}

export default function StripSection({ slug, title, index, countLabel, photos }: StripSectionProps) {
    const strip = photos.slice(0, STRIP_LENGTH);

    return (
        <section data-fx="strip" style={{ position: "relative", zIndex: 2, height: "240vh" }}>
            <div style={{
                position: "sticky", top: 0, height: "100svh",
                display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden",
            }}>
                <div style={{
                    display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16,
                    padding: "0 clamp(14px,3.5vw,44px) clamp(16px,2.6vh,30px)",
                    fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase",
                }}>
                    <span style={{ opacity: .6 }}>{index} — {title}</span>
                    <span data-strip-progress style={{ opacity: .45 }}>00 / 00</span>
                </div>

                <div data-strip-row style={{
                    display: "flex", alignItems: "center",
                    gap: "clamp(10px,1.6vw,26px)",
                    padding: "0 clamp(14px,3.5vw,44px)",
                    willChange: "transform",
                }}>
                    {strip.map((photo, position) => {
                        const ratio = photo.width && photo.height ? photo.width / photo.height : 3 / 2;
                        return (
                            <figure key={photo.fileName} data-strip-item style={{
                                margin: 0, position: "relative",
                                height: "clamp(210px,52svh,540px)",
                                flexShrink: 0, overflow: "hidden", background: "#101014",
                                aspectRatio: String(ratio),
                            }}>
                                <Image
                                    src={photo.fileUrl}
                                    alt={`${title} — scatto ${position + 1}`}
                                    data-strip-img
                                    fill
                                    sizes={STRIP_SIZES}
                                    quality={88}
                                    placeholder="blur"
                                    blurDataURL={photo.blurDataURL}
                                    style={{
                                        objectFit: "cover",
                                        transform: "scale(1.16)",
                                        willChange: "transform",
                                    }}
                                />
                                <figcaption style={{
                                    position: "absolute", left: 0, bottom: 0, padding: "12px 14px",
                                    fontSize: 9, letterSpacing: ".24em", textTransform: "uppercase",
                                    color: "#edeae5", zIndex: 1,
                                    background: "linear-gradient(0deg,rgba(8,8,10,.8),rgba(8,8,10,0))",
                                }}>
                                    {seriesIndex(position)}
                                </figcaption>
                            </figure>
                        );
                    })}

                    <Link href={`/${slug}`} className="btn-serie" aria-label={`Apri la serie ${title}`}>
                        <span style={{
                            fontFamily: "var(--font-archivo), system-ui, sans-serif", fontWeight: 800,
                            fontSize: "clamp(1.2rem,2.4vw,2rem)", lineHeight: 1.05,
                            letterSpacing: "-.03em", textTransform: "uppercase",
                        }}>
                            Tutta la serie
                        </span>
                        <span style={{ fontSize: 10, letterSpacing: ".26em", textTransform: "uppercase", opacity: .6 }}>
                            {countLabel} →
                        </span>
                    </Link>
                </div>

                <div style={{ padding: "clamp(16px,2.6vh,30px) clamp(14px,3.5vw,44px) 0" }}>
                    <div style={{ height: 1, background: "rgba(237,234,229,.14)" }}>
                        <div data-strip-bar style={{
                            height: 1, width: "100%", background: "#ff3b1f",
                            transform: "scaleX(0)", transformOrigin: "left",
                        }} />
                    </div>
                </div>
            </div>
        </section>
    );
}
