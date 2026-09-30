/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  productionBrowserSourceMaps: false,
  output: "standalone",
  
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    path: "/_next/image",
    loader: "default",
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
  },

  env: {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    BASE_URL_PROD: process.env.NEXT_PUBLIC_BASE_URL_PROD,
    FRONT_BASE_URL: process.env.NEXT_PUBLIC_FRONT_URL,
    FRONT_BASE_URL_PROD: process.env.NEXT_PUBLIC_FRONT_URL_PROD,
    AWS_BASE_URL: process.env.NEXT_PUBLIC_AWS_BASE_URL,
    AWS_BASE_URL_PROD: process.env.NEXT_PUBLIC_AWS_BASE_URL_PROD,
    AWS_CDN: process.env.NEXT_PUBLIC_AWS_CDN_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_CRYPTO_KEY: process.env.NEXT_CRYPTO_KEY,
    NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
    NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  },

  trailingSlash: false,
};

export default nextConfig;
