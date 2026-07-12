import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { Context } from 'hono';
import yaml from 'js-yaml';
import { CONTENT_DIR } from '@/lib/paths';
import { hasValidMarkdownExtension, isPathSafe } from '@/lib/validation';

export async function postStateHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;
  try {
    const body = (await c.req.json()) as { postId?: string; action?: 'trash' | 'restore' };
    if (!body.postId || !isPathSafe(body.postId) || !hasValidMarkdownExtension(body.postId)) {
      return c.json({ error: 'Invalid postId' }, 400);
    }
    if (!body.action || !['trash', 'restore'].includes(body.action)) return c.json({ error: '不支持的操作。' }, 400);

    const filePath = path.join(projectRoot, CONTENT_DIR, body.postId);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(fileContent, {
      engines: {
        yaml: {
          parse: (value) => yaml.load(value, { schema: yaml.JSON_SCHEMA }) as object,
          stringify: (value) => yaml.dump(value),
        },
      },
    });
    if (body.action === 'trash') {
      if (!parsed.data.deletedAt) {
        parsed.data.deletedDraft = parsed.data.draft === true;
        parsed.data.deletedAt = new Date().toISOString();
      }
      parsed.data.draft = true;
    } else {
      parsed.data.draft = parsed.data.deletedDraft ?? true;
      delete parsed.data.deletedAt;
      delete parsed.data.deletedDraft;
    }
    const next = matter.stringify(parsed.content, parsed.data, {
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
    await fs.writeFile(filePath, next, 'utf-8');
    return c.json({ success: true, deleted: body.action === 'trash' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : '文章状态更新失败' }, 500);
  }
}
