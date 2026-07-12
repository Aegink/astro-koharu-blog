import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { Context } from 'hono';
import yaml from 'js-yaml';
import { CONTENT_DIR } from '@/lib/paths';
import { hasValidMarkdownExtension, isPathSafe } from '@/lib/validation';

type BulkAction = 'publish' | 'draft' | 'trash' | 'restore';

function applyAction(frontmatter: Record<string, unknown>, action: BulkAction): boolean {
  const before = JSON.stringify(frontmatter);
  if (action === 'trash') {
    if (!frontmatter.deletedAt) {
      frontmatter.deletedDraft = Boolean(frontmatter.draft);
      frontmatter.deletedAt = new Date().toISOString();
    }
    frontmatter.draft = true;
  } else if (action === 'restore' && frontmatter.deletedAt) {
    frontmatter.draft = frontmatter.deletedDraft ?? true;
    delete frontmatter.deletedAt;
    delete frontmatter.deletedDraft;
  } else if (!frontmatter.deletedAt) {
    frontmatter.draft = action === 'draft';
  }
  return JSON.stringify(frontmatter) !== before;
}

export async function bulkHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;
  try {
    const body = (await c.req.json()) as { postIds?: string[]; action?: BulkAction };
    const postIds = [...new Set(body.postIds || [])];
    if (!body.action || !['publish', 'draft', 'trash', 'restore'].includes(body.action))
      return c.json({ error: '批量操作不合法。' }, 400);
    if (
      postIds.length === 0 ||
      postIds.length > 100 ||
      postIds.some((id) => !isPathSafe(id) || !hasValidMarkdownExtension(id))
    ) {
      return c.json({ error: '请选择 1 到 100 篇合法文章。' }, 400);
    }

    const updates: Array<{ filePath: string; before: string; after: string }> = [];
    for (const postId of postIds) {
      const filePath = path.join(projectRoot, CONTENT_DIR, postId);
      const before = await fs.readFile(filePath, 'utf-8');
      const parsed = matter(before, {
        engines: {
          yaml: {
            parse: (value) => yaml.load(value, { schema: yaml.JSON_SCHEMA }) as object,
            stringify: (value) => yaml.dump(value),
          },
        },
      });
      if (!applyAction(parsed.data, body.action)) continue;
      const after = matter.stringify(parsed.content, parsed.data, {
        engines: {
          yaml: {
            parse: (value: string) => yaml.load(value) as object,
            stringify: (value: object) =>
              yaml
                .dump(value, { flowLevel: 2, lineWidth: -1, quotingType: "'", forceQuotes: false })
                .replace(/^(date|updated): '(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})'$/gm, '$1: $2'),
          },
        },
      });
      updates.push({ filePath, before, after });
    }
    const written: typeof updates = [];
    try {
      for (const update of updates) {
        await fs.writeFile(update.filePath, update.after, 'utf-8');
        written.push(update);
      }
    } catch (error) {
      for (const update of written.reverse())
        await fs.writeFile(update.filePath, update.before, 'utf-8').catch(() => undefined);
      throw error;
    }
    return c.json({ success: true, changed: updates.length });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : '批量操作失败' }, 500);
  }
}
