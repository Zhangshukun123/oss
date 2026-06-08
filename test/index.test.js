import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import worker from "../src/index.js";

describe("Worker 入口設定", () => {
  it("discovery endpoint 不應因尚未設定私鑰而回傳 Cloudflare 1101", async () => {
    const response = await worker.fetch(
      new Request("https://sso.example.com/.well-known/openid-configuration"),
      {
        ISSUER: "https://sso.example.com",
        OIDC_CLIENT_ID: "openai-sso",
        ALLOWED_REDIRECT_URIS: "https://external.auth.openai.com/sso/oidc/callback"
      }
    );

    const metadata = await response.json();
    assert.equal(response.status, 200);
    assert.equal(metadata.issuer, "https://sso.example.com");
    assert.equal(metadata.jwks_uri, "https://sso.example.com/jwks.json");
  });

  it("discovery endpoint 不應因私鑰格式錯誤而回傳 Cloudflare 1101", async () => {
    const response = await worker.fetch(
      new Request("https://sso.example.com/.well-known/openid-configuration"),
      {
        ISSUER: "https://sso.example.com",
        OIDC_CLIENT_ID: "openai-sso",
        ALLOWED_REDIRECT_URIS: "https://external.auth.openai.com/sso/oidc/callback",
        PRIVATE_JWK: "not-json"
      }
    );

    const metadata = await response.json();
    assert.equal(response.status, 200);
    assert.equal(metadata.issuer, "https://sso.example.com");
  });
});
