import { checkAuth, CONTENT_DIR, type Env, getCategoryMap, json } from '../../_lib/online-cms';

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const authError = checkAuth(context.request, context.env);
    if (authError) return authError;
    return json({ projectRoot: '', contentDir: CONTENT_DIR, categoryMap: await getCategoryMap(context.env), online: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
}
