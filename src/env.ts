import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
  BETTER_AUTH_SECRET: {
    description: "Secret used by Better Auth to sign sessions and tokens (32+ chars)",
  },
  BETTER_AUTH_URL: {
    description: "Public base URL of the app, e.g. http://localhost:5173",
  },
  DATABASE_PATH: {
    description: "Path to the SQLite database file",
    schema: (value) => value || "local.db",
  },
  OIDC_PROVIDER_NAME: {
    description: "Display name for the OIDC sign-in provider",
    schema: (value) => value || "OpenID Connect",
  },
  OIDC_ISSUER: {
    description: "OIDC issuer URL. Set with both client credentials to enable sign-in",
    schema: (value) => value || undefined,
  },
  OIDC_CLIENT_ID: {
    description: "OIDC client ID",
    schema: (value) => value || undefined,
  },
  OIDC_CLIENT_SECRET: {
    description: "OIDC client secret",
    schema: (value) => value || undefined,
  },
  GITHUB_CLIENT_ID: {
    description: "GitHub OAuth app client ID. Leave unset (with the secret) to hide GitHub sign-in",
    schema: (value) => value || undefined,
  },
  GITHUB_CLIENT_SECRET: {
    description: "GitHub OAuth app client secret",
    schema: (value) => value || undefined,
  },
  GOOGLE_CLIENT_ID: {
    description: "Google OAuth client ID. Leave unset (with the secret) to hide Google sign-in",
    schema: (value) => value || undefined,
  },
  GOOGLE_CLIENT_SECRET: {
    description: "Google OAuth client secret",
    schema: (value) => value || undefined,
  },
});
