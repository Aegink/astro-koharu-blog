import yaml from 'js-yaml';

export type Env = {
  GITHUB_TOKEN?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
  CMS_ADMIN_PASSWORD?: string;
  GITHUB_COMMITTER_NAME?: string;
  GITHUB_COMMITTER_EMAIL?: string;
};

type GitHubFile = { content: string; sha: string };
type Frontmatter = Record<string, unknown>;

const CONTENT_DIR = 'src/content/blog';
const CONFIG_PATH = 'config/site.yaml';

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export function checkAuth(request: Request, env: Env): Response | null {
  if (!env.GITHUB_TOKEN) return json({ error: 'Missing GITHUB_TOKEN' }, 500);
  if (!env.CMS_ADMIN_PASSWORD) return json({ error: 'Missing CMS_ADMIN_PASSWORD' }, 500);
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!provided || provided !== env.CMS_ADMIN_PASSWORD) return json({ error: 'Unauthorized' }, 401);
  return null;
}

export function repo(env: Env) {
  return {
    owner: env.GITHUB_OWNER || 'Aegink',
    name: env.GITHUB_REPO || 'astro-koharu-blog',
    branch: env.GITHUB_BRANCH || 'main',
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

async function gh<T>(env: Env, apiPath: string, init: RequestInit = {}): Promise<T> {
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
  const data = await gh<{ content: string; sha: string }>(
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
  return gh(env, `/repos/${owner}/${name}/contents/${encodePath(filePath)}`, {
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
  return gh(env, `/repos/${owner}/${name}/contents/${encodePath(filePath)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}
export function isSafeMarkdownPath(postId: string): boolean {
  return !postId.startsWith('/') && !postId.includes('..') && !postId.includes('\\') && /\.mdx?$/.test(postId);
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

export async function listMarkdownFiles(env: Env): Promise<string[]> {
  const { owner, name, branch } = repo(env);
  const tree = await gh<{ tree: Array<{ path: string; type: string }> }>(
    env,
    `/repos/${owner}/${name}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
  );
  return tree.tree
    .filter((item) => item.type === 'blob' && item.path.startsWith(`${CONTENT_DIR}/`) && /\.mdx?$/.test(item.path))
    .map((item) => item.path.slice(CONTENT_DIR.length + 1));
}

export { CONFIG_PATH, CONTENT_DIR };
