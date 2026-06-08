import { Router } from "express";
import { db, settingsTable, auditLogsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: Router = Router();

router.get("/settings", async (_req, res): Promise<void> => {
  const rows = await db.select().from(settingsTable).limit(1);
  if (rows.length === 0) {
    const [created] = await db.insert(settingsTable).values({}).returning();
    res.json(created);
    return;
  }
  res.json(rows[0]);
});

router.patch("/settings", async (req, res): Promise<void> => {
  const updates: Record<string, unknown> = {};
  const fields = [
    "pointsPerKmWalking", "pointsPerKmRunning", "pointsPerKmCycling",
    "minActivityDistanceKm", "maxSpeedWalkingKmh", "maxSpeedRunningKmh",
    "maxSpeedCyclingKmh", "maintenanceMode",
  ];
  for (const field of fields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  const rows = await db.select().from(settingsTable).limit(1);
  let result;
  if (rows.length === 0) {
    [result] = await db.insert(settingsTable).values(updates as Record<string, never>).returning();
  } else {
    [result] = await db.update(settingsTable).set(updates).returning();
  }
  res.json(result);
});

router.get("/audit-logs", async (req, res): Promise<void> => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;
  const [data, countResult] = await Promise.all([
    db.select().from(auditLogsTable).limit(limitNum).offset(offset).orderBy(auditLogsTable.createdAt),
    db.select({ count: sql<number>`count(*)` }).from(auditLogsTable),
  ]);
  res.json({ data, total: Number(countResult[0]?.count ?? 0), page: pageNum, limit: limitNum });
});

export default router;
