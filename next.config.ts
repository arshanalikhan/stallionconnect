import type { NextConfig } from "next";

/**
 * Build targets
 * - Default (`npm run build`): normal Next.js server build. This is what the
 *   Cloudflare deployment (final phase) will use via the OpenNext adapter.
 * - GitHub Pages preview (`npm run build:pages`): fully static export served
 *   from https://<user>.github.io/<repo>/, so everything lives under a basePath.
 */
const isPagesPreview = process.env.GITHUB_PAGES === "true";
const basePath = isPagesPreview ? process.env.PAGES_BASE_PATH || "/stallionconnect" : "";

const nextConfig: NextConfig = {
  // Files named `*.server.ts(x)` (API routes, admin) need a server. They are
  // part of the normal build but left out of the static GitHub Pages export.
  pageExtensions: isPagesPreview
    ? ["tsx", "ts", "jsx", "js"]
    : ["tsx", "ts", "jsx", "js", "server.tsx", "server.ts"],
  // Cloudflare notes:
  // - cacheComponents / partialPrefetching stay off: they hang on the
  //   Workers runtime (setTimeout semantics differ).
  // - Images are served unoptimised (pre-compressed WebP, imported statically)
  //   so we never depend on a paid image-transformation service.
  images: { unoptimized: true },
  ...(isPagesPreview && {
    output: "export",
    basePath,
    trailingSlash: true,
  }),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_STATIC_PREVIEW: isPagesPreview ? "true" : "false",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
