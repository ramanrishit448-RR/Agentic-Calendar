const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const API_URL = rawApiUrl.replace(/\/+$/, "");

export async function apiFetch<T>(
  path: string,
  options: {
    method?: string;
    token?: string | null;
    body?: unknown;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${API_URL}${cleanPath}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);

  return data;
}
