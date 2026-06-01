import { checkAuth, type Env, json } from '../../../_lib/online-cms';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const authError = checkAuth(context.request, context.env);
  if (authError) return authError;
  const target = new URL(context.request.url).searchParams.get('url') || '';
  return json({ originUrl: target, url: target });
}
