import type { Request, Response, NextFunction } from "express";
import { descopeClient } from "../config/descope.js";
import { ensureUser } from "../repositories/user.repository.js";

export type AuthContext = {
  authUserId: string;
  email?: string;
  name?: string;
  userId: string;
  token: Record<string, unknown>;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export async function requireSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized", success: false });
    return;
  }

  try {
    const authInfo = await descopeClient.validateSession(token);
    const claims = authInfo.token as Record<string, unknown>;
    const authUserId = String(claims.sub ?? "");

    if (!authInfo) {
      res.status(401).json({ error: "Unauthorized", success: false });
      return;
    }

    const email = typeof claims.email === "string" ? claims.email : undefined;
    const user = await ensureUser({ authUserId, email });

    // add auth info in ur req object
    req.auth = {
      authUserId,
      email,
      name: typeof claims.name === "string" ? claims.name : undefined,
      userId: user.id,
      token: claims,
    };

    next();
  } catch {
    res.status(401).json({ error: "session expired" });
  }
}
