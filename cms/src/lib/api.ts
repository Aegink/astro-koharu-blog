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
  ListPostsParams,
  ListPostsResponse,
  ReadPostResult,
  ToggleDraftResponse,
  ToggleStickyResponse,
} from '@/types';
import { cmsFetch } from './auth';
import { setCategoryMap } from './category';

/**
 * Encode a slug for URL usage
 */
function encodeSlug(slug: string): string {
  return encodeURIComponent(slug);
}

/**
 * Safely parses a date string with fallback handling
 *
 * Supports multiple formats:
 * - "yyyy-MM-dd HH:mm:ss" (local time format)
 * - ISO 8601 format (e.g., "2026-01-03T12:00:00.000Z")
 *
 * @param dateStr - The date string to parse
 * @returns A valid Date object, or the current date if parsing fails
 */
function safeParseDateString(dateStr: string): Date {
  // Try ISO format first (contains 'T')
  if (dateStr.includes('T')) {
    const isoDate = parseISO(dateStr);
    if (isValid(isoDate)) {
      return isoDate;
    }
  }

  // Try local time format "yyyy-MM-dd HH:mm:ss"
  const localDate = parse(dateStr, 'yyyy-MM-dd HH:mm:ss', new Date());
  if (isValid(localDate)) {
    return localDate;
  }

  // Try date-only format "yyyy-MM-dd"
  const dateOnly = parse(dateStr, 'yyyy-MM-dd', new Date());
  if (isValid(dateOnly)) {
    return dateOnly;
  }

  // Fallback: return current date
  console.warn(`[CMS API] 日期解析失败： "${dateStr}"，已使用当前时间`);
  return new Date();
}

/**
 * Serialize a Date object to local time string for API transmission
 * Preserves the user's intended time without UTC conversion
 *
 * @param date - Date object to serialize
 * @returns Local time string in "yyyy-MM-dd HH:mm:ss" format
 */
function serializeDateForApi(date: Date): string {
  return format(date, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Prepare frontmatter for API transmission
 * Converts Date objects to local time strings to prevent JSON.stringify
 * from converting them to UTC ISO format
 *
 * @param frontmatter - BlogSchema frontmatter object
 * @returns Frontmatter with Date objects converted to strings
 */
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

/**
 * Reads a blog post from the CMS API
 *
 * @param postId - The post ID (e.g., 'note/front-end/theme.md')
 * @returns The frontmatter and content of the post
 * @throws Error if the request fails
 */
export async function readPost(postId: string): Promise<ReadPostResult> {
  const response = await cmsFetch(`/api/cms/read?postId=${encodeSlug(postId)}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `文章读取失败： ${response.status}`);
  }

  const data = await response.json();

  // Convert date strings to Date objects with safe parsing
  if (data.frontmatter.date && typeof data.frontmatter.date === 'string') {
    data.frontmatter.date = safeParseDateString(data.frontmatter.date);
  }
  if (data.frontmatter.updated && typeof data.frontmatter.updated === 'string') {
    data.frontmatter.updated = safeParseDateString(data.frontmatter.updated);
  }

  return data as ReadPostResult;
}

/**
 * Writes a blog post via the CMS API
 *
 * @param postId - The post ID (e.g., 'note/front-end/theme.md')
 * @param frontmatter - The post frontmatter
 * @param content - The post content (markdown)
 * @param categoryMappings - Optional new category mappings to add to config/site.yaml
 * @throws Error if the request fails
 */
export async function writePost(
  postId: string,
  frontmatter: BlogSchema,
  content: string,
  categoryMappings?: Record<string, string>,
): Promise<void> {
  const response = await cmsFetch('/api/cms/write', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      postId,
      frontmatter: prepareFrontmatterForApi(frontmatter),
      content,
      categoryMappings,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `文章保存失败： ${response.status}`);
  }
}

/**
 * Lists all blog posts with metadata and statistics
 *
 * @param params - Optional filter/sort parameters
 * @returns Posts list with statistics
 */
export async function listPosts(params?: ListPostsParams): Promise<ListPostsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.category) searchParams.set('category', params.category);
  if (params?.tag) searchParams.set('tag', params.tag);
  if (params?.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.order) searchParams.set('order', params.order);

  const queryString = searchParams.toString();
  const url = `/api/cms/list${queryString ? `?${queryString}` : ''}`;

  const response = await cmsFetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `文章列表读取失败： ${response.status}`);
  }

  return response.json();
}

/**
 * Creates a new blog post
 *
 * @param params - Post creation parameters
 * @returns The created post ID
 */
export async function createPost(params: CreatePostParams): Promise<CreatePostResponse> {
  const response = await cmsFetch('/api/cms/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `文章创建失败： ${response.status}`);
  }

  return response.json();
}

/**
 * Toggles the draft status of a post
 *
 * @param postId - The post ID (file path)
 * @returns The new draft status
 */
export async function toggleDraft(postId: string): Promise<ToggleDraftResponse> {
  const response = await cmsFetch('/api/cms/toggle-draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ postId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `文章发布状态切换失败： ${response.status}`);
  }

  return response.json();
}

/**
 * Toggles the sticky status of a post
 *
 * @param postId - The post ID (file path)
 * @returns The new sticky status
 */
export async function toggleSticky(postId: string): Promise<ToggleStickyResponse> {
  const response = await cmsFetch('/api/cms/toggle-sticky', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ postId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `文章置顶状态切换失败： ${response.status}`);
  }

  return response.json();
}

/**
 * CMS configuration from server
 */
export interface CMSConfigResponse {
  projectRoot: string;
  contentDir: string;
  categoryMap: Record<string, string>;
}

// Cache for CMS config
let cachedConfig: CMSConfigResponse | null = null;

/**
 * Gets the CMS configuration from the server
 * Results are cached after the first call
 *
 * @returns The CMS configuration
 */
export async function getCMSConfig(): Promise<CMSConfigResponse> {
  if (cachedConfig) {
    return cachedConfig;
  }

  const response = await cmsFetch('/api/cms/config');

  if (!response.ok) {
    throw new Error('后台配置读取失败');
  }

  const config: CMSConfigResponse = await response.json();
  cachedConfig = config;

  // Initialize category map for client-side detection
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `图片上传失败： ${response.status}`);
  }

  return response.json();
}

export async function readSiteConfig(): Promise<string> {
  const response = await cmsFetch('/api/cms/site-config');

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `站点配置读取失败： ${response.status}`);
  }

  const data = (await response.json()) as { content: string };
  return data.content;
}

export async function writeSiteConfig(content: string): Promise<void> {
  const response = await cmsFetch('/api/cms/site-config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `站点配置保存失败： ${response.status}`);
  }
}
