import Image from "next/image";
import { galleryProperty, getFolders, getImages, imagesProperty } from "@/actions/actions";
import { formatDate, photoCountLabel, seriesIndex } from "@/lib/format";
import HomeAnimations from "@/components/HomeAnimations";
import CoverSection from "@/components/CoverSection";
import StripSection from "@/components/StripSection";
import ArchiveCard from "@/components/ArchiveCard";

export const dynamic = "force-dynamic";

export default async function Home() {
    const folders: galleryProperty[] = await getFolders();
    const albumCount = folders.length;

    const loaded = await Promise.all(
        folders.map(async (folder) => [folder.path, await getImages(folder.path)] as const),
    );
    const galleryImages: Record<string, imagesProperty[]> = Object.fromEntries(loaded);

    const coverBlur = (folder: galleryProperty) =>
        galleryImages[folder.path]?.find((image) => image.fileUrl === `/${folder.preview_image}`)?.blurDataURL;

    const totalPhotos = Object.values(galleryImages).reduce((acc, images) => acc + images.length, 0);

    const tags: string[] = [];
    for (const folder of folders) {
        if (folder.circuit) {
            const short = folder.circuit.split(" ")[0];
            if (!tags.includes(short)) tags.push(short);
        }
        const year = folder.date.split("-")[0];
        if (year && !tags.includes(year)) tags.push(year);
    }
    const heroTags = tags.length > 0
        ? tags.slice(0, 4).join(" · ")
        : folders.map((folder) => folder.title).join(" · ");

    const uniqueLocations = new Set(
        folders.filter((folder) => folder.circuit).map((folder) => folder.circuit!),
    ).size || albumCount;

    const years = folders.map((folder) => folder.date.split("-")[0]).filter(Boolean).sort();
    const oldestYear = years[0] || new Date().getFullYear().toString();
    const newestYear = years[years.length - 1] || oldestYear;
    const singleYear = oldestYear === newestYear;
    const yearRange = singleYear ? oldestYear : `${oldestYear} — ${newestYear}`;

    const hero = folders[0];
    const heroBlur = hero ? coverBlur(hero) : undefined;

    return (
        <>
            <HomeAnimations />

            <div style={{ position: "relative", background: "#08080a", overflowX: "clip" }}>

                <header style={{
                    position: "fixed", top: 0, left: 0, right: 0, zIndex: 110,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 16, padding: "12px clamp(14px,3.5vw,44px)", mixBlendMode: "difference",
                }}>
                    <span style={{
                        fontFamily: "var(--font-archivo), system-ui, sans-serif", fontWeight: 800,
                        fontSize: 13, letterSpacing: ".22em", textTransform: "uppercase",
                        color: "#edeae5",
                    }}>Luca Ilari</span>
                    <a
                        href="#archivio"
                        className="jump-archive"
                        aria-label={`Vai all'archivio: ${albumCount} serie tra cui scegliere`}
                    >
                        <span>{albumCount} serie</span>
                        <span className="jump-arrow" aria-hidden="true">↓</span>
                    </a>
                </header>

                <main>

                    <section data-fx="hero" style={{ position: "relative", height: "100svh", overflow: "hidden" }}>
                        <div data-hero-img style={{ position: "absolute", inset: "-8% 0", willChange: "transform" }}>
                            {hero?.preview_image && (
                                <Image
                                    src={`/${hero.preview_image}`}
                                    alt={hero.title}
                                    fill
                                    sizes="120vw"
                                    quality={90}
                                    priority
                                    placeholder={heroBlur ? "blur" : "empty"}
                                    blurDataURL={heroBlur}
                                    style={{
                                        objectFit: "cover",
                                        filter: "contrast(1.06) saturate(.94)",
                                    }}
                                />
                            )}
                            <div style={{
                                position: "absolute", inset: 0,
                                background: "linear-gradient(180deg,rgba(8,8,10,.72) 0%,rgba(8,8,10,.12) 42%,rgba(8,8,10,.94) 100%)",
                            }} />
                        </div>
                        <div style={{
                            position: "relative", height: "100%", display: "flex",
                            flexDirection: "column", justifyContent: "flex-end",
                            padding: "0 clamp(14px,3.5vw,44px) clamp(24px,5vh,52px)",
                        }}>
                            <div data-hero-title style={{ willChange: "transform" }}>
                                <h1 style={{ margin: 0 }}>
                                    <span style={{ display: "block", overflow: "hidden", paddingBottom: ".04em" }}>
                                        <span data-rise style={{
                                            display: "block",
                                            fontFamily: "var(--font-archivo), system-ui, sans-serif", fontWeight: 800,
                                            fontSize: "clamp(3.1rem,14.5vw,13.5rem)", lineHeight: .84,
                                            letterSpacing: "-.035em", textTransform: "uppercase",
                                        }}>Luca</span>
                                    </span>
                                    <span style={{ display: "block", overflow: "hidden", paddingBottom: ".04em" }}>
                                        <span data-rise style={{
                                            display: "block",
                                            fontFamily: "var(--font-archivo), system-ui, sans-serif", fontWeight: 800,
                                            fontSize: "clamp(3.1rem,14.5vw,13.5rem)", lineHeight: .84,
                                            letterSpacing: "-.035em", textTransform: "uppercase", color: "#ff3b1f",
                                        }}>Ilari</span>
                                    </span>
                                </h1>
                            </div>
                            <div data-hero-foot style={{
                                display: "flex", flexWrap: "wrap", alignItems: "flex-end",
                                justifyContent: "space-between", gap: 20,
                                marginTop: "clamp(18px,3.4vh,38px)", paddingTop: 16,
                                borderTop: "1px solid rgba(237,234,229,.16)",
                                opacity: 0, animation: "fadeIn 1.2s ease .85s forwards", willChange: "transform",
                            }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <span style={{
                                        fontSize: 9, letterSpacing: ".32em", textTransform: "uppercase",
                                        opacity: .45, display: "flex", alignItems: "center", gap: 8,
                                    }}>
                                        <span aria-hidden="true" style={{
                                            display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                                            background: "#ff3b1f",
                                            boxShadow: "0 0 0 0 rgba(255,59,31,.4)",
                                            animation: "latestPulse 2s ease-in-out infinite",
                                        }} />
                                        Latest
                                    </span>
                                    <span style={{
                                        fontFamily: "var(--font-archivo), system-ui, sans-serif", fontWeight: 800,
                                        fontSize: "clamp(.75rem,1.4vw,1rem)",
                                        letterSpacing: "-.01em", textTransform: "uppercase",
                                        color: "#edeae5", lineHeight: 1.1,
                                    }}>
                                        {hero?.title ?? ""}
                                    </span>
                                    {hero?.date && (
                                        <span style={{ fontSize: 9, letterSpacing: ".24em", textTransform: "uppercase", opacity: .4 }}>
                                            {formatDate(hero.date)}
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px,3vw,34px)", fontSize: 10, letterSpacing: ".26em", textTransform: "uppercase", opacity: .6 }}>
                                    <span>{heroTags}</span>
                                    <span aria-hidden="true" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, animation: "cueDrift 2.4s ease-in-out infinite" }}>
                                        <span>Scroll</span>
                                        <span style={{ width: 1, height: 34, background: "linear-gradient(180deg,rgba(237,234,229,.85),rgba(237,234,229,0))" }} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section style={{ position: "relative", zIndex: 2, padding: "clamp(72px,15vh,170px) clamp(14px,3.5vw,44px) clamp(48px,9vh,110px)" }}>
                        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
                            <p data-reveal style={{ margin: "0 0 clamp(26px,5vh,54px)", fontSize: 10, letterSpacing: ".3em", textTransform: "uppercase", opacity: .5 }}>01 — Archivio</p>
                            <blockquote style={{
                                margin: 0,
                                maxWidth: "52ch",
                                borderLeft: "2px solid #ff3b1f",
                                paddingLeft: "clamp(16px,2.5vw,28px)",
                            }}>
                                <p data-reveal style={{
                                    margin: 0,
                                    fontFamily: "var(--font-archivo), system-ui, sans-serif",
                                    fontWeight: 400,
                                    fontSize: "clamp(1rem,2.2vw,1.55rem)",
                                    lineHeight: 1.6,
                                    letterSpacing: "-.01em",
                                    color: "#edeae5",
                                    fontStyle: "italic",
                                }}>
                                    We used to look up at the sky and wonder at our place in the{" "}
                                    <span style={{ color: "#ff3b1f", fontStyle: "normal", fontWeight: 700 }}>stars.</span>
                                    <br />
                                    <span style={{ opacity: .5 }}>
                                        Now we just look down, and worry about our place in the dirt.
                                    </span>
                                </p>
                            </blockquote>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "clamp(18px,3vw,48px)", marginTop: "clamp(46px,9vh,110px)", paddingTop: 26, borderTop: "1px solid rgba(237,234,229,.14)" }}>
                                <div data-reveal>
                                    <span data-count={totalPhotos} style={{ display: "block", fontFamily: "var(--font-archivo), system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(2.2rem,5vw,3.6rem)", lineHeight: 1, letterSpacing: "-.03em" }}>0</span>
                                    <p style={{ margin: "10px 0 0", fontSize: 10, letterSpacing: ".26em", textTransform: "uppercase", opacity: .48 }}>Scatti in archivio</p>
                                </div>
                                <div data-reveal data-delay="70">
                                    <span data-count={albumCount} style={{ display: "block", fontFamily: "var(--font-archivo), system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(2.2rem,5vw,3.6rem)", lineHeight: 1, letterSpacing: "-.03em" }}>0</span>
                                    <p style={{ margin: "10px 0 0", fontSize: 10, letterSpacing: ".26em", textTransform: "uppercase", opacity: .48 }}>Capitoli</p>
                                </div>
                                <div data-reveal data-delay="140">
                                    <span data-count={uniqueLocations} style={{ display: "block", fontFamily: "var(--font-archivo), system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(2.2rem,5vw,3.6rem)", lineHeight: 1, letterSpacing: "-.03em" }}>0</span>
                                    <p style={{ margin: "10px 0 0", fontSize: 10, letterSpacing: ".26em", textTransform: "uppercase", opacity: .48 }}>Luoghi</p>
                                </div>
                                <div data-reveal data-delay="210">
                                    <span style={{
                                        display: "block",
                                        fontFamily: "var(--font-archivo), system-ui, sans-serif", fontWeight: 800,
                                        fontSize: singleYear ? "clamp(2.2rem,5vw,3.6rem)" : "clamp(1.1rem,2.8vw,2rem)",
                                        lineHeight: 1, letterSpacing: "-.03em",
                                        whiteSpace: "nowrap",
                                    }}>
                                        {yearRange}
                                    </span>
                                    <p style={{ margin: "10px 0 0", fontSize: 10, letterSpacing: ".26em", textTransform: "uppercase", opacity: .48 }}>
                                        {singleYear ? "Anno" : "Anni"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {folders.map((gallery, position) => {
                        const images = galleryImages[gallery.path] ?? [];
                        const [line1, ...rest] = gallery.title.split(" ");
                        return (
                            <div key={gallery.path}>
                                <CoverSection
                                    title={gallery.title}
                                    line1={line1 || gallery.title}
                                    line2={rest.join(" ")}
                                    circuit={gallery.circuit ?? ""}
                                    display={formatDate(gallery.date)}
                                    countLabel={photoCountLabel(images.length)}
                                    blurb={gallery.blurb ?? ""}
                                    cover={gallery.preview_image ? `/${gallery.preview_image}` : ""}
                                    blurDataURL={coverBlur(gallery)}
                                    year={gallery.date.split("-")[0] ?? ""}
                                    index={seriesIndex(position)}
                                />
                                <StripSection
                                    slug={gallery.path}
                                    title={gallery.title}
                                    index={seriesIndex(position)}
                                    countLabel={photoCountLabel(images.length)}
                                    photos={images}
                                />
                            </div>
                        );
                    })}

                    <section data-fx="marquee" aria-hidden="true" style={{ position: "relative", zIndex: 2, padding: "clamp(36px,7vh,80px) 0", borderTop: "1px solid rgba(237,234,229,.12)", borderBottom: "1px solid rgba(237,234,229,.12)", overflow: "hidden" }}>
                        <div data-marquee-row style={{ display: "flex", gap: 48, whiteSpace: "nowrap", willChange: "transform", fontFamily: "var(--font-archivo), system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(2rem,6.4vw,5rem)", lineHeight: 1, letterSpacing: "-.03em", textTransform: "uppercase" }}>
                            {[0, 1, 2, 3].map((repeat) => (
                                <span key={repeat} style={{ display: "flex", gap: 48, flexShrink: 0 }}>
                                    {folders.map((folder) => (
                                        <span key={folder.path}>
                                            {folder.title}<span style={{ color: "#ff3b1f" }}> · </span>
                                        </span>
                                    ))}
                                </span>
                            ))}
                        </div>
                    </section>

                    <section style={{ position: "relative", zIndex: 2, padding: "clamp(60px,12vh,140px) clamp(14px,3.5vw,44px) clamp(70px,14vh,160px)" }}>
                        <div
                            id="archivio"
                            style={{ maxWidth: 1500, margin: "0 auto", scrollMarginTop: "clamp(72px,10vh,110px)" }}
                        >
                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 18 }}>
                                <p data-reveal style={{ margin: 0, fontSize: 10, letterSpacing: ".3em", textTransform: "uppercase", opacity: .5 }}>Archivio — scegli la serie</p>
                                <p data-reveal style={{ margin: 0, fontSize: 10, letterSpacing: ".24em", textTransform: "uppercase", opacity: .4 }}>Tocca una foto per aprire</p>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "clamp(8px,1.2vw,16px)", marginTop: "clamp(24px,4vh,44px)" }}>
                                {folders.map((gallery, position) => (
                                    <ArchiveCard
                                        key={gallery.path}
                                        href={`/${gallery.path}`}
                                        previewImage={gallery.preview_image ? `/${gallery.preview_image}` : ""}
                                        blurDataURL={coverBlur(gallery)}
                                        index={seriesIndex(position)}
                                        display={formatDate(gallery.date)}
                                        title={gallery.title}
                                        countLabel={photoCountLabel((galleryImages[gallery.path] ?? []).length)}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    <footer style={{ position: "relative", zIndex: 2, borderTop: "1px solid rgba(237,234,229,.14)", padding: "clamp(52px,11vh,120px) clamp(14px,3.5vw,44px) clamp(28px,5vh,54px)" }}>
                        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 36 }}>
                            <div>
                                <a data-reveal href="mailto:luca.ilari@gmail.com" style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(1.3rem,5vw,3.4rem)", lineHeight: 1.02, letterSpacing: "-.03em", color: "#edeae5", wordBreak: "break-word" }}>luca.ilari@gmail.com</a>
                            </div>
                            <div data-reveal data-delay="70" style={{ display: "flex", gap: "clamp(14px,3vw,30px)", fontSize: 10, letterSpacing: ".24em", textTransform: "uppercase", opacity: .6 }}>
                                <a href="https://www.instagram.com/gufo__/" target="_blank" rel="noopener noreferrer" style={{ color: "#edeae5" }}>Instagram</a>
                            </div>
                        </div>
                        <p style={{ maxWidth: 1320, margin: "clamp(36px,7vh,80px) auto 0", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", opacity: .34 }}>© {new Date().getFullYear()} Luca Ilari — Tutti i diritti riservati</p>
                    </footer>

                </main>
            </div>
        </>
    );
}
