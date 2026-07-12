import {
  addCategoryMappings,
  CONFIG_PATH,
  CONTENT_DIR,
  checkAuth,
  commitTextFiles,
  dumpMatter,
  type Env,
  isSafeMarkdownPath,
  json,
  readFile,
} from '../../_lib/online-cms';

type WriteBody = {
  postId: string;
  frontmatter: Record<string, unknown>;
  content: string;
  baseSha: string;
  categoryMappings?: Record<string, string>;
};

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const authError = await checkAuth(context.request, context.env);
    if (authError) return authError;

    const body = (await context.request.json()) as WriteBody;
    if (!isSafeMarkdownPath(body.postId)) return json({ error: 'Invalid postId' }, 400);

    const file = await readFile(context.env, `${CONTENT_DIR}/${body.postId}`);
    if (!body.baseSha || body.baseSha !== file.sha) {
      return json({ error: '文章已被其他页面修改，请重新加载后合并内容。' }, 409);
    }
    const postPath = `${CONTENT_DIR}/${body.postId}`;
    const updates = [{ path: postPath, content: dumpMatter(body.frontmatter, body.content) }];
    if (body.categoryMappings && Object.keys(body.categoryMappings).length > 0) {
      const config = await readFile(context.env, CONFIG_PATH);
      const nextConfig = addCategoryMappings(config.content, body.categoryMappings);
      if (nextConfig && nextConfig !== config.content) updates.push({ path: CONFIG_PATH, content: nextConfig });
    }
    const result = await commitTextFiles(context.env, updates, `chore(cms): update ${body.postId}`);

    return json({ success: true, sha: result.fileShas[postPath] || file.sha });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
}
