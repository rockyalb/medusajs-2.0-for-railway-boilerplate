const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Uses Next's built-in Sharp optimizer in the existing Railway service.
    formats: ["image/webp"],
    // Bucket objects are ULID-keyed and never rewritten, so optimized
    // variants can live a day instead of 4h; keeps repeat visits off Sharp.
    minimumCacheTTL: 86400,
    qualities: [50, 75],
    remotePatterns: [
      {
        // Current media bucket (hero, category cards, product images).
        protocol: "https",
        hostname: "bucket-production-a1707.up.railway.app",
        port: "",
        pathname: "/medusa-media/**",
      },
      {
        // Older catalog images still use this bucket alongside the current one.
        protocol: "https",
        hostname: "bucket-production-9ef2.up.railway.app",
        port: "",
        pathname: "/medusa-media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      ...(process.env.NEXT_PUBLIC_BASE_URL
        ? [{ // Note: needed to serve images from /public folder
            protocol: process.env.NEXT_PUBLIC_BASE_URL.startsWith("https") ? "https" : "http",
            hostname: new URL(process.env.NEXT_PUBLIC_BASE_URL).hostname,
            port: new URL(process.env.NEXT_PUBLIC_BASE_URL).port,
          }]
        : []),
      ...(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
        ? [{ // Note: only needed when using local-file for product media
            protocol: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.startsWith("https") ? "https" : "http",
            hostname: new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL).hostname,
            port: new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL).port,
          }]
        : []),
      { // Note: can be removed after deleting demo products
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      { // Note: can be removed after deleting demo products
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      { // Note: can be removed after deleting demo products
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      ...(process.env.NEXT_PUBLIC_MINIO_ENDPOINT ? [{ // Note: needed when using MinIO bucket storage for media
        protocol: "https",
        hostname: new URL(process.env.NEXT_PUBLIC_MINIO_ENDPOINT.includes("://") ? process.env.NEXT_PUBLIC_MINIO_ENDPOINT : `https://${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}`).hostname,
      }] : []),
    ],
  }
}

module.exports = nextConfig
