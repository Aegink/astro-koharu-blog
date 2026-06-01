import {
  checkAuth,
  CONTENT_DIR,
  dumpMatter,
  type Env,
  isSafeMarkdownPath,
  json,
  readFile,
  updateCategoryMappings,
  writeFile,
} from '../../_lib/online-cms';

type WriteBody = {
  postId: string;
  frontmatter: Record<string, unknown>;
  content: string;
  categoryMappings?: Record<string, string>;
};

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const authError = checkAuth(context.request, context.env);
    if (authError) return authError;

    const body = (await context.request.json()) as WriteBody;
    if (!isSafeMarkdownPath(body.postId)) return json({ error: 'Invalid postId' }, 400);

    await updateCategoryMappings(context.env, body.categoryMappings);
    const file = await readFile(context.env, `${CONTENT_DIR}/${body.postId}`);
    await writeFile(
      context.env,
      `${CONTENT_DIR}/${body.postId}`,
      dumpMatter(body.frontmatter, body.content),
      `chore(cms): update ${body.postId}`,
      file.sha,
    );

    return json({ success: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
}
