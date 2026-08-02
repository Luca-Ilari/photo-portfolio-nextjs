import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Series not found",
    robots: { index: false, follow: false },
};

export default function NotFound() {
    return (
        <main
            style={{
                minHeight: "100svh",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: "clamp(18px,3.4vh,34px)",
                padding: "0 clamp(14px,3.5vw,44px)",
            }}
        >
            <p style={{ margin: 0, fontSize: 10, letterSpacing: ".3em", textTransform: "uppercase", opacity: .5 }}>
                Error 404
            </p>
            <h1
                style={{
                    margin: 0,
                    fontFamily: "var(--font-archivo), system-ui, sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(2.4rem,11vw,8rem)",
                    lineHeight: .92,
                    letterSpacing: "-.04em",
                    textTransform: "uppercase",
                }}
            >
                Series<br />
                <span style={{ color: "#ff3b1f" }}>not found</span>
            </h1>
            <p style={{ margin: 0, maxWidth: "48ch", fontSize: "clamp(12px,1.4vw,14px)", lineHeight: 1.85, opacity: .6 }}>
                The page you are looking for does not exist, or the series was removed from the archive.
            </p>
            <Link href="/" className="next-arrow" aria-label="Back to the archive" style={{ marginTop: 8 }}>
                ←
            </Link>
        </main>
    );
}
