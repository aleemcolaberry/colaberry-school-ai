import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Emit a fully static site to ./out — deployable to any web host
  // (Netlify, Vercel, S3/CloudFront, nginx, Apache, GitHub Pages, etc.).
  output: "export",
  // Plain <img> tags are used (not next/image); disable the optimizer so
  // the static export needs no Node image server at runtime.
  images: { unoptimized: true },
  // Emit /path/index.html so routes resolve on static hosts without rewrites.
  trailingSlash: true,
};

export default nextConfig;
