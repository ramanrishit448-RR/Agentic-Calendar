import { Router } from "express";
import { requireSession } from "../middleware/requireSession.js";
import {
  createCalendarConnectUrl,
  getCalendarConnection,
  refreshCalendarConnection,
} from "../services/connection.service.js";

export const connectionRouter = Router();

connectionRouter.use(requireSession);

connectionRouter.get("/", async (req, res) => {
  try {
    const connection = await getCalendarConnection(req.auth!.userId);

    res.json({ connection });
  } catch {
    res.status(500).json({ error: "could not load connections" });
  }
});

connectionRouter.post("/connect", async (req, res) => {
  try {
    const refreshToken =
      typeof req.body?.refreshToken === "string" ? req.body.refreshToken : "";

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token required" });
    }

    const redirectUrl =
      typeof req.body?.redirectUrl === "string"
        ? req.body.redirectUrl
        : `${process.env.APP_URL ?? "http://localhost:3000"}/dashboard`;

    const result = await createCalendarConnectUrl({
      userId: req.auth!.userId,
      refreshToken,
      redirectUrl,
    });

    res.json(result);
  } catch {
    res.status(500).json({ error: "could not start connection" });
  }
});

connectionRouter.post("/refresh-status", async (req, res) => {
  try {
    const connection = await refreshCalendarConnection({
      userId: req.auth!.userId,
      authUserId: req.auth!.authUserId,
    });

    res.json({ connection });
  } catch {
    res.status(500).json({ error: "failed to refresh the status" });
  }
});
