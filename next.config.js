/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  env: {
    VITE_GEMINI_API_KEY_4: process.env.VITE_GEMINI_API_KEY_4 || process.env.GEMINI_API_KEY,
  },
};

module.exports = nextConfig;
