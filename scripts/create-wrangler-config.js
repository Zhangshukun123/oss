import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_CONFIG_PATH = "wrangler.deploy.toml";

export function validateDeployEnv(env) {
  const databaseId = String(env.D1_DATABASE_ID ?? "").trim();
  if (!databaseId) {
    throw new Error("缺少必要構建環境變數：D1_DATABASE_ID");
  }
  return {
    workerName: optionalValue(env.WORKER_NAME, "sso"),
    databaseName: optionalValue(env.D1_DATABASE_NAME, "openai_oidc_sso"),
    databaseId
  };
}

export function createWranglerConfig(env = process.env) {
  const config = validateDeployEnv(env);
  return `name = ${quoteToml(config.workerName)}
main = "src/index.js"
compatibility_date = "2026-06-08"
keep_vars = true

[vars]
ACCOUNT_DOMAIN = "sub23ycy.top"
ALLOWED_REDIRECT_URIS = "https://external.auth.openai.com/sso/oidc/yKmrufyORnLhNzDrqyiv9aVpC/callback"
ISSUER = "https://oss.zhangshukun2026.workers.dev"
OIDC_CLIENT_ID = "openai-sso"
OIDC_CLIENT_SECRET = "MyStr0ngS3cret!@#2026"
PRIVATE_JWK = "{\\"key_ops\\":[\\"sign\\"],\\"ext\\":true,\\"alg\\":\\"RS256\\",\\"kty\\":\\"RSA\\",\\"n\\":\\"nQk0M95Ph1cugW-2atZIFf-8Ix--E3Twr7rxKUtkx5ZDycIAp6gI4qOw43b_UiuMvCP8a07TP310FrVR70bXHuCNMuWVSGMwAym1EygB1Q2SWvf3xryIVq66kU_V8S1WinTOgIthkZ9USNyC_D_-E6O26-VrWnPOaq8aHfjYmLdBkgUzvp9O-69QOCGTsZ8ufxf2hqzhPUp4QVqy3__faGGpO3xKjZq8gFTvLSA2ghGX-HYaFnd8ej_eQ2oZabyUJaat4bRzOjsVll3IvLT9IlQI9Ej-na1uqjHnEM7pnbQdfQzPhTdhZhpIY2ciPBMgYcMMcZMkUeA_indUePMU-w\\",\\"e\\":\\"AQAB\\",\\"d\\":\\"JPzwf1EbQWEfEpzKBkMfqpLYcRt-bV3LfVDWkefwvnQd1m1sMxFIun1c4k76l5Ora_s77tibuGYnzFt8B5STgfHZQEZEUc8PFYei33a6a8DtGqEyiuyIXoZ8alK4LT0FF8qogy2RVzgEpb7O2XSHN4AFy213yk_hrE4_JBUji2CsQAtn1ivPGtQ8gG9TLUCb13eBBwfi4k32xYSZxJ4qyWvW4PV_UO6QRAfPk0zXMQX-blXfiv7MWjMu-BtVw2f6KFmRG6AB0GclHTNEjRdT3y0hm2TNkK4w7t4nHpMzpyXnP6WN2OmgnebkgA6DkI1upVWigBD73g-bqzkx8IFRbQ\\",\\"p\\":\\"zwyrL-faaXdGTPiK9u_7yyAlvKryPs-_DtjBVBaVTCQ_n4Q92QG2AGXLId3cSxJe0su6woKAw8jAU8W1l4gnDnXqBLehcwPi3z5lg4His5uaWFKkoMl08vb-lBwjkcnGKBU2gnALk-9tgFeehNoM69I67VnbTkOxLGi5hdMislU\\",\\"q\\":\\"wimMREZrQUyqXXJBawk8N5RTF_n61TSF1HekmenltIyFNKnhFDZldQGWFsqzsko0-xWGkLh3yh1tPvZdokQQiJMxKiKvIe_-4cR2-hK3AczTf5VnjayfNhqeCNI4B77xAwUyxiOACnez9sXB1pJsxkWtnutZAnEiFemU7L6WGg8\\",\\"dp\\":\\"LrNO0WlcTDmI88eDoJsUkgZYPKvaI-y7zV96i7rkRd5PM22ifZXzNTfAj4z5KT2lgapOH51L6d0X9E093kXpeUuDUzkQA183Bt-OChF7zsMkFxPc6h9Gb57iYQnPxAxc06GlP9qB4gY5Dp-0s4ZzL6WlgO-plYeTKM8eOV8cDlk\\",\\"dq\\":\\"luYfg3iPJwLkbRe9S-iziiaWpc28ajMVx9jsbkpgIgAMDq_wo_rawyLmePQ00F3n6zQBjzwurUBNhV-HyfLIPrzWuv6VyfRxzRkZtqUQ4i9EOKXvAyaj3jK1m_l1Xl_BhC1oFqHEg14g2as8SP0n2LiShS430TQH36vX-F7u3XU\\",\\"qi\\":\\"nOn2epYwObFs1gu5K5S8jqDZYsA2tWk8LJU7bFhzfe9MzydzYJyycO58O12pEXEF_rBUbPAXVG4JXICka5z2529gRMzCq71cNjKei2pWYkEInEi-GGXbU8AxbUOUxRWFTCaMNzzXtvylpDfLZDGZsI5sqFJ8YJGdVi4UeKYkAS0\\",\\"kid\\":\\"openai-sso-key\\",\\"use\\":\\"sig\\"}"
OPENAI_LOGIN_URL = "https://chatgpt.com/auth/login?sso=true&connection=conn_01KVCNH89KQV5A4SV725M3E1Q3"

[[d1_databases]]
binding = "DB"
database_name = ${quoteToml(config.databaseName)}
database_id = ${quoteToml(config.databaseId)}
`;
}

export async function writeWranglerConfig({
  env = process.env,
  outputPath = process.env.WRANGLER_DEPLOY_CONFIG || DEFAULT_CONFIG_PATH
} = {}) {
  const content = createWranglerConfig(env);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, content, "utf8");
  return outputPath;
}

function optionalValue(value, fallback) {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function quoteToml(value) {
  return JSON.stringify(String(value));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeWranglerConfig()
    .then((outputPath) => {
      console.log(`已生成臨時 Wrangler 設定：${outputPath}`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
