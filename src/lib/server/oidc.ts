import type { GenericOAuthConfig } from "better-auth/plugins/generic-oauth";

export function oidcConfig(env: {
  OIDC_PROVIDER_NAME: string;
  OIDC_ISSUER?: string;
  OIDC_CLIENT_ID?: string;
  OIDC_CLIENT_SECRET?: string;
}): GenericOAuthConfig<"oidc">[] {
  const issuer = env.OIDC_ISSUER;
  const clientId = env.OIDC_CLIENT_ID;
  const clientSecret = env.OIDC_CLIENT_SECRET;
  if (!issuer && !clientId && !clientSecret) return [];
  if (!issuer || !clientId || !clientSecret) {
    throw new Error("OIDC_ISSUER, OIDC_CLIENT_ID and OIDC_CLIENT_SECRET must all be set");
  }
  const url = new URL(issuer);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("OIDC_ISSUER must be an HTTPS issuer URL without credentials, query or hash");
  }
  return [
    {
      providerId: "oidc",
      name: env.OIDC_PROVIDER_NAME,
      discoveryUrl: `${issuer.replace(/\/+$/, "")}/.well-known/openid-configuration`,
      clientId,
      clientSecret,
      scopes: ["openid", "profile", "email"],
      pkce: true,
      requireIdTokenVerification: true,
      accountSubject: ({ tokens, profile }) => {
        if (
          !tokens.idToken ||
          profile.iss !== issuer ||
          typeof profile.sub !== "string" ||
          !profile.sub
        ) {
          throw new Error("OIDC requires an ID token with the configured issuer and subject");
        }
        return JSON.stringify([issuer, profile.sub]);
      },
    },
  ];
}
