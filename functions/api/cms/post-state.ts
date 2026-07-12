import {
  CONTENT_DIR,
  checkAuth,
  commitTextFiles,
  dumpMatter,
  type Env,
  isSafeMarkdownPath,
  json,
  parseMatter,
  readFile,
} from '../../_lib/online-cms';

type PostStateBody = {
  postId: string;
  action: 'trash' | 'restore';
};

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const authError = await checkAuth(context.request, context.env);
    if (authError) return authError;

    const body = (await context.request.json()) as PostStateBody;
    if (!isSafeMarkdownPath(body.postId)) return json({ error: 'Invalid postId' }, 400);
    if (!['trash', 'restore'].includes(body.action)) return json({ error: '不支持的操作。' }, 400);

    const filePath = `${CONTENT_DIR}/${body.postId}`;
    const file = await readFile(context.env, filePath);
    const parsed = parseMatter(file.content);

    if (body.action === 'trash') {
      if (!parsed.frontmatter.deletedAt) {
        parsed.frontmatter.deletedDraft = Boolean(parsed.frontmatter.draft);
        parsed.frontmatter.deletedAt = new Date().toISOString();
      }
      parsed.frontmatter.draft = true;
    } else {
      parsed.frontmatter.draft = parsed.frontmatter.deletedDraft ?? true;
      delete parsed.frontmatter.deletedAt;
      delete parsed.frontmatter.deletedDraft;
    }

    await commitTextFiles(
      context.env,
      [{ path: filePath, content: dumpMatter(parsed.frontmatter, parsed.content) }],
      `chore(cms): ${body.action} ${body.postId}`,
    );
    return json({ success: true, deleted: body.action === 'trash' });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : '文章状态更新失败' }, 500);
  }
}
