import {
  CONTENT_DIR,
  checkAuth,
  commitTextFiles,
  type Env,
  githubRequest,
  isSafeMarkdownPath,
  json,
  parseMatter,
  readFile,
  readFileAtRef,
  repo,
} from '../../_lib/online-cms';

function encodePath(value: string): string {
  return value.split('/').map(encodeURIComponent).join('/');
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const authError = await checkAuth(context.request, context.env);
    if (authError) return authError;
    const postId = new URL(context.request.url).searchParams.get('postId') || '';
    if (!isSafeMarkdownPath(postId)) return json({ error: 'Invalid postId' }, 400);

    const { owner, name, branch } = repo(context.env);
    const path = `${CONTENT_DIR}/${postId}`;
    const commits = await githubRequest<
      Array<{ sha: string; html_url: string; commit: { message: string; author?: { name?: string; date?: string } } }>
    >(context.env, `/repos/${owner}/${name}/commits?sha=${encodeURIComponent(branch)}&path=${encodePath(path)}&per_page=15`);
    return json({
      commits: commits.map((item) => ({
        sha: item.sha,
        shortSha: item.sha.slice(0, 7),
        message: item.commit.message,
        author: item.commit.author?.name || '',
        date: item.commit.author?.date || '',
        url: item.html_url,
      })),
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : '版本历史读取失败' }, 500);
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const authError = await checkAuth(context.request, context.env);
    if (authError) return authError;
    const body = (await context.request.json()) as { postId?: string; commitSha?: string; baseSha?: string };
    if (!body.postId || !isSafeMarkdownPath(body.postId) || !body.commitSha || !/^[a-f0-9]{40}$/i.test(body.commitSha)) {
      return json({ error: '回滚参数不合法。' }, 400);
    }
    const path = `${CONTENT_DIR}/${body.postId}`;
    const current = await readFile(context.env, path);
    if (!body.baseSha || body.baseSha !== current.sha) return json({ error: '文章已被修改，请重新加载历史记录。' }, 409);

    const historical = await readFileAtRef(context.env, path, body.commitSha);
    const result = await commitTextFiles(
      context.env,
      [{ path, content: historical.content }],
      `chore(cms): restore ${body.postId}`,
    );
    return json({ success: true, sha: result.fileShas[path], ...parseMatter(historical.content) });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : '文章版本恢复失败' }, 500);
  }
}
