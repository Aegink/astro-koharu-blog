/**
 * CMS Upload Image API Handler
 *
 * Saves uploaded images into public/img/cms for local CMS development.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type { Context } from 'hono';
import { MEDIA_DIR } from '@/lib/paths';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function sanitizeName(name: string): string {
  const base = name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'image';
}

export async function uploadImageHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;

  try {
    const body = await c.req.parseBody();
    const file = body.file;
    if (!(file instanceof File)) return c.json({ error: '请选择要上传的图片。' }, 400);
    if (!ALLOWED_TYPES[file.type]) return c.json({ error: '仅支持 jpeg、png、webp、gif、avif 图片。' }, 400);
    if (file.size > MAX_IMAGE_SIZE) return c.json({ error: '图片大小不能超过 5MB。' }, 400);

    const ext = ALLOWED_TYPES[file.type];
    const filename = `${Date.now()}-${sanitizeName(file.name)}.${ext}`;
    const repoPath = `${MEDIA_DIR}/${filename}`;
    const publicUrl = `/img/cms/${filename}`;
    const targetDir = path.resolve(projectRoot, MEDIA_DIR);
    const targetPath = path.resolve(targetDir, filename);

    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(targetPath, Buffer.from(await file.arrayBuffer()));

    return c.json({ success: true, path: repoPath, url: publicUrl }, 201);
  } catch (error) {
    console.error('[CMS Upload Image API] Error:', error);
    return c.json({ error: error instanceof Error ? error.message : '图片上传失败' }, 500);
  }
}
