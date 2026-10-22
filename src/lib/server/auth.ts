import { betterAuth, getCurrentAdapter, type BetterAuthPlugin } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
import { genericOAuth } from "better-auth/plugins/generic-oauth";
import { oidcConfig } from "./oidc.ts";
import { username } from "better-auth/plugins/username";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import * as env from "$app/env/private";
import { db } from "./db.ts";

/** OAuth providers with credentials set. The sign-in pages offer only these. */
const socialProviders = {
  ...(env.GITHUB_CLIENT_ID &&
    env.GITHUB_CLIENT_SECRET && {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        mapProfileToUser: (profile: { login: string }) => ({ username: profile.login }),
      },
    }),
  ...(env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_SECRET && {
      google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
    }),
};

const oidc = oidcConfig(env);
export type OAuthProvider = {
  id: "github" | "google" | "oidc";
  name: string;
};
export const oauthProviders: OAuthProvider[] = [];
if (socialProviders.github) oauthProviders.push({ id: "github", name: "GitHub" });
if (socialProviders.google) oauthProviders.push({ id: "google", name: "Google" });
if (oidc.length) oauthProviders.push({ id: "oidc", name: env.OIDC_PROVIDER_NAME });

/**
 * Friends invite each other by @username, so every account needs one. Email
 * sign-up asks for it (and the username plugin validates it); everyone else
 * gets a free one derived from their provider login or email.
 */
const usernamesForEveryone = {
  id: "usernames-for-everyone",
  init: (ctx) => ({
    options: {
      databaseHooks: {
        user: {
          create: {
            async before(user, context) {
              if (context?.path === "/sign-up/email") return;
              const fields = user as typeof user & { username?: string | null };
              const base = toUsername(fields.username || user.email.split("@")[0]);
              const adapter = await getCurrentAdapter(ctx.adapter);
              for (let n = 1; ; n++) {
                const suffix = n === 1 ? "" : String(n);
                const candidate = base.slice(0, 30 - suffix.length) + suffix;
                const taken = await adapter.findOne({
                  model: "user",
                  where: [{ field: "username", value: candidate }],
                });
                if (!taken) return { data: { ...user, username: candidate } };
              }
            },
          },
        },
      },
    },
  }),
} satisfies BetterAuthPlugin;

/** Lowercase, only [a-z0-9_.], 3–30 characters (the username plugin's rules). */
function toUsername(raw: string) {
  const name = raw
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, "_")
    .slice(0, 30);
  return name.length >= 3 ? name : `${name}_user`;
}

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: { db, type: "sqlite" },
  emailAndPassword: { enabled: true },
  socialProviders,
  advanced: { database: { joins: true } },
  // usernamesForEveryone runs before username() validates what it picked; sveltekitCookies must stay last
  plugins: [
    usernamesForEveryone,
    username(),
    genericOAuth({ config: oidc }),
    sveltekitCookies(getRequestEvent),
  ],
});

/** Creates or updates Better Auth's tables. Idempotent; runs on startup before our migrations. */
export async function migrateAuth() {
  await (await getMigrations(auth.options)).runMigrations();
}
