import { checkAuth, clearCmsSession, createCmsSession, type Env, json } from '../../_lib/online-cms';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const authError = await checkAuth(context.request, context.env);
  return authError || json({ authenticated: true });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  return createCmsSession(context.request, context.env);
}

export async function onRequestDelete(context: { request: Request }) {
  return clearCmsSession(context.request);
}
