import { CONTENT_DIR, checkAuth, type Env, isSafeMarkdownPath, json, parseMatter, readFile } from '../../_lib/online-cms';

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const authError = await checkAuth(context.request, context.env);
    if (authError) return authError;

    const postId = new URL(context.request.url).searchParams.get('postId') || '';
    if (!isSafeMarkdownPath(postId)) return json({ error: 'Invalid postId' }, 400);

    const file = await readFile(context.env, `${CONTENT_DIR}/${postId}`);
    return json({ ...parseMatter(file.content), sha: file.sha });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
}
