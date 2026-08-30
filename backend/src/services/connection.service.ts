import {
  CALENDAR_CONNECTION_ID,
  CALENDAR_CONNECTION_LABEL,
  descopeClient,
} from "../config/descope.js";
import {
  getCalendarConnectionRow,
  upsertCalendarConnection,
} from "../repositories/connection.repository.js";

function calendarAppId() {
  if (!CALENDAR_CONNECTION_ID) {
    throw new Error("CALENDAR_CONNECTION_ID is not present in env");
  }

  return CALENDAR_CONNECTION_ID;
}

export async function getCalendarConnection(userId: string) {
  const row = await getCalendarConnectionRow(userId);
  return {
    label: CALENDAR_CONNECTION_LABEL,
    status: row?.status ?? ("disconnected" as const),
  };
}

export async function createCalendarConnectUrl(input: {
  userId: string;
  refreshToken: string;
  redirectUrl: string;
}) {
  const response = await descopeClient.outbound.connect(
    calendarAppId(),
    { redirectUrl: input.redirectUrl },
    input.refreshToken,
  );

  if (!response.ok || !response.data?.url) {
    throw new Error("could not start connection");
  }

  await upsertCalendarConnection({ userId: input.userId, status: "pending" });

  return { url: response.data.url };
}

export async function refreshCalendarConnection(input: {
  userId: string;
  authUserId: string;
}) {
  if (!process.env.DESCOPE_MANAGEMENT_KEY) {
    throw new Error("DESCOPE_MANAGEMENT_KEY is not set in env file");
  }

  const response =
    await descopeClient.management.outboundApplication.fetchToken(
      calendarAppId(),
      input.authUserId,
    );

  const status = response.ok && response.data ? "connected" : "disconnected";

  const row = await upsertCalendarConnection({
    userId: input.userId,
    status,
  });

  return {
    label: CALENDAR_CONNECTION_LABEL,
    status: row.status,
  };
}
