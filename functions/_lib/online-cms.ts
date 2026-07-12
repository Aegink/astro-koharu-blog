import yaml from 'js-yaml';

export type Env = {
  GITHUB_TOKEN?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
  CMS_ADMIN_PASSWORD?: string;
  CMS_SESSION_SECRET?: string;
  GITHUB_COMMITTER_NAME?: string;
  GITHUB_COMMITTER_EMAIL?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_PAGES_PROJECT_NAME?: string;
  CF_ACCOUNT_ID?: string;
  CF_API_TOKEN?: string;
  CF_PAGES_PROJECT_NAME?: string;
};

export type GitHubFile = { content: string; sha: string };
export type GitHubTreeItem = {
  path: string;
  mode?: string;
  type: 'blob' | 'tree' | string;
  sha: string;
  size?: number;
  url?: string;
};
export type Frontmatter = Record<string, unknown>;

const CONTENT_DIR = 'src/content/blog';
const CONFIG_PATH = 'config/site.yaml';
const MEDIA_ROOT_DIR = 'public/img';
const MEDIA_DIR = 'public/img/cms';

export function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}

const SESSION_COOKIE = 'koharu_cms_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_FAILURES = 5;
const loginFailures = new Map<string, { count: number; resetAt: number }>();

function encodeBase64Url(value: Uint8Array): string {
  let binary = '';
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(value: string): Uint8Array {
  const base64 = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function sessionSecret(env: Env): string {
  return env.CMS_SESSION_SECRET || env.CMS_ADMIN_PASSWORD || '';
}

async function signSessionPayload(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return encodeBase64Url(new Uint8Array(signature));
}

async function createSessionToken(env: Env): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = encodeBase64Url(new TextEncoder().encode(JSON.stringify({ expiresAt, nonce: crypto.randomUUID() })));
  return `${payload}.${await signSessionPayload(payload, sessionSecret(env))}`;
}

async function verifySessionToken(token: string, env: Env): Promise<boolean> {
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !sessionSecret(env)) return false;

  try {
    const expected = await signSessionPayload(payload, sessionSecret(env));
    if (expected.length !== signature.length) return false;
    let mismatch = 0;
    for (let index = 0; index < expected.length; index += 1)
      mismatch |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
    if (mismatch !== 0) return false;

    const decoded = new TextDecoder().decode(decodeBase64Url(payload));
    const data = JSON.parse(decoded) as { expiresAt?: number };
    return typeof data.expiresAt === 'number' && data.expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function cookieValue(request: Request, name: string): string {
  const cookies = request.headers.get('cookie') || '';
  for (const part of cookies.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return '';
}

function loginKey(request: Request): string {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

function isLoginBlocked(key: string): boolean {
  const failure = loginFailures.get(key);
  if (!failure) return false;
  if (failure.resetAt <= Date.now()) {
    loginFailures.delete(key);
    return false;
  }
  return failure.count >= MAX_LOGIN_FAILURES;
}

function recordLoginFailure(key: string) {
  const current = loginFailures.get(key);
  if (!current || current.resetAt <= Date.now()) {
    loginFailures.set(key, { count: 1, resetAt: Date.now() + LOGIN_WINDOW_MS });
    return;
  }
  current.count += 1;
}

function secureCookie(request: Request): string {
  return new URL(request.url).protocol === 'https:' ? '; Secure' : '';
}

export async function createCmsSession(request: Request, env: Env): Promise<Response> {
  if (!env.GITHUB_TOKEN) return json({ error: '缺少 GITHUB_TOKEN，请先在 Cloudflare Pages 环境变量中配置。' }, 500);
  if (!env.CMS_ADMIN_PASSWORD) return json({ error: '缺少 CMS_ADMIN_PASSWORD，请先配置后台登录密码。' }, 500);

  const key = loginKey(request);
  if (isLoginBlocked(key)) return json({ error: '登录失败次数过多，请 15 分钟后再试。' }, 429);

  const body = (await request.json().catch(() => ({}))) as { password?: string };
  if (body.password !== env.CMS_ADMIN_PASSWORD) {
    recordLoginFailure(key);
    return json({ error: '后台密码不正确，请重新登录。' }, 401);
  }

  loginFailures.delete(key);
  const token = await createSessionToken(env);
  const cookie = `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${secureCookie(request)}`;
  return json({ success: true, expiresIn: SESSION_TTL_SECONDS }, 200, { 'set-cookie': cookie });
}

export function clearCmsSession(request: Request): Response {
  const cookie = `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secureCookie(request)}`;
  return json({ success: true }, 200, { 'set-cookie': cookie });
}

export async function checkAuth(request: Request, env: Env): Promise<Response | null> {
  if (!env.GITHUB_TOKEN) return json({ error: '缺少 GITHUB_TOKEN，请先在 Cloudflare Pages 环境变量中配置。' }, 500);
  if (!env.CMS_ADMIN_PASSWORD) return json({ error: '缺少 CMS_ADMIN_PASSWORD，请先配置后台登录密码。' }, 500);
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token || !(await verifySessionToken(token, env))) return json({ error: '登录会话无效或已过期，请重新登录。' }, 401);
  return null;
}

export function repo(env: Env) {
  return {
    owner: env.GITHUB_OWNER || 'Aegink',
    name: env.GITHUB_REPO || 'astro-koharu-blog',
    branch: env.GITHUB_BRANCH || 'main',
  };
}

export function cloudflareConfig(env: Env) {
  return {
    accountId: env.CLOUDFLARE_ACCOUNT_ID || env.CF_ACCOUNT_ID || '',
    apiToken: env.CLOUDFLARE_API_TOKEN || env.CF_API_TOKEN || '',
    projectName: env.CLOUDFLARE_PAGES_PROJECT_NAME || env.CF_PAGES_PROJECT_NAME || 'astro-koharu-boke',
  };
}

function encodePath(filePath: string): string {
  return filePath.split('/').map(encodeURIComponent).join('/');
}

function decodeBase64(content: string): string {
  const binary = atob(content.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64(content: string): string {
  const bytes = new TextEncoder().encode(content);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function githubRequest<T>(env: Env, apiPath: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`https://api.github.com${apiPath}`, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      'content-type': 'application/json',
      'user-agent': 'astro-koharu-online-cms',
      'x-github-api-version': '2022-11-28',
      ...(init.headers || {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
}

export async function readFile(env: Env, filePath: string): Promise<GitHubFile> {
  const { owner, name, branch } = repo(env);
  const data = await githubRequest<{ content: string; sha: string }>(
    env,
    `/repos/${owner}/${name}/contents/${encodePath(filePath)}?ref=${encodeURIComponent(branch)}`,
  );
  return { content: decodeBase64(data.content), sha: data.sha };
}

export async function writeFile(env: Env, filePath: string, content: string, message: string, sha?: string) {
  const { owner, name, branch } = repo(env);
  const body: Record<string, unknown> = { message, content: encodeBase64(content), branch };
  if (sha) body.sha = sha;
  if (env.GITHUB_COMMITTER_NAME && env.GITHUB_COMMITTER_EMAIL) {
    body.committer = { name: env.GITHUB_COMMITTER_NAME, email: env.GITHUB_COMMITTER_EMAIL };
  }
  return githubRequest(env, `/repos/${owner}/${name}/contents/${encodePath(filePath)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function writeBase64File(env: Env, filePath: string, base64Content: string, message: string, sha?: string) {
  const { owner, name, branch } = repo(env);
  const body: Record<string, unknown> = { message, content: base64Content, branch };
  if (sha) body.sha = sha;
  if (env.GITHUB_COMMITTER_NAME && env.GITHUB_COMMITTER_EMAIL) {
    body.committer = { name: env.GITHUB_COMMITTER_NAME, email: env.GITHUB_COMMITTER_EMAIL };
  }
  return githubRequest(env, `/repos/${owner}/${name}/contents/${encodePath(filePath)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteFile(env: Env, filePath: string, message: string, sha: string) {
  const { owner, name, branch } = repo(env);
  const body: Record<string, unknown> = { message, sha, branch };
  if (env.GITHUB_COMMITTER_NAME && env.GITHUB_COMMITTER_EMAIL) {
    body.committer = { name: env.GITHUB_COMMITTER_NAME, email: env.GITHUB_COMMITTER_EMAIL };
  }
  return githubRequest(env, `/repos/${owner}/${name}/contents/${encodePath(filePath)}`, {
    method: 'DELETE',
    body: JSON.stringify(body),
  });
}

export function isSafeMarkdownPath(postId: string): boolean {
  return !postId.startsWith('/') && !postId.includes('..') && /\.mdx?$/.test(postId);
}

export function isSafeMediaPath(filePath: string): boolean {
  return filePath.startsWith(`${MEDIA_DIR}/`) && !filePath.includes('..') && /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(filePath);
}

export async function readFileAtRef(env: Env, filePath: string, ref: string): Promise<GitHubFile> {
  const { owner, name } = repo(env);
  const data = await githubRequest<{ content: string; sha: string }>(
    env,
    `/repos/${owner}/${name}/contents/${encodePath(filePath)}?ref=${encodeURIComponent(ref)}`,
  );
  return { content: decodeBase64(data.content), sha: data.sha };
}

function dateToString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

function normalizeYamlValue(value: unknown): unknown {
  if (value instanceof Date) return dateToString(value);
  if (Array.isArray(value)) return value.map(normalizeYamlValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, normalizeYamlValue(val)]));
  }
  return value;
}

export function parseMatter(fileContent: string): { frontmatter: Frontmatter; content: string } {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content: fileContent };
  const parsed = (yaml.load(match[1] || '') || {}) as Frontmatter;
  return { frontmatter: normalizeYamlValue(parsed) as Frontmatter, content: match[2] || '' };
}

export function dumpMatter(frontmatter: Frontmatter, content: string): string {
  const clean = Object.fromEntries(Object.entries(frontmatter).filter(([, value]) => value !== undefined && value !== null));
  const yamlText = yaml
    .dump(clean, { flowLevel: 2, lineWidth: -1, quotingType: "'", forceQuotes: false })
    .replace(/^(date|updated): '(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})'$/gm, '$1: $2');
  return `---\n${yamlText}---\n\n${content}`;
}

export function extractCategories(categories: unknown): string[] {
  if (!categories) return [];
  if (typeof categories === 'string') return [categories];
  if (!Array.isArray(categories)) return [];
  return [
    ...new Set(
      categories
        .flatMap((item) => (Array.isArray(item) ? item : [item]))
        .filter((item): item is string => typeof item === 'string'),
    ),
  ];
}

export function extractTags(tags: unknown): string[] {
  return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === 'string') : [];
}

export function slugify(value: string): string {
  const slug = value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `post-${Date.now()}`;
}

export async function getCategoryMap(env: Env): Promise<Record<string, string>> {
  const config = await readFile(env, CONFIG_PATH);
  const parsed = (yaml.load(config.content) || {}) as { categoryMap?: Record<string, string> };
  return parsed.categoryMap || {};
}

export async function replaceCategoryMap(env: Env, categoryMap: Record<string, string>) {
  const config = await readFile(env, CONFIG_PATH);
  const next = replaceCategoryMapContent(config.content, categoryMap);
  await writeFile(env, CONFIG_PATH, next, 'chore(cms): update category map', config.sha);
}

export function replaceCategoryMapContent(configContent: string, categoryMap: Record<string, string>): string {
  const parsed = (yaml.load(configContent) || {}) as Record<string, unknown>;
  parsed.categoryMap = categoryMap;
  return yaml.dump(parsed, { flowLevel: 2, lineWidth: -1, quotingType: "'", forceQuotes: false, sortKeys: false });
}

export function addCategoryMappings(configContent: string, mappings?: Record<string, string>): string | null {
  if (!mappings || Object.keys(mappings).length === 0) return null;
  const lines = configContent.split('\n');
  const output: string[] = [];
  let inMap = false;
  let inserted = false;
  const indent = '  ';
  for (const line of lines) {
    if (/^categoryMap:\s*$/.test(line)) {
      inMap = true;
      output.push(line);
      continue;
    }
    if (inMap && /^[A-Za-z]/.test(line) && !line.startsWith(' ') && !line.startsWith('#')) {
      if (!inserted) {
        for (const [name, slug] of Object.entries(mappings)) output.push(`${indent}${name}: ${slug}`);
        inserted = true;
      }
      inMap = false;
    }
    output.push(line);
  }
  if (inMap && !inserted) for (const [name, slug] of Object.entries(mappings)) output.push(`${indent}${name}: ${slug}`);
  return output.join('\n');
}

export async function updateCategoryMappings(env: Env, mappings?: Record<string, string>) {
  if (!mappings || Object.keys(mappings).length === 0) return;
  const config = await readFile(env, CONFIG_PATH);
  const next = addCategoryMappings(config.content, mappings);
  if (next && next !== config.content)
    await writeFile(env, CONFIG_PATH, next, 'chore(cms): update category mappings', config.sha);
}

export async function commitTextFiles(
  env: Env,
  updates: Array<{ path: string; content: string }>,
  message: string,
): Promise<{ commitSha: string; fileShas: Record<string, string> }> {
  if (updates.length === 0) return { commitSha: '', fileShas: {} };

  const { owner, name, branch } = repo(env);
  const ref = await githubRequest<{ object: { sha: string } }>(
    env,
    `/repos/${owner}/${name}/git/ref/heads/${encodePath(branch)}`,
  );
  const parent = await githubRequest<{ tree: { sha: string } }>(env, `/repos/${owner}/${name}/git/commits/${ref.object.sha}`);
  const fileShas: Record<string, string> = {};
  const tree = await Promise.all(
    updates.map(async (update) => {
      const blob = await githubRequest<{ sha: string }>(env, `/repos/${owner}/${name}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({ content: encodeBase64(update.content), encoding: 'base64' }),
      });
      fileShas[update.path] = blob.sha;
      return { path: update.path, mode: '100644', type: 'blob', sha: blob.sha };
    }),
  );

  const nextTree = await githubRequest<{ sha: string }>(env, `/repos/${owner}/${name}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: parent.tree.sha, tree }),
  });
  const commitBody: Record<string, unknown> = { message, tree: nextTree.sha, parents: [ref.object.sha] };
  if (env.GITHUB_COMMITTER_NAME && env.GITHUB_COMMITTER_EMAIL) {
    commitBody.committer = { name: env.GITHUB_COMMITTER_NAME, email: env.GITHUB_COMMITTER_EMAIL };
  }
  const commit = await githubRequest<{ sha: string }>(env, `/repos/${owner}/${name}/git/commits`, {
    method: 'POST',
    body: JSON.stringify(commitBody),
  });
  await githubRequest(env, `/repos/${owner}/${name}/git/refs/heads/${encodePath(branch)}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });

  return { commitSha: commit.sha, fileShas };
}

export async function listRepoTree(env: Env): Promise<GitHubTreeItem[]> {
  const { owner, name, branch } = repo(env);
  const tree = await githubRequest<{ tree: GitHubTreeItem[] }>(
    env,
    `/repos/${owner}/${name}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
  );
  return tree.tree;
}

export async function listMarkdownFiles(env: Env): Promise<string[]> {
  const tree = await listRepoTree(env);
  return tree
    .filter((item) => item.type === 'blob' && item.path.startsWith(`${CONTENT_DIR}/`) && /\.mdx?$/.test(item.path))
    .map((item) => item.path.slice(CONTENT_DIR.length + 1));
}

export async function listRecentCommits(env: Env, limit = 5) {
  const { owner, name, branch } = repo(env);
  return githubRequest<
    Array<{
      sha: string;
      html_url: string;
      commit: { message: string; author?: { name?: string; date?: string }; committer?: { name?: string; date?: string } };
    }>
  >(env, `/repos/${owner}/${name}/commits?sha=${encodeURIComponent(branch)}&per_page=${limit}`);
}

export { CONFIG_PATH, CONTENT_DIR, MEDIA_DIR, MEDIA_ROOT_DIR };
