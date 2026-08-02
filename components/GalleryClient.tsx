"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { imagesProperty, galleryProperty } from "@/actions/actions";
import { chapterCountLabel, formatDate, seriesIndex } from "@/lib/format";

const GRID_SIZES = "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, (max-width: 1600px) 33vw, 380px";
const CARD_SIZES = "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 340px";
const FULL_SIZES = "100vw";

interface GalleryClientProps {
    images: imagesProperty[];
    allFolders: galleryProperty[];
    currentSlug: string;
    title: string;
}

export default function GalleryClient({ images, allFolders, currentSlug, title }: GalleryClientProps) {
    const [lbIndex, setLbIndex] = useState(-1);
    const [lbLoading, setLbLoading] = useState(false);

    const figRef = useRef<HTMLDivElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const fromRectRef = useRef<DOMRect | null>(null);
    const dirRef = useRef(1);
    const restoreRef = useRef<HTMLElement | null>(null);

    const isOpen = lbIndex >= 0;
    const current = isOpen ? images[lbIndex] : null;

    const neighbours = useMemo(() => {
        if (!isOpen || images.length < 2) return [];
        const total = images.length;
        const around = [images[(lbIndex + 1) % total], images[(lbIndex - 1 + total) % total]];
        return around.filter((image, i, list) => image && list.indexOf(image) === i && image !== images[lbIndex]);
    }, [isOpen, lbIndex, images]);

    const open = useCallback((index: number, rect: DOMRect) => {
        fromRectRef.current = rect;
        dirRef.current = 1;
        setLbLoading(true);
        setLbIndex(index);
    }, []);

    const close = useCallback(() => {
        fromRectRef.current = null;
        setLbIndex(-1);
        setLbLoading(false);
    }, []);

    const step = useCallback((dir: number) => {
        if (images.length < 2) return;
        fromRectRef.current = null;
        dirRef.current = dir;
        setLbLoading(true);
        setLbIndex((index) => (index < 0 ? index : (index + dir + images.length) % images.length));
    }, [images.length]);

    useEffect(() => {
        if (!isOpen) return;
        const fig = figRef.current;
        if (!fig) return;

        const from = fromRectRef.current;
        fromRectRef.current = null;

        if (!from) {
            fig.style.transition = "none";
            fig.style.transform = "none";
            fig.style.animation = "none";
            void fig.offsetWidth;
            fig.style.animation = `${dirRef.current >= 0 ? "lbSlideNext" : "lbSlidePrev"} .55s cubic-bezier(.16,1,.3,1) both`;
            return;
        }

        fig.style.animation = "none";
        fig.style.opacity = "1";

        const raf = requestAnimationFrame(() => {
            const to = fig.getBoundingClientRect();
            if (!to.width || !to.height) return;

            const scaleX = from.width / to.width;
            const scaleY = from.height / to.height;
            const dx = from.left + from.width / 2 - (to.left + to.width / 2);
            const dy = from.top + from.height / 2 - (to.top + to.height / 2);

            fig.style.transition = "none";
            fig.style.transform = `translate3d(${dx}px,${dy}px,0) scale(${scaleX},${scaleY})`;
            void fig.offsetWidth;
            fig.style.transition = "transform .82s cubic-bezier(.16,1,.3,1)";
            fig.style.transform = "translate3d(0,0,0) scale(1,1)";
        });

        return () => cancelAnimationFrame(raf);
    }, [isOpen, lbIndex]);

    useEffect(() => {
        if (!isOpen) return;

        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                close();
                return;
            }
            if (event.key === "ArrowRight") {
                step(1);
                return;
            }
            if (event.key === "ArrowLeft") {
                step(-1);
                return;
            }
            if (event.key !== "Tab") return;

            const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button, a[href]");
            if (!focusables || focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && (active === first || active === dialogRef.current)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, close, step]);

    useEffect(() => {
        if (!isOpen) return;
        let startX: number | null = null;
        let startY: number | null = null;

        const onStart = (event: TouchEvent) => {
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        };

        const onEnd = (event: TouchEvent) => {
            if (startX === null || startY === null) return;
            const dx = event.changedTouches[0].clientX - startX;
            const dy = event.changedTouches[0].clientY - startY;
            if (Math.abs(dx) > 54 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
            else if (dy > 90) close();
            startX = null;
            startY = null;
        };

        window.addEventListener("touchstart", onStart, { passive: true });
        window.addEventListener("touchend", onEnd, { passive: true });
        return () => {
            window.removeEventListener("touchstart", onStart);
            window.removeEventListener("touchend", onEnd);
        };
    }, [isOpen, step, close]);

    useEffect(() => {
        if (!isOpen) return;
        const { body, documentElement } = document;
        const gutter = window.innerWidth - documentElement.clientWidth;
        const prevOverflow = body.style.overflow;
        const prevPadding = body.style.paddingRight;

        body.style.overflow = "hidden";
        if (gutter > 0) body.style.paddingRight = `${gutter}px`;

        return () => {
            body.style.overflow = prevOverflow;
            body.style.paddingRight = prevPadding;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            restoreRef.current?.focus();
            restoreRef.current = null;
            return;
        }
        restoreRef.current = document.activeElement as HTMLElement | null;
        dialogRef.current?.focus();
    }, [isOpen]);

    return (
        <>
            <section style={{ padding: "0 clamp(14px,3.5vw,44px) clamp(60px,12vh,150px)" }}>
                <div style={{
                    maxWidth: 1500, margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
                    gap: "clamp(6px,1vw,14px)",
                    alignItems: "start",
                }}>
                    {images.map((image, index) => {
                        const ratio = image.width && image.height ? image.width / image.height : 3 / 2;
                        const delay = Math.min(index * 40, 600);
                        return (
                            <button
                                key={image.fileName}
                                type="button"
                                onClick={(event) => open(index, event.currentTarget.getBoundingClientRect())}
                                aria-label={`Open full screen: ${title}, shot ${index + 1} of ${images.length}`}
                                style={{
                                    appearance: "none", padding: 0, border: 0,
                                    background: "#101014", display: "block", width: "100%",
                                    position: "relative", overflow: "hidden",
                                    cursor: "zoom-in", aspectRatio: String(ratio),
                                    animation: `gridItemIn .7s cubic-bezier(.16,1,.3,1) ${delay}ms both`,
                                }}
                            >
                                <Image
                                    src={image.fileUrl}
                                    alt={`${title} — shot ${index + 1}`}
                                    fill
                                    sizes={GRID_SIZES}
                                    quality={85}
                                    placeholder="blur"
                                    blurDataURL={image.blurDataURL}
                                    priority={index < 4}
                                    style={{
                                        objectFit: "cover",
                                        transition: "transform .8s cubic-bezier(.16,1,.3,1)",
                                    }}
                                />
                                <span className="gc-caption">
                                    <span style={{ opacity: 0.5 }}>{seriesIndex(index)}</span>
                                    <span>Open ↗</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section style={{
                borderTop: "1px solid rgba(237,234,229,.12)",
                padding: "clamp(60px,12vh,130px) clamp(14px,3.5vw,44px) clamp(70px,14vh,150px)",
            }}>
                <div style={{ maxWidth: 1500, margin: "0 auto" }}>
                    <div style={{
                        display: "flex", flexWrap: "wrap", alignItems: "flex-end",
                        justifyContent: "space-between", gap: 16,
                        marginBottom: "clamp(24px,4vh,44px)",
                    }}>
                        <p data-reveal style={{ margin: 0, fontSize: 10, letterSpacing: ".3em", textTransform: "uppercase", opacity: .5 }}>All series</p>
                        <p data-reveal style={{ margin: 0, fontSize: 10, letterSpacing: ".24em", textTransform: "uppercase", opacity: .4 }}>{chapterCountLabel(allFolders.length)}</p>
                    </div>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
                        gap: "clamp(8px,1.4vw,18px)",
                    }}>
                        {allFolders.map((gallery, index) => {
                            const isCurrent = gallery.path === currentSlug;
                            return (
                                <Link
                                    key={gallery.path}
                                    href={`/${gallery.path}`}
                                    data-reveal
                                    className="album-card"
                                    aria-current={isCurrent ? "page" : undefined}
                                    style={{
                                        position: "relative", display: "block",
                                        aspectRatio: "16/10", overflow: "hidden",
                                        background: "#101014", textDecoration: "none",
                                        borderColor: isCurrent ? "#ff3b1f" : undefined,
                                    }}
                                >
                                    {gallery.preview_image && (
                                        <Image
                                            src={`/${gallery.preview_image}`}
                                            alt=""
                                            fill
                                            sizes={CARD_SIZES}
                                            quality={82}
                                            className="album-card-img"
                                            style={{ opacity: isCurrent ? 1 : 0.6 }}
                                        />
                                    )}
                                    <span className="album-card-overlay" aria-hidden="true" />
                                    <span className="album-card-body">
                                        <span style={{ fontSize: 9, letterSpacing: ".26em", textTransform: "uppercase", color: isCurrent ? "#ff3b1f" : "rgba(237,234,229,.55)" }}>
                                            {seriesIndex(index)} · {formatDate(gallery.date)}{isCurrent && " · current"}
                                        </span>
                                        <span style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(.9rem,1.7vw,1.35rem)", lineHeight: 1.05, letterSpacing: "-.02em", textTransform: "uppercase", color: "#edeae5" }}>
                                            {gallery.title}
                                        </span>
                                        {gallery.circuit && (
                                            <span style={{ fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", opacity: .45, color: "#edeae5" }}>
                                                {gallery.circuit}
                                            </span>
                                        )}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {isOpen && current && (
                <div
                    ref={dialogRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${title} — shot ${lbIndex + 1} of ${images.length}`}
                    tabIndex={-1}
                    style={{
                        position: "fixed", inset: 0, zIndex: 200,
                        background: "rgba(8,8,10,.97)", display: "flex", flexDirection: "column",
                        animation: "fadeIn .22s ease both", outline: "none",
                    }}
                >
                    <div
                        aria-hidden="true"
                        style={{
                            position: "absolute", inset: 0,
                            backgroundImage: `url(${current.blurDataURL})`,
                            backgroundSize: "cover", backgroundPosition: "center",
                            filter: "blur(60px) saturate(1.3)", transform: "scale(1.2)",
                            opacity: .28, pointerEvents: "none",
                            transition: "background-image .4s ease",
                        }}
                    />

                    <div style={{
                        position: "relative", flexShrink: 0, display: "flex", alignItems: "center",
                        justifyContent: "space-between", gap: 14,
                        padding: "clamp(10px,2vh,16px) clamp(14px,3.5vw,40px)",
                        fontSize: 10, letterSpacing: ".24em", textTransform: "uppercase",
                    }}>
                        <span style={{ opacity: .45 }}>
                            {seriesIndex(lbIndex)} / {String(images.length).padStart(2, "0")}
                        </span>
                        <button type="button" onClick={close} className="btn-close">
                            Close ✕
                        </button>
                    </div>

                    <div style={{
                        position: "relative", flex: 1, minHeight: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "0 clamp(8px,3vw,56px)", overflow: "hidden",
                    }}>
                        <div ref={figRef} style={{
                            position: "relative", maxWidth: "100%", maxHeight: "100%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            willChange: "transform",
                        }}>
                            <Image
                                key={current.fileUrl}
                                src={current.fileUrl}
                                alt={`${title} — shot ${lbIndex + 1}`}
                                width={current.width || 2400}
                                height={current.height || 1600}
                                sizes={FULL_SIZES}
                                quality={92}
                                placeholder="blur"
                                blurDataURL={current.blurDataURL}
                                priority
                                onLoad={() => setLbLoading(false)}
                                style={{
                                    width: "auto", height: "auto",
                                    maxWidth: "100%", maxHeight: "100%",
                                    objectFit: "contain",
                                    userSelect: "none", display: "block",
                                }}
                            />
                            {lbLoading && (
                                <span
                                    aria-hidden="true"
                                    style={{
                                        position: "absolute", bottom: 12, right: 12,
                                        width: 18, height: 18, borderRadius: "50%",
                                        border: "1.5px solid rgba(237,234,229,.2)", borderTopColor: "#ff3b1f",
                                        animation: "spin .7s linear infinite", zIndex: 2,
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    <div style={{
                        position: "relative", flexShrink: 0, display: "flex", alignItems: "center",
                        justifyContent: "space-between", gap: 14,
                        padding: "clamp(10px,2vh,14px) clamp(14px,3.5vw,40px) clamp(16px,4vh,28px)",
                    }}>
                        {images.length > 1 && (
                            <button type="button" onClick={() => step(-1)} className="btn-nav" aria-label="Previous photo">←</button>
                        )}
                        <span style={{
                            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                            minWidth: 0,
                        }}>
                            <span style={{
                                maxWidth: "100%",
                                fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase",
                                opacity: .35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                                {current.fileName.replace(/\.[^.]+$/, "")}
                                {current.width > 0 && ` · ${current.width}×${current.height}`}
                            </span>
                            <a
                                href={current.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="lb-original"
                            >
                                Original file ↗
                            </a>
                        </span>
                        {images.length > 1 && (
                            <button type="button" onClick={() => step(1)} className="btn-nav" aria-label="Next photo">→</button>
                        )}
                    </div>

                    <div aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
                        {neighbours.map((image) => (
                            <Image
                                key={image.fileUrl}
                                src={image.fileUrl}
                                alt=""
                                width={image.width || 2400}
                                height={image.height || 1600}
                                sizes={FULL_SIZES}
                                quality={92}
                                loading="eager"
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
