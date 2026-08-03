/** @type {import('next').NextConfig} */
const nextConfig = {
    ...(process.env.NEXT_OUTPUT === "standalone" ? { output: "standalone" } : {}),
    reactStrictMode: true,
    poweredByHeader: false,
    images: {
        formats: ["image/avif", "image/webp"],
        deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1620, 1920, 2048, 2560, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        qualities: [82, 85, 88, 90, 92],
        minimumCacheTTL: 86400,
        dangerouslyAllowSVG: false,
        contentDispositionType: "inline",
    },
};

export default nextConfig;
