const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

const imageRemotePatternFromEnv = (value, fallbackProtocol = "https") => {
  if (!value) {
    return null
  }

  try {
    const url = new URL(
      value.startsWith("http://") || value.startsWith("https://")
        ? value
        : `${fallbackProtocol}://${value}`
    )

    return {
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
      port: url.port,
    }
  } catch {
    return null
  }
}

const envRemotePatterns = [
  imageRemotePatternFromEnv(process.env.NEXT_PUBLIC_BASE_URL, "http"),
  imageRemotePatternFromEnv(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL, "http"),
  imageRemotePatternFromEnv(process.env.NEXT_PUBLIC_MINIO_ENDPOINT),
].filter(Boolean)

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**.up.railway.app",
      },
      {
        protocol: "https",
        hostname: "bucket-production-a1707.up.railway.app",
      },
      {
        protocol: "https",
        hostname: "ycorganics.com",
      },
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
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      ...envRemotePatterns,
    ],
  },
  serverRuntimeConfig: {
    port: process.env.PORT || 3000
  }
}

module.exports = nextConfig
