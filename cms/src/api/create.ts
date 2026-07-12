/**
 * CMS Create API Handler
 *
 * Creates a new blog post file with initial frontmatter.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { format } from 'date-fns';
import type { Context } from 'hono';
import yaml from 'js-yaml';
import { z } from 'zod';
import { getCategoryMap } from '@/lib/category';
import { addCategoryMappings } from '@/lib/config';
import { CONFIG_PATH, CONTENT_DIR } from '@/lib/paths';
import { generateSlug } from '@/lib/slug';
import { isPathSafe } from '@/lib/validation';
import type { CreatePostResponse } from '@/types';

/** Zod schema for create post request validation */
const createPostRequestSchema = z.object({
  title: z.string().min(1, '标题不能为空').trim(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  draft: z.boolean().optional().default(true),
  categoryMappings: z.record(z.string(), z.string()).optional(),
});

type CreatePostParams = z.infer<typeof createPostRequestSchema>;

/**
 * Generates the file path based on categories
 * e.g., ['笔记', '前端'] + 'React Hooks' => 'note/front-end/react-hooks.md'
 */
function generateFilePath(title: string, categories?: string[], customMappings?: Record<string, string>): string {
  const slug = generateSlug(title);
  const categoryMap = getCategoryMap();

  if (!categories || categories.length === 0) {
    return `${slug}.md`;
  }

  // Convert category names to slugs using categoryMap + custom mappings
  const pathSegments = categories.map((cat) => {
    // Check custom mappings first (for new categories)
    if (customMappings?.[cat]) {
      return customMappings[cat];
    }
    // Then check existing categoryMap
    const mappedSlug = categoryMap[cat];
    if (mappedSlug) {
      return mappedSlug;
    }
    // Fallback: generate slug from category name
    return generateSlug(cat);
  });

  return `${pathSegments.join('/')}/${slug}.md`;
}

/**
 * Generates initial frontmatter content
 */
function generateFrontmatter(params: CreatePostParams): string {
  const now = new Date();
  const dateStr = format(now, 'yyyy-MM-dd HH:mm:ss');
  const frontmatter: Record<string, unknown> = {
    title: params.title,
    date: dateStr,
    updated: dateStr,
    categories: params.categories?.length ? [params.categories] : undefined,
    tags: params.tags?.length ? params.tags : undefined,
    draft: params.draft !== false ? true : undefined,
    catalog: true,
  };
  const clean = Object.fromEntries(Object.entries(frontmatter).filter(([, value]) => value !== undefined));
  const yamlText = yaml
    .dump(clean, { flowLevel: 2, lineWidth: -1, quotingType: "'", forceQuotes: false })
    .replace(/^(date|updated): '(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})'$/gm, '$1: $2');
  return `---\n${yamlText}---\n\n`;
}

/**
 * POST /api/cms/create
 *
 * Request body:
 * {
 *   title: string,
 *   categories?: string[],
 *   tags?: string[],
 *   draft?: boolean
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   postId: string
 * }
 */
export async function createHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;

  try {
    const rawBody = await c.req.json();
    const parseResult = createPostRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map((e) => e.message).join(', ');
      return c.json({ error: errorMessage }, 400);
    }

    const { title, categories, tags, draft, categoryMappings: customMappings } = parseResult.data;

    // Generate file path (pass custom mappings for path generation)
    const postId = generateFilePath(title, categories, customMappings);

    // Validate path safety
    if (!isPathSafe(postId)) {
      return c.json({ error: '文章路径不合法' }, 400);
    }

    const filePath = path.join(projectRoot, CONTENT_DIR, postId);

    // Check if file already exists
    try {
      await fs.access(filePath);
      return c.json({ error: `文章已存在： ${postId}` }, 409);
    } catch {
      // File doesn't exist, good to proceed
    }

    // Ensure directory exists
    const dirPath = path.dirname(filePath);
    await fs.mkdir(dirPath, { recursive: true });

    const content = generateFrontmatter({ title, categories, tags, draft });
    const configPath = path.join(projectRoot, CONFIG_PATH);
    const configBackup =
      customMappings && Object.keys(customMappings).length > 0 ? await fs.readFile(configPath, 'utf-8') : null;
    try {
      if (customMappings && Object.keys(customMappings).length > 0) {
        await addCategoryMappings(projectRoot, customMappings);
      }
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      await fs.unlink(filePath).catch(() => undefined);
      if (configBackup !== null) await fs.writeFile(configPath, configBackup, 'utf-8').catch(() => undefined);
      throw error;
    }

    const response: CreatePostResponse = {
      success: true,
      postId,
    };

    return c.json(response, 201);
  } catch (error) {
    console.error('[CMS Create API] Error:', error);
    return c.json({ error: '服务内部错误' }, 500);
  }
}
