import {
  CONTENT_DIR,
  checkAuth,
  dumpMatter,
  type Env,
  isSafeMarkdownPath,
  json,
  parseMatter,
  readFile,
  writeFile,
} from '../../_lib/online-cms';

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const authError = await checkAuth(context.request, context.env);
    if (authError) return authError;

    const { postId } = (await context.request.json()) as { postId: string };
    if (!isSafeMarkdownPath(postId)) return json({ error: 'Invalid postId' }, 400);

    const file = await readFile(context.env, `${CONTENT_DIR}/${postId}`);
    const parsed = parseMatter(file.content);
    parsed.frontmatter.sticky = !parsed.frontmatter.sticky;

    await writeFile(
      context.env,
      `${CONTENT_DIR}/${postId}`,
      dumpMatter(parsed.frontmatter, parsed.content),
      `chore(cms): toggle sticky ${postId}`,
      file.sha,
    );
    return json({ success: true, sticky: parsed.frontmatter.sticky });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
}
