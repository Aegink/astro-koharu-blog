import assert from 'node:assert/strict';
import test from 'node:test';
import { renderMarkdown } from '../cms/src/lib/markdown-render';
import { checkAuth, createCmsSession, type Env, isSafeMediaPath } from '../functions/_lib/online-cms';

test('Markdown 预览会移除可执行 HTML，同时保留后台嵌入占位符', async () => {
  const html = await renderMarkdown(`
<img src="https://example.com/a.png" onerror="alert(1)">
<script>alert('xss')</script>
<a href="javascript:alert(1)">危险链接</a>
<div data-link-preview data-url="https://example.com"></div>
  `);

  assert.equal(html.includes('onerror'), false);
  assert.equal(html.includes('<script'), false);
  assert.equal(html.includes('javascript:'), false);
  assert.equal(html.includes('data-link-preview'), true);
});

test('线上 CMS 登录签发 HttpOnly 会话，接口只接受有效会话 Cookie', async () => {
  const env: Env = {
    GITHUB_TOKEN: 'test-token',
    CMS_ADMIN_PASSWORD: 'test-password',
    CMS_SESSION_SECRET: 'test-session-secret',
  };
  const loginResponse = await createCmsSession(
    new Request('https://example.com/api/cms/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.10' },
      body: JSON.stringify({ password: 'test-password' }),
    }),
    env,
  );

  assert.equal(loginResponse.status, 200);
  const setCookie = loginResponse.headers.get('set-cookie') || '';
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Strict/i);
  assert.match(setCookie, /Secure/i);
  const cookie = setCookie.split(';')[0] || '';
  const authError = await checkAuth(new Request('https://example.com/api/cms/list', { headers: { cookie } }), env);
  assert.equal(authError, null);

  const missingSession = await checkAuth(new Request('https://example.com/api/cms/list'), env);
  assert.equal(missingSession?.status, 401);
});

test('媒体删除范围仅允许后台托管目录', () => {
  assert.equal(isSafeMediaPath('public/img/cms/example.webp'), true);
  assert.equal(isSafeMediaPath('public/img/avatar.webp'), false);
  assert.equal(isSafeMediaPath('public/img/cms/../avatar.webp'), false);
  assert.equal(isSafeMediaPath('public/img/cms/example.txt'), false);
});
