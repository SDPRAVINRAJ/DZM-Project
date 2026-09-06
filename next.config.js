const isProd = process.env.NODE_ENV === "production";
const repoName = "DZM-Project";
const basePath = isProd ? `/${repoName}` : "";

const nextConfig = {
  output: "export",
  basePath: basePath,
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    VITE_GEMINI_API_KEY_4: process.env.VITE_GEMINI_API_KEY_4 || process.env.GEMINI_API_KEY,
  },
};

module.exports = nextConfig;
