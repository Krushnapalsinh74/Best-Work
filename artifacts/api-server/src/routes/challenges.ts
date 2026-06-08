import { Router } from "express";
import { db, challengesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: Router = Router();

router.get("/challenges", async (req, res): Promise<void> => {
  const { page = 1, limit = 20, type, status } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;
  const conditions = [];
  if (type) conditions.push(eq(challengesTable.type, type as string));
  if (status) conditions.push(eq(challengesTable.status, status as string));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [data, countResult] = await Promise.all([
    db.select().from(challengesTable).where(where).limit(limitNum).offset(offset).orderBy(challengesTable.createdAt),
    db.select({ count: sql<number>`count(*)` }).from(challengesTable).where(where),
  ]);
  res.json({ data, total: Number(countResult[0]?.count ?? 0), page: pageNum, limit: limitNum });
});

router.post("/challenges", async (req, res): Promise<void> => {
  const { title, description, type, period, targetDistance, targetDuration, activityTypes, startDate, endDate } = req.body;
  if (!title || !targetDistance || !startDate || !endDate) {
    res.status(400).json({ error: "title, targetDistance, startDate, endDate required" });
    return;
  }
  const [challenge] = await db.insert(challengesTable).values({
    title, description, type: type || "distance", period: period || "monthly",
    targetDistance, targetDuration, activityTypes: activityTypes || "walking,running,cycling",
    startDate, endDate, status: "active", participantCount: 0,
  }).returning();
  res.status(201).json(challenge);
});

router.get("/challenges/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, id));
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }
  res.json(challenge);
});

router.patch("/challenges/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { title, description, targetDistance, status, endDate } = req.body;
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates["title"] = title;
  if (description !== undefined) updates["description"] = description;
  if (targetDistance !== undefined) updates["targetDistance"] = targetDistance;
  if (status !== undefined) updates["status"] = status;
  if (endDate !== undefined) updates["endDate"] = endDate;
  const [challenge] = await db.update(challengesTable).set(updates).where(eq(challengesTable.id, id)).returning();
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }
  res.json(challenge);
});

router.delete("/challenges/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(challengesTable).where(eq(challengesTable.id, id));
  res.sendStatus(204);
});

export default router;
