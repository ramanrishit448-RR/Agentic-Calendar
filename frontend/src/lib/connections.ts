import { getRefreshToken } from "@descope/nextjs-sdk/client";
import { apiFetch } from "./api";
import { ConnectionInfo } from "./types";

export async function fetchCalendarConnection(token: string) {
  const data = await apiFetch<{ connection: ConnectionInfo }>(
    "/api/connections",
    { token },
  );

  return data.connection;
}

export async function connectCalendar(token: string) {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("refreshToken invalid");

  const result = await apiFetch<{ url: string }>("/api/connections/connect", {
    method: "POST",
    token,
    body: {
      redirectUrl: `${window.location.origin}/dashboard`,
      refreshToken,
    },
  });

  window.location.href = result.url;
}

export async function refreshCalendarConnection(token: string) {
  await apiFetch("/api/connections/refresh-status", {
    method: "POST",
    token,
  });
}
