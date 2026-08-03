import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Archivo } from "next/font/google";
import "./globals.css";
import ScrollProgress from "@/components/ScrollProgress";

const jetbrainsMono = localFont({
    src: [
        { path: "./fonts/JetBrainsMono-Regular.woff2", weight: "400", style: "normal" },
        { path: "./fonts/JetBrainsMono-Bold.woff2", weight: "700", style: "normal" },
    ],
    variable: "--font-jetbrains",
    display: "swap",
});

const archivo = Archivo({
    subsets: ["latin"],
    weight: ["400", "600", "800"],
    variable: "--font-archivo",
    display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lucailari.photo";

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Luca Ilari — Motorsport Photography",
        template: "%s — Luca Ilari",
    },
    description:
        "Photography portfolio by Luca Ilari. Motorsport, panning, WEC · GT · Historics.",
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        siteName: "Luca Ilari",
        locale: "en_GB",
        url: "/",
        title: "Luca Ilari — Motorsport Photography",
        description:
            "Photography portfolio by Luca Ilari. Motorsport, panning, WEC · GT · Historics.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Luca Ilari — Motorsport Photography",
        description:
            "Photography portfolio by Luca Ilari. Motorsport, panning, WEC · GT · Historics.",
    },
    robots: { index: true, follow: true },
};

export const viewport: Viewport = {
    themeColor: "#08080a",
    colorScheme: "dark",
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${jetbrainsMono.variable} ${archivo.variable}`}>
            <body>
                <ScrollProgress />

                <div className="grain" aria-hidden="true" />

                {children}
            </body>
        </html>
    );
}
