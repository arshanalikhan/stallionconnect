import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// The site is mostly static, so the default (no incremental cache) is fine
// on the free plan. See https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig({});
