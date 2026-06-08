export function loadConfig(env = {}) {
  const issuer = requiredUrl(env.ISSUER, "ISSUER").replace(/\/+$/, "");
  const clientId = required(env.OIDC_CLIENT_ID, "OIDC_CLIENT_ID");
  const clientSecret = optional(env.OIDC_CLIENT_SECRET);
  const redirectUris = required(env.ALLOWED_REDIRECT_URIS, "ALLOWED_REDIRECT_URIS")
    .split(",")
    .map((uri) => uri.trim())
    .filter(Boolean);
  if (redirectUris.length === 0) {
    throw new Error("ALLOWED_REDIRECT_URIS 至少需要一個 redirect_uri");
  }

  const privateJwk = parsePrivateJwk(env.PRIVATE_JWK);
  if (privateJwk && !privateJwk.kid) {
    throw new Error("PRIVATE_JWK 必須包含 kid");
  }

  return {
    issuer,
    clientId,
    clientSecret,
    redirectUris,
    privateJwk,
    adminToken: optional(env.ADMIN_TOKEN),
    authorizationCodeTtlSeconds: Number(env.AUTHORIZATION_CODE_TTL_SECONDS ?? 300),
    tokenTtlSeconds: Number(env.TOKEN_TTL_SECONDS ?? 3600)
  };
}

function optional(value) {
  return String(value ?? "").trim();
}

function required(value, name) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    throw new Error(`缺少必要設定：${name}`);
  }
  return normalized;
}

function requiredUrl(value, name) {
  const normalized = required(value, name);
  try {
    return new URL(normalized).toString();
  } catch {
    throw new Error(`${name} 必須是有效 URL`);
  }
}

function parsePrivateJwk(value) {
  const raw = optional(value);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("PRIVATE_JWK 必須是有效的單行 JSON");
  }
}
