/**
 * CMS API Client
 *
 * Client-side functions for reading and writing blog posts via the CMS API.
 */

import { format, isValid, parse, parseISO } from 'date-fns';
import type {
  BlogSchema,
  CreatePostParams,
  CreatePostResponse,
  DeployStatusResponse,
  ListPostsParams,
  ListPostsResponse,
  MediaLibraryResponse,
  ReadPostResult,
  TaxonomyRenameResponse,
  ToggleDraftResponse,
  ToggleStickyResponse,
} from '@/types';
import { cmsFetch } from './auth';
import { setCategoryMap } from './category';

function encodeSlug(slug: string): string {
  return encodeURIComponent(slug);
}

function safeParseDateString(dateStr: string): Date {
  if (dateStr.includes('T')) {
    const isoDate = parseISO(dateStr);
    if (isValid(isoDate)) return isoDate;
  }

  const localDate = parse(dateStr, 'yyyy-MM-dd HH:mm:ss', new Date());
  if (isValid(localDate)) return localDate;

  const dateOnly = parse(dateStr, 'yyyy-MM-dd', new Date());
  if (isValid(dateOnly)) return dateOnly;

  console.warn(`[CMS API] 日期解析失败： "${dateStr}"，已使用当前时间`);
  return new Date();
}

function serializeDateForApi(date: Date): string {
  return format(date, 'yyyy-MM-dd HH:mm:ss');
}

function prepareFrontmatterForApi(frontmatter: BlogSchema): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value instanceof Date) {
      result[key] = serializeDateForApi(value);
    } else if (value !== undefined && value !== null) {
      result[key] = value;
    }
  }
  return result;
}

async function readJsonError(response: Response, fallback: string): Promise<Error> {
  const errorData = (await response.json().catch(() => ({}))) as { error?: string };
  return new Error(errorData.error || `${fallback}： ${response.status}`);
}

export async function readPost(postId: string): Promise<ReadPostResult> {
  const response = await cmsFetch(`/api/cms/read?postId=${encodeSlug(postId)}`);

  if (!response.ok) throw await readJsonError(response, '文章读取失败');

  const data = await response.json();
  if (data.frontmatter.date && typeof data.frontmatter.date === 'string') {
    data.frontmatter.date = safeParseDateString(data.frontmatter.date);
  }
  if (data.frontmatter.updated && typeof data.frontmatter.updated === 'string') {
    data.frontmatter.updated = safeParseDateString(data.frontmatter.updated);
  }

  return data as ReadPostResult;
}

export async function writePost(
  postId: string,
  frontmatter: BlogSchema,
  content: string,
  categoryMappings?: Record<string, string>,
): Promise<void> {
  const response = await cmsFetch('/api/cms/write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      postId,
      frontmatter: prepareFrontmatterForApi(frontmatter),
      content,
      categoryMappings,
    }),
  });

  if (!response.ok) throw await readJsonError(response, '文章保存失败');
}

export async function listPosts(params?: ListPostsParams): Promise<ListPostsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.category) searchParams.set('category', params.category);
  if (params?.tag) searchParams.set('tag', params.tag);
  if (params?.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.order) searchParams.set('order', params.order);

  const queryString = searchParams.toString();
  const response = await cmsFetch(`/api/cms/list${queryString ? `?${queryString}` : ''}`);

  if (!response.ok) throw await readJsonError(response, '文章列表读取失败');
  return response.json();
}

export async function createPost(params: CreatePostParams): Promise<CreatePostResponse> {
  const response = await cmsFetch('/api/cms/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) throw await readJsonError(response, '文章创建失败');
  return response.json();
}

export async function toggleDraft(postId: string): Promise<ToggleDraftResponse> {
  const response = await cmsFetch('/api/cms/toggle-draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId }),
  });

  if (!response.ok) throw await readJsonError(response, '文章发布状态切换失败');
  return response.json();
}

export async function toggleSticky(postId: string): Promise<ToggleStickyResponse> {
  const response = await cmsFetch('/api/cms/toggle-sticky', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId }),
  });

  if (!response.ok) throw await readJsonError(response, '文章置顶状态切换失败');
  return response.json();
}

export interface CMSConfigResponse {
  projectRoot: string;
  contentDir: string;
  categoryMap: Record<string, string>;
  online?: boolean;
}

let cachedConfig: CMSConfigResponse | null = null;

export async function getCMSConfig(): Promise<CMSConfigResponse> {
  if (cachedConfig) return cachedConfig;

  const response = await cmsFetch('/api/cms/config');
  if (!response.ok) throw new Error('后台配置读取失败');

  const config: CMSConfigResponse = await response.json();
  cachedConfig = config;
  setCategoryMap(config.categoryMap);
  return config;
}

export interface UploadImageResponse {
  success: boolean;
  path: string;
  url: string;
}

export async function uploadImage(file: File): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.set('file', file);

  const response = await cmsFetch('/api/cms/upload-image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw await readJsonError(response, '图片上传失败');
  return response.json();
}

export async function listMediaImages(): Promise<MediaLibraryResponse> {
  const response = await cmsFetch('/api/cms/media');
  if (!response.ok) throw await readJsonError(response, '媒体库读取失败');
  return response.json();
}

export async function deleteMediaImage(path: string, sha?: string): Promise<void> {
  const response = await cmsFetch('/api/cms/media', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, sha }),
  });

  if (!response.ok) throw await readJsonError(response, '图片删除失败');
}

export async function saveCategoryMap(categoryMap: Record<string, string>): Promise<void> {
  const response = await cmsFetch('/api/cms/taxonomy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'saveCategoryMap', categoryMap }),
  });

  if (!response.ok) throw await readJsonError(response, '分类映射保存失败');
  cachedConfig = null;
  setCategoryMap(categoryMap);
}

export async function renameTaxonomy(target: 'category' | 'tag', from: string, to: string): Promise<TaxonomyRenameResponse> {
  const response = await cmsFetch('/api/cms/taxonomy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'rename', target, from, to }),
  });

  if (!response.ok) throw await readJsonError(response, target === 'category' ? '分类重命名失败' : '标签重命名失败');
  cachedConfig = null;
  return response.json();
}

export async function getDeployStatus(): Promise<DeployStatusResponse> {
  const response = await cmsFetch('/api/cms/deploy-status');
  if (!response.ok) throw await readJsonError(response, '发布状态读取失败');
  return response.json();
}

export async function readSiteConfig(): Promise<string> {
  const response = await cmsFetch('/api/cms/site-config');

  if (!response.ok) throw await readJsonError(response, '站点配置读取失败');

  const data = (await response.json()) as { content: string };
  return data.content;
}

export async function writeSiteConfig(content: string): Promise<void> {
  const response = await cmsFetch('/api/cms/site-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) throw await readJsonError(response, '站点配置保存失败');
  cachedConfig = null;
}