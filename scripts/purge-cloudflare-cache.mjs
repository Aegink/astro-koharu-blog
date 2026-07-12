#!/usr/bin/env node

const API_BASE = 'https://api.cloudflare.com/client/v4';
const DEFAULT_ZONE_NAME = 'wangyouboke.com';

const dryRun = process.argv.includes('--dry-run') || process.env.CLOUDFLARE_PURGE_DRY_RUN === '1';
const optional = readEnv('CLOUDFLARE_PURGE_OPTIONAL') === '1';
const zoneIdFromEnv = readEnv('CLOUDFLARE_ZONE_ID');
const zoneName = readEnv('CLOUDFLARE_ZONE_NAME') || DEFAULT_ZONE_NAME;

function readEnv(name) {
  return process.env[name]?.trim() ?? '';
}

function mask(value) {
  if (value.length <= 8) {
    return '***';
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function requireApiToken() {
  const token = readEnv('CLOUDFLARE_API_TOKEN');

  if (!token) {
    throw new Error('缺少 CLOUDFLARE_API_TOKEN，无法清理 Cloudflare 缓存。');
  }

  return token;
}

async function requestCloudflare(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${requireApiToken()}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success !== true) {
    const messages =
      payload?.errors?.map((error) => `${error.code ?? 'unknown'} ${error.message ?? ''}`.trim()).join('; ') ||
      response.statusText;

    throw new Error(`Cloudflare API 请求失败：${response.status} ${messages}`);
  }

  return payload;
}

async function resolveZoneId() {
  if (zoneIdFromEnv) {
    return zoneIdFromEnv;
  }

  if (!zoneName) {
    throw new Error('缺少 CLOUDFLARE_ZONE_ID 或 CLOUDFLARE_ZONE_NAME。');
  }

  const payload = await requestCloudflare(`/zones?name=${encodeURIComponent(zoneName)}&status=active`, { method: 'GET' });
  const zone = payload.result?.[0];

  if (!zone?.id) {
    throw new Error(`未找到 Cloudflare Zone：${zoneName}`);
  }

  return zone.id;
}

async function purgeEverything(zoneId) {
  await requestCloudflare(`/zones/${zoneId}/purge_cache`, {
    method: 'POST',
    body: JSON.stringify({ purge_everything: true }),
  });
}

function handleFailure(error) {
  const message = error instanceof Error ? error.message : String(error);

  if (optional) {
    console.warn(`Cloudflare 缓存清理跳过：${message}`);
    return;
  }

  console.error(message);
  process.exit(1);
}

if (dryRun) {
  const zoneLabel = zoneIdFromEnv ? mask(zoneIdFromEnv) : zoneName;
  console.log(`干运行：将清理 Cloudflare 缓存，zone=${zoneLabel}，模式=purge_everything。`);
  process.exit(0);
}

try {
  const zoneId = await resolveZoneId();

  console.log(`开始清理 Cloudflare 缓存，zone=${mask(zoneId)}，模式=purge_everything。`);
  await purgeEverything(zoneId);
  console.log('Cloudflare 缓存清理完成。');
} catch (error) {
  handleFailure(error);
}
