import { createAuthClient } from "better-auth/svelte";
import type { auth } from "#lib/server/auth.ts";
import { InferServerPlugin, usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [usernameClient(), InferServerPlugin<typeof auth, "generic-oauth">()],
});
