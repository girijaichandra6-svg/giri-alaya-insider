import { defineWorkspace } from "vitest/config";

// --------------------------------------------------------------------------
// vitest workspace
// Points to the admin app's vitest config which handles all test discovery.
// Run `pnpm vitest run` from the root to execute all vitest suites.
//
// When other packages add vitest in the future, add their config paths here.
// --------------------------------------------------------------------------

export default defineWorkspace([
  "apps/admin/vitest.config.ts",
]);
