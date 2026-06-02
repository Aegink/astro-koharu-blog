import yaml from 'js-yaml';

export type Env = {
  GITHUB_TOKEN?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
  CMS_ADMIN_PASSWORD?: string;
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

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export function checkAuth(request: Request, env: Env): Response | null {
  if (!env.GITHUB_TOKEN) return json({ error: '缺少 GITHUB_TOKEN，请先在 Cloudflare Pages 环境变量中配置。' }, 500);
  if (!env.CMS_ADMIN_PASSWORD) return json({ error: '缺少 CMS_ADMIN_PASSWORD，请先配置后台登录密码。' }, 500);
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!provided || provided !== env.CMS_ADMIN_PASSWORD) return json({ error: '后台密码不正确，请重新登录。' }, 401);
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
      categories.flatMap((item) => (Array.isArray(item) ? item : [item])).filter((item): item is string => typeof item === 'string'),
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
  const parsed = (yaml.load(config.content) || {}) as Record<string, unknown>;
  parsed.categoryMap = categoryMap;
  const next = yaml.dump(parsed, { flowLevel: 2, lineWidth: -1, quotingType: "'", forceQuotes: false, sortKeys: false });
  await writeFile(env, CONFIG_PATH, next, 'chore(cms): update category map', config.sha);
}

function addCategoryMappings(configContent: string, mappings?: Record<string, string>): string | null {
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
  if (next && next !== config.content) await writeFile(env, CONFIG_PATH, next, 'chore(cms): update category mappings', config.sha);
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
