import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/VoidGallery',
  assetPrefix: '/VoidGallery/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
