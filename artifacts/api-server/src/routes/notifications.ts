import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: Router = Router();

router.get("/notifications", async (req, res): Promise<void> => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;
  const [data, countResult] = await Promise.all([
    db.select().from(notificationsTable).limit(limitNum).offset(offset).orderBy(notificationsTable.createdAt),
    db.select({ count: sql<number>`count(*)` }).from(notificationsTable),
  ]);
  res.json({ data, total: Number(countResult[0]?.count ?? 0), page: pageNum, limit: limitNum });
});

router.post("/notifications", async (req, res): Promise<void> => {
  const { title, message, target, targetState, targetCity } = req.body;
  if (!title || !message || !target) {
    res.status(400).json({ error: "title, message, target required" });
    return;
  }
  const [notification] = await db.insert(notificationsTable).values({
    title, message, target, targetState, targetCity, status: "sent", sentCount: 0,
  }).returning();
  res.status(201).json(notification);
});

export default router;
