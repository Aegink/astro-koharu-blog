import {
  CONTENT_DIR,
  checkAuth,
  deleteFile,
  type Env,
  githubRequest,
  isSafeMediaPath,
  json,
  listMarkdownFiles,
  listRepoTree,
  MEDIA_DIR,
  MEDIA_ROOT_DIR,
  readFile,
  repo,
} from '../../_lib/online-cms';

type DeleteBody = {
  path: string;
  sha?: string;
};

const IMAGE_RE = /\.(avif|gif|jpe?g|png|svg|webp)$/i;

function encodePath(filePath: string): string {
  return filePath.split('/').map(encodeURIComponent).join('/');
}

function toPublicUrl(path: string): string {
  return path.startsWith('public/') ? `/${path.slice('public/'.length)}` : `/${path}`;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const authError = await checkAuth(context.request, context.env);
    if (authError) return authError;

    const { owner, name, branch } = repo(context.env);
    const tree = await listRepoTree(context.env);
    const images = tree
      .filter((item) => item.type === 'blob' && item.path.startsWith(`${MEDIA_ROOT_DIR}/`) && IMAGE_RE.test(item.path))
      .map((item) => {
        const deletable = isSafeMediaPath(item.path);
        const managed = item.path.startsWith(`${MEDIA_DIR}/`);
        return {
          name: item.path.split('/').pop() || item.path,
          path: item.path,
          url: toPublicUrl(item.path),
          rawUrl: `https://raw.githubusercontent.com/${owner}/${name}/${branch}/${encodePath(item.path)}`,
          size: item.size || 0,
          sha: item.sha,
          extension: item.path.split('.').pop()?.toLowerCase() || '',
          deletable,
          managed,
          group: managed ? '后台上传' : '站点图片',
        };
      })
      .sort((a, b) => Number(b.deletable) - Number(a.deletable) || a.path.localeCompare(b.path, 'zh-Hans-CN'));

    return json({ images, directory: MEDIA_ROOT_DIR, uploadDirectory: MEDIA_DIR });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : '媒体库读取失败' }, 500);
  }
}

export async function onRequestDelete(context: { request: Request; env: Env }) {
  try {
    const authError = await checkAuth(context.request, context.env);
    if (authError) return authError;

    const body = (await context.request.json()) as DeleteBody;
    if (!body.path || !isSafeMediaPath(body.path))
      return json({ error: '图片路径不合法，只能删除 public/img/cms 下的后台上传图片。' }, 400);

    const publicUrl = toPublicUrl(body.path);
    const references: string[] = [];
    for (const postId of await listMarkdownFiles(context.env)) {
      const post = await readFile(context.env, `${CONTENT_DIR}/${postId}`);
      if (post.content.includes(publicUrl) || post.content.includes(body.path)) references.push(postId);
    }
    if (references.length > 0) {
      return json(
        { error: `图片仍被 ${references.length} 篇文章引用，请先移除引用：${references.slice(0, 5).join('、')}` },
        409,
      );
    }

    let sha = body.sha;
    if (!sha) {
      const { owner, name, branch } = repo(context.env);
      const file = await githubRequest<{ sha: string }>(
        context.env,
        `/repos/${owner}/${name}/contents/${encodePath(body.path)}?ref=${encodeURIComponent(branch)}`,
      );
      sha = file.sha;
    }

    await deleteFile(context.env, body.path, `chore(cms): delete image ${body.path.split('/').pop() || body.path}`, sha);
    return json({ success: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : '图片删除失败' }, 500);
  }
}
