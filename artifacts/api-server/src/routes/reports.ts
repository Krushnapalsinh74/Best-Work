import { Router } from "express";
import { db, reportsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: Router = Router();

router.get("/reports", async (req, res): Promise<void> => {
  const { page = 1, limit = 20, status, type } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;
  const conditions = [];
  if (status) conditions.push(eq(reportsTable.status, status as string));
  if (type) conditions.push(eq(reportsTable.type, type as string));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [data, countResult] = await Promise.all([
    db.select().from(reportsTable).where(where).limit(limitNum).offset(offset).orderBy(reportsTable.createdAt),
    db.select({ count: sql<number>`count(*)` }).from(reportsTable).where(where),
  ]);
  res.json({ data, total: Number(countResult[0]?.count ?? 0), page: pageNum, limit: limitNum });
});

router.get("/reports/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [report] = await db.select().from(reportsTable).where(eq(reportsTable.id, id));
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(report);
});

router.post("/reports/:id/resolve", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { resolution } = req.body;
  if (!resolution) {
    res.status(400).json({ error: "resolution required" });
    return;
  }
  const [report] = await db
    .update(reportsTable)
    .set({ status: "resolved", resolution, resolvedAt: new Date() })
    .where(eq(reportsTable.id, id))
    .returning();
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(report);
});

export default router;
