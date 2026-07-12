/**
 * CMS Media API Handler
 *
 * Local filesystem version of the online media library API.
 */

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Context } from 'hono';
import { MEDIA_DIR, MEDIA_ROOT_DIR } from '@/lib/paths';

const IMAGE_RE = /\.(avif|gif|jpe?g|png|svg|webp)$/i;

type MediaFile = {
  repoPath: string;
  absolutePath: string;
};

type DeleteBody = {
  path: string;
};

function toPublicUrl(filePath: string): string {
  return filePath.startsWith('public/') ? `/${filePath.slice('public/'.length)}` : `/${filePath}`;
}

function isSafeRelativePath(filePath: string): boolean {
  const normalized = path.normalize(filePath);
  return !path.isAbsolute(normalized) && !normalized.includes('..');
}

function resolveInside(projectRoot: string, repoPath: string, rootDir: string): string | null {
  if (!isSafeRelativePath(repoPath)) return null;
  const root = path.resolve(projectRoot, rootDir);
  const target = path.resolve(projectRoot, repoPath);
  return target === root || target.startsWith(`${root}${path.sep}`) ? target : null;
}

async function walkImages(projectRoot: string, dir: string): Promise<MediaFile[]> {
  const absoluteDir = path.resolve(projectRoot, dir);
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true }).catch(() => []);
  const files: MediaFile[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(absoluteDir, entry.name);
    const repoPath = path.relative(projectRoot, absolutePath).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      files.push(...(await walkImages(projectRoot, repoPath)));
    } else if (entry.isFile() && IMAGE_RE.test(entry.name)) {
      files.push({ repoPath, absolutePath });
    }
  }

  return files;
}

function localSha(repoPath: string, size: number, mtimeMs: number): string {
  return crypto.createHash('sha1').update(`${repoPath}:${size}:${mtimeMs}`).digest('hex');
}

export async function mediaHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;

  try {
    if (c.req.method === 'DELETE') {
      const body = (await c.req.json()) as DeleteBody;
      if (!body.path || !IMAGE_RE.test(body.path)) {
        return c.json({ error: '图片路径不合法。' }, 400);
      }

      const target = resolveInside(projectRoot, body.path, MEDIA_ROOT_DIR);
      if (!target) {
        return c.json({ error: '图片路径不合法，只能删除 public/img 下的图片文件。' }, 400);
      }

      await fs.unlink(target);
      return c.json({ success: true });
    }

    const files = await walkImages(projectRoot, MEDIA_ROOT_DIR);
    const images = await Promise.all(
      files.map(async ({ repoPath, absolutePath }) => {
        const stat = await fs.stat(absolutePath);
        const managed = repoPath.startsWith(`${MEDIA_DIR}/`);
        return {
          name: path.basename(repoPath),
          path: repoPath,
          url: toPublicUrl(repoPath),
          rawUrl: toPublicUrl(repoPath),
          size: stat.size,
          sha: localSha(repoPath, stat.size, stat.mtimeMs),
          extension: path.extname(repoPath).slice(1).toLowerCase(),
          deletable: true,
          managed,
          group: managed ? '后台上传' : '站点图片',
        };
      }),
    );

    images.sort((a, b) => Number(b.managed) - Number(a.managed) || a.path.localeCompare(b.path, 'zh-Hans-CN'));
    return c.json({ images, directory: MEDIA_ROOT_DIR, uploadDirectory: MEDIA_DIR });
  } catch (error) {
    console.error('[CMS Media API] Error:', error);
    return c.json({ error: error instanceof Error ? error.message : '媒体库读取失败' }, 500);
  }
}
