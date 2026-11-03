import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// The site is mostly static; the default (no incremental cache) suits the free plan.
export default defineCloudflareConfig({});
