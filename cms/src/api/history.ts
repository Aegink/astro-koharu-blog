import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import matter from 'gray-matter';
import type { Context } from 'hono';
import yaml from 'js-yaml';
import { CONTENT_DIR } from '@/lib/paths';
import { hasValidMarkdownExtension, isPathSafe } from '@/lib/validation';

const execFileAsync = promisify(execFile);

function validPostId(postId: string): boolean {
  return isPathSafe(postId) && hasValidMarkdownExtension(postId);
}

export async function historyHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;
  try {
    if (c.req.method === 'GET') {
      const postId = c.req.query('postId') || '';
      if (!validPostId(postId)) return c.json({ error: 'Invalid postId' }, 400);
      const repoPath = `${CONTENT_DIR}/${postId}`.replace(/\\/g, '/');
      const { stdout } = await execFileAsync(
        'git',
        ['log', '--format=%H%x1f%h%x1f%an%x1f%aI%x1f%s', '--max-count=15', '--', repoPath],
        { cwd: projectRoot, encoding: 'utf8' },
      );
      const commits = stdout
        .trim()
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => {
          const [sha = '', shortSha = '', author = '', date = '', message = ''] = line.split('\x1f');
          return { sha, shortSha, author, date, message };
        });
      return c.json({ commits });
    }

    const body = (await c.req.json()) as { postId?: string; commitSha?: string; baseSha?: string };
    if (!body.postId || !validPostId(body.postId) || !body.commitSha || !/^[a-f0-9]{40}$/i.test(body.commitSha)) {
      return c.json({ error: '回滚参数不合法。' }, 400);
    }
    const repoPath = `${CONTENT_DIR}/${body.postId}`.replace(/\\/g, '/');
    const filePath = path.join(projectRoot, CONTENT_DIR, body.postId);
    const current = await fs.readFile(filePath, 'utf-8');
    const currentSha = createHash('sha256').update(current).digest('hex');
    if (!body.baseSha || body.baseSha !== currentSha) return c.json({ error: '文章已被修改，请重新加载历史记录。' }, 409);

    const { stdout: historical } = await execFileAsync('git', ['show', `${body.commitSha}:${repoPath}`], {
      cwd: projectRoot,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    });
    await fs.writeFile(filePath, historical, 'utf-8');
    const parsed = matter(historical, {
      engines: {
        yaml: {
          parse: (value) => yaml.load(value, { schema: yaml.JSON_SCHEMA }) as object,
          stringify: (value) => yaml.dump(value),
        },
      },
    });
    return c.json({
      success: true,
      sha: createHash('sha256').update(historical).digest('hex'),
      frontmatter: parsed.data,
      content: parsed.content,
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : '版本历史操作失败' }, 500);
  }
}
