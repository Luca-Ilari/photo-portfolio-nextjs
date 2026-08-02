"use client";

import Image from "next/image";
import Link from "next/link";

const CARD_SIZES = "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 320px";

interface ArchiveCardProps {
    href: string;
    previewImage: string;
    blurDataURL?: string;
    index: string;
    display: string;
    title: string;
    countLabel: string;
}

export default function ArchiveCard({
    href,
    previewImage,
    blurDataURL,
    index,
    display,
    title,
    countLabel,
}: ArchiveCardProps) {
    return (
        <Link href={href} data-reveal className="archive-card" aria-label={`${title} — ${display}, ${countLabel}`}>
            {previewImage && (
                <Image
                    src={previewImage}
                    alt=""
                    fill
                    sizes={CARD_SIZES}
                    quality={82}
                    placeholder={blurDataURL ? "blur" : "empty"}
                    blurDataURL={blurDataURL}
                    className="archive-card-img"
                />
            )}
            <span className="archive-card-overlay" aria-hidden="true" />
            <span className="archive-card-body">
                <span style={{
                    fontSize: 9, letterSpacing: ".26em",
                    textTransform: "uppercase", color: "rgba(237,234,229,.6)",
                }}>
                    {index} · {display}
                </span>
                <span style={{
                    fontFamily: "var(--font-archivo), system-ui, sans-serif", fontWeight: 800,
                    fontSize: "clamp(1rem,1.9vw,1.5rem)", lineHeight: 1.05,
                    letterSpacing: "-.02em", textTransform: "uppercase", color: "#edeae5",
                }}>
                    {title}
                </span>
                <span style={{
                    fontSize: 9, letterSpacing: ".24em",
                    textTransform: "uppercase", opacity: .5, color: "#edeae5",
                }}>
                    {countLabel}
                </span>
            </span>
        </Link>
    );
}
