import { Router } from "express";
import { db } from "@workspace/db";
import { adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: Router = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  const [admin] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email));
  if (!admin || admin.passwordHash !== password) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = Buffer.from(`${admin.id}:${admin.email}`).toString("base64");
  const { passwordHash: _ph, ...safeAdmin } = admin;
  res.json({ token, admin: safeAdmin });
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.json({ message: "Logged out" });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const token = authHeader.replace("Bearer ", "");
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [idStr] = decoded.split(":");
    const id = parseInt(idStr, 10);
    const [admin] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.id, id));
    if (!admin) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { passwordHash: _ph, ...safeAdmin } = admin;
    res.json(safeAdmin);
  } catch {
    logger.warn("Invalid token");
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
