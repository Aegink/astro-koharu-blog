export async function loginCms(password: string): Promise<void> {
  const response = await fetch('/api/cms/session', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || `登录失败：${response.status}`);
  }
}

export async function logoutCms(): Promise<void> {
  await fetch('/api/cms/session', { method: 'DELETE', credentials: 'same-origin' }).catch(() => undefined);
}

export async function hasCmsSession(): Promise<boolean> {
  const response = await fetch('/api/cms/session', { credentials: 'same-origin' }).catch(() => null);
  return response?.ok === true;
}

export function cmsFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  return fetch(input, { ...init, credentials: 'same-origin' }).then((response) => {
    if (response.status === 401 && typeof window !== 'undefined') window.dispatchEvent(new Event('cms:unauthorized'));
    return response;
  });
}
