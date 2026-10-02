import { Router } from "express";
import { requireSession } from "../middleware/requireSession.js";
import { createCalendarConnectUrl, getCalendarConnection, refreshCalendarConnection, } from "../services/connection.service.js";
export const connectionRouter = Router();
connectionRouter.use(requireSession);
connectionRouter.get("/", async (req, res) => {
    try {
        let connection = await getCalendarConnection(req.sessionAuth.userId);
        // If not connected yet or pending, check Descope to see if user just completed OAuth
        if (connection.status !== "connected") {
            try {
                connection = await refreshCalendarConnection({
                    userId: req.sessionAuth.userId,
                    authUserId: req.sessionAuth.authUserId,
                });
            }
            catch (err) {
                console.warn("Auto-sync connection status error:", err);
            }
        }
        res.json({ connection });
    }
    catch (error) {
        console.error("Failed to load connections:", error);
        res.status(500).json({ error: "could not load connections" });
    }
});
connectionRouter.post("/connect", async (req, res) => {
    try {
        const refreshToken = typeof req.body?.refreshToken === "string" ? req.body.refreshToken : "";
        if (!refreshToken) {
            res.status(400).json({ error: "Refresh token required" });
            return;
        }
        const redirectUrl = typeof req.body?.redirectUrl === "string"
            ? req.body.redirectUrl
            : `${process.env.APP_URL ?? "http://localhost:3000"}/dashboard`;
        const result = await createCalendarConnectUrl({
            userId: req.sessionAuth.userId,
            refreshToken,
            redirectUrl,
        });
        res.json(result);
    }
    catch (error) {
        console.error("Calendar connect error:", error);
        const message = error instanceof Error ? error.message : "could not start connection";
        res.status(500).json({ error: message });
    }
});
connectionRouter.post("/refresh-status", async (req, res) => {
    try {
        const connection = await refreshCalendarConnection({
            userId: req.sessionAuth.userId,
            authUserId: req.sessionAuth.authUserId,
        });
        res.json({ connection });
    }
    catch {
        res.status(500).json({ error: "failed to refresh the status" });
    }
});
