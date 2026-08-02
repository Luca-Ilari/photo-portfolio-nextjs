import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GalleryClient from "@/components/GalleryClient";
import GalleryAnimations from "@/components/GalleryAnimations";
import NextSeriesSection from "@/components/NextSeriesSection";
import { galleryProperty, getFolders, getGallerySettings, getImages } from "@/actions/actions";
import { formatDate, photoCountLabel, seriesIndex } from "@/lib/format";

export const dynamic = "force-dynamic";

type GalleryPageProps = {
    params: Promise<{ gallery: string }>;
};

export async function generateMetadata({ params }: GalleryPageProps): Promise<Metadata> {
    const { gallery } = await params;
    const settings = await getGallerySettings(gallery);

    if (!settings.title) {
        return { title: "Serie non trovata" };
    }

    const description =
        settings.blurb ||
        [settings.circuit, formatDate(settings.date)].filter(Boolean).join(" · ") ||
        `Serie fotografica ${settings.title} di Luca Ilari.`;

    return {
        title: settings.title,
        description,
        alternates: { canonical: `/${settings.path}` },
        openGraph: {
            type: "article",
            title: `${settings.title} — Luca Ilari`,
            description,
            url: `/${settings.path}`,
            images: settings.preview_image ? [{ url: `/${settings.preview_image}`, alt: settings.title }] : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title: `${settings.title} — Luca Ilari`,
            description,
            images: settings.preview_image ? [`/${settings.preview_image}`] : undefined,
        },
    };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
    const { gallery } = await params;

    const [images, settings, allFolders] = await Promise.all([
        getImages(gallery),
        getGallerySettings(gallery),
        getFolders(),
    ]);

    if (!settings.title) notFound();

    const currentIdx = allFolders.findIndex((folder) => folder.path === gallery);
    const nextGallery: galleryProperty | undefined =
        currentIdx >= 0 && allFolders.length > 1
            ? allFolders[(currentIdx + 1) % allFolders.length]
            : undefined;

    const display = formatDate(settings.date);
    const countLabel = photoCountLabel(images.length);
    const index = seriesIndex(currentIdx >= 0 ? currentIdx : 0);

    return (
        <>
            <GalleryAnimations />

            <header
                style={{
                    position: "fixed", top: 0, left: 0, right: 0, zIndex: 110,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 16, padding: "16px clamp(14px,3.5vw,44px)",
                    mixBlendMode: "difference",
                }}
            >
                <Link
                    href="/"
                    style={{
                        fontFamily: "var(--font-archivo), system-ui, sans-serif", fontWeight: 800,
                        fontSize: 13, letterSpacing: ".22em", textTransform: "uppercase",
                        color: "#edeae5", textDecoration: "none",
                    }}
                >
                    Luca Ilari
                </Link>
                <div
                    style={{
                        display: "flex", alignItems: "center",
                        gap: "clamp(12px,2.6vw,28px)",
                        fontSize: 10, letterSpacing: ".24em",
                        textTransform: "uppercase", opacity: 0.75,
                    }}
                >
                    <span>{index} · {settings.title}</span>
                </div>
            </header>

            <main style={{ position: "relative", zIndex: 2 }}>

                <section
                    style={{
                        padding: "clamp(96px,16vh,180px) clamp(14px,3.5vw,44px) clamp(34px,7vh,72px)",
                    }}
                >
                    <div style={{ maxWidth: 1500, margin: "0 auto" }}>

                        <Link
                            href="/"
                            data-reveal
                            className="back-link"
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 12,
                                padding: "0 0 clamp(24px,4.5vh,48px)",
                                color: "#edeae5", fontFamily: "inherit",
                                fontSize: 10, letterSpacing: ".26em",
                                textTransform: "uppercase",
                                textDecoration: "none",
                            }}
                        >
                            <span aria-hidden="true">←</span><span>Tutte le serie</span>
                        </Link>

                        <h1
                            data-reveal
                            data-delay="50"
                            style={{
                                margin: 0,
                                fontFamily: "var(--font-archivo), system-ui, sans-serif", fontWeight: 800,
                                fontSize: "clamp(2.4rem,11vw,9rem)", lineHeight: 0.9,
                                letterSpacing: "-.04em", textTransform: "uppercase",
                            }}
                        >
                            {settings.title}
                        </h1>

                        <div
                            data-reveal
                            data-delay="120"
                            style={{
                                display: "flex", flexWrap: "wrap",
                                gap: "10px clamp(16px,3.4vw,40px)",
                                marginTop: "clamp(20px,3.6vh,40px)", paddingTop: 18,
                                borderTop: "1px solid rgba(237,234,229,.14)",
                                fontSize: 10, letterSpacing: ".24em",
                                textTransform: "uppercase", opacity: 0.6,
                            }}
                        >
                            {settings.circuit && <span>{settings.circuit}</span>}
                            {display && <span>{display}</span>}
                            <span>{countLabel}</span>
                            <span style={{ color: "#ff3b1f", opacity: 1 }}>
                                Tocca per l&apos;alta risoluzione
                            </span>
                        </div>

                        {settings.blurb && (
                            <p
                                data-reveal
                                data-delay="180"
                                style={{
                                    margin: "clamp(20px,3.6vh,38px) 0 0",
                                    maxWidth: "62ch",
                                    fontSize: "clamp(12px,1.4vw,14px)",
                                    lineHeight: 1.85, opacity: 0.7,
                                }}
                            >
                                {settings.blurb}
                            </p>
                        )}
                    </div>
                </section>

                <GalleryClient
                    images={images}
                    allFolders={allFolders}
                    currentSlug={gallery}
                    title={settings.title}
                />

                {nextGallery && nextGallery.path !== gallery && (
                    <NextSeriesSection href={`/${nextGallery.path}`} title={nextGallery.title} />
                )}

            </main>
        </>
    );
}
