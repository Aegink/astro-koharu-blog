/**
 * CMS Deploy Status API Handler
 *
 * Local summary for development. Online deployment details are provided by
 * Cloudflare Pages Functions.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { Context } from 'hono';

const execFileAsync = promisify(execFile);

async function git(projectRoot: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync('git', args, { cwd: projectRoot, windowsHide: true });
  return stdout.trim();
}

function parseCommitLine(line: string) {
  const [sha = '', date = '', author = '', message = ''] = line.split('\t');
  return {
    sha,
    shortSha: sha.slice(0, 7),
    message,
    url: '',
    author,
    date,
  };
}

export async function deployStatusHandler(c: Context) {
  const projectRoot = c.get('projectRoot') as string;

  try {
    const branch = await git(projectRoot, ['rev-parse', '--abbrev-ref', 'HEAD']).catch(() => 'main');
    const remoteUrl = await git(projectRoot, ['config', '--get', 'remote.blog.url']).catch(() => '');
    const log = await git(projectRoot, ['log', '-5', '--format=%H%x09%cI%x09%an%x09%s']).catch(() => '');
    const commits = log.split(/\r?\n/).filter(Boolean).map(parseCommitLine);
    const repoMatch = /github\.com[:/](.+?)\/(.+?)(?:\.git)?$/.exec(remoteUrl);

    return c.json({
      repo: {
        owner: repoMatch?.[1] || 'local',
        name: repoMatch?.[2] || 'astro-koharu',
        branch,
      },
      latestCommit: commits[0] || null,
      commits,
      cloudflare: {
        configured: false,
        projectName: '本地开发',
        message: '本地 CMS 不读取 Cloudflare 部署列表；部署状态请以上线后台或 GitHub Actions 为准。',
        missingVariables: [],
        deployments: [],
      },
    });
  } catch (error) {
    console.error('[CMS Deploy Status API] Error:', error);
    return c.json({ error: error instanceof Error ? error.message : '发布状态读取失败' }, 500);
  }
}
