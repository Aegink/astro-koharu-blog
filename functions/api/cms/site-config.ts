import { CONFIG_PATH, checkAuth, type Env, json, readFile, writeFile } from '../../_lib/online-cms';
import { validateSiteConfigContent } from '../../_lib/site-config-validation';

type SaveBody = {
  content: string;
};

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const authError = checkAuth(context.request, context.env);
    if (authError) return authError;

    const file = await readFile(context.env, CONFIG_PATH);
    return json({ content: file.content });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const authError = checkAuth(context.request, context.env);
    if (authError) return authError;

    const body = (await context.request.json()) as SaveBody;
    if (typeof body.content !== 'string' || !body.content.trim()) return json({ error: 'Config content is required' }, 400);

    const errors = validateSiteConfigContent(body.content);
    if (errors.length > 0) return json({ error: `配置校验失败：${errors.join('；')}` }, 400);

    const file = await readFile(context.env, CONFIG_PATH);
    await writeFile(context.env, CONFIG_PATH, body.content, 'chore(cms): update site config', file.sha);
    return json({ success: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
}
