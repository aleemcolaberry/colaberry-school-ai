import type { NextConfig } from "next";

// When deploying to a project site (e.g. GitHub Pages at /<repo>/), the CI sets
// NEXT_PUBLIC_BASE_PATH to that sub-path. Empty for root deploys and local dev.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

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
  // Serve under a sub-path when set (prefixes _next/ assets automatically).
  basePath,
};

export default nextConfig;
