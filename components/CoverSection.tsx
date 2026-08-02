"use client";

import Image from "next/image";

interface CoverSectionProps {
    title: string;
    line1: string;
    line2: string;
    circuit: string;
    display: string;
    countLabel: string;
    blurb: string;
    cover: string;
    blurDataURL?: string;
    year: string;
    index: string;
}

export default function CoverSection({
    title,
    line1,
    line2,
    circuit,
    display,
    countLabel,
    blurb,
    cover,
    blurDataURL,
    year,
    index,
}: CoverSectionProps) {
    return (
        <section data-fx="cover" style={{ position: "relative", zIndex: 2, height: "260vh" }}>
            <div style={{ position: "sticky", top: 0, height: "100svh", overflow: "hidden" }}>
                <div
                    data-cover-year
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%,-50%)",
                        fontFamily: "var(--font-archivo), system-ui, sans-serif",
                        fontWeight: 800,
                        fontSize: "clamp(7rem,30vw,26rem)",
                        lineHeight: 1,
                        letterSpacing: "-.05em",
                        color: "rgba(237,234,229,.07)",
                        pointerEvents: "none",
                        willChange: "transform",
                        whiteSpace: "nowrap",
                    }}
                >
                    {year}
                </div>

                <div data-cover-media style={{ position: "absolute", inset: 0, willChange: "clip-path" }}>
                    {cover && (
                        <Image
                            src={cover}
                            alt={title}
                            data-cover-img
                            fill
                            sizes="115vw"
                            quality={90}
                            placeholder={blurDataURL ? "blur" : "empty"}
                            blurDataURL={blurDataURL}
                            style={{ objectFit: "cover", willChange: "transform" }}
                        />
                    )}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background:
                                "linear-gradient(180deg,rgba(8,8,10,.6) 0%,rgba(8,8,10,.1) 40%,rgba(8,8,10,.92) 100%)",
                        }}
                    />
                </div>

                <div
                    data-cover-content
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        padding: "0 clamp(14px,3.5vw,44px) clamp(34px,7vh,80px)",
                        pointerEvents: "none",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px 22px",
                            fontSize: 10,
                            letterSpacing: ".28em",
                            textTransform: "uppercase",
                            opacity: 0.7,
                        }}
                    >
                        <span style={{ color: "#ff3b1f" }}>{index}</span>
                        {circuit && <span>{circuit}</span>}
                        <span>{display}</span>
                        <span>{countLabel}</span>
                    </div>

                    <h3
                        style={{
                            margin: "14px 0 0",
                            fontFamily: "var(--font-archivo), system-ui, sans-serif",
                            fontWeight: 800,
                            fontSize: "clamp(2.3rem,9.5vw,8rem)",
                            lineHeight: 0.9,
                            letterSpacing: "-.035em",
                            textTransform: "uppercase",
                        }}
                    >
                        <span style={{ display: "block", overflow: "hidden", paddingBottom: ".03em" }}>
                            <span data-word style={{ display: "block" }}>
                                {line1}
                            </span>
                        </span>
                        {line2 && (
                            <span style={{ display: "block", overflow: "hidden", paddingBottom: ".03em" }}>
                                <span data-word style={{ display: "block", opacity: 0.5 }}>
                                    {line2}
                                </span>
                            </span>
                        )}
                    </h3>

                    {blurb && (
                        <p
                            style={{
                                margin: "clamp(16px,3vh,32px) 0 0",
                                maxWidth: "46ch",
                                fontSize: "clamp(11px,1.3vw,13px)",
                                lineHeight: 1.8,
                                opacity: 0.72,
                            }}
                        >
                            {blurb}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
