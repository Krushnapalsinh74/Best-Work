import { Router } from "express";
import { db, activitiesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: Router = Router();

router.get("/activities", async (req, res): Promise<void> => {
  const { page = 1, limit = 20, type, flagged, state, city } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  if (type) conditions.push(eq(activitiesTable.type, type as string));
  if (flagged === "true") conditions.push(eq(activitiesTable.isFlagged, true));
  if (state) conditions.push(eq(activitiesTable.state, state as string));
  if (city) conditions.push(eq(activitiesTable.city, city as string));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [data, countResult] = await Promise.all([
    db.select().from(activitiesTable).where(where).limit(limitNum).offset(offset).orderBy(activitiesTable.createdAt),
    db.select({ count: sql<number>`count(*)` }).from(activitiesTable).where(where),
  ]);
  res.json({ data, total: Number(countResult[0]?.count ?? 0), page: pageNum, limit: limitNum });
});

router.get("/activities/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [activity] = await db.select().from(activitiesTable).where(eq(activitiesTable.id, id));
  if (!activity) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  res.json(activity);
});

router.delete("/activities/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(activitiesTable).where(eq(activitiesTable.id, id));
  res.sendStatus(204);
});

router.post("/activities/:id/flag", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { reason } = req.body;
  const [activity] = await db
    .update(activitiesTable)
    .set({ isFlagged: true, flagReason: reason })
    .where(eq(activitiesTable.id, id))
    .returning();
  if (!activity) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  res.json(activity);
});

export default router;
