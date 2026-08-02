import type { MetadataRoute } from "next";
import { getFolders } from "@/actions/actions";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lucailari.photo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const folders = await getFolders();

    return [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        ...folders.map((folder) => ({
            url: `${siteUrl}/${folder.path}`,
            lastModified: folder.date ? new Date(folder.date) : new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.8,
        })),
    ];
}
