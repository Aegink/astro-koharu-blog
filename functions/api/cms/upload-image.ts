import { checkAuth, type Env, json, writeBase64File } from '../../_lib/online-cms';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

function sanitizeName(name: string): string {
  const base = name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return base || 'image';
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const authError = checkAuth(context.request, context.env);
    if (authError) return authError;

    const formData = await context.request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) return json({ error: '请选择要上传的图片。' }, 400);
    if (!ALLOWED_TYPES[file.type]) return json({ error: '仅支持 jpeg、png、webp、gif、avif 图片。' }, 400);
    if (file.size > MAX_IMAGE_SIZE) return json({ error: '图片大小不能超过 5MB。' }, 400);

    const ext = ALLOWED_TYPES[file.type];
    const filename = `${Date.now()}-${sanitizeName(file.name)}.${ext}`;
    const repoPath = `public/img/cms/${filename}`;
    const publicUrl = `/img/cms/${filename}`;
    const base64 = arrayBufferToBase64(await file.arrayBuffer());

    await writeBase64File(context.env, repoPath, base64, `chore(cms): upload image ${filename}`);
    return json({ success: true, path: repoPath, url: publicUrl }, 201);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : '图片上传失败' }, 500);
  }
}
