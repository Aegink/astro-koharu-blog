const STORAGE_KEY = 'koharu_cms_password';

export function getCmsPassword(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(STORAGE_KEY) || '';
}

export function setCmsPassword(password: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, password);
}

export function clearCmsPassword(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getAuthHeaders(): HeadersInit {
  const password = getCmsPassword();
  return password ? { Authorization: `Bearer ${password}` } : {};
}

export function cmsFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const password = getCmsPassword();
  if (password && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${password}`);
  }
  return fetch(input, { ...init, headers });
}
