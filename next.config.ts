import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents / partialPrefetching are intentionally off: they hang on
  // the Cloudflare Workers runtime (setTimeout semantics differ).
  // Images are served as-is from /public. Avoids paid image transformations
  // on Cloudflare; we pre-optimise assets (WebP) at build time instead.
  images: { unoptimized: true },
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

// Lets `next dev` access Cloudflare bindings (D1 etc.) locally.
import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
