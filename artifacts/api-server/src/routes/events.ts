import { Router } from "express";
import { db, eventsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: Router = Router();

router.get("/events", async (req, res): Promise<void> => {
  const { page = 1, limit = 20, status } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;
  const conditions = [];
  if (status) conditions.push(eq(eventsTable.status, status as string));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [data, countResult] = await Promise.all([
    db.select().from(eventsTable).where(where).limit(limitNum).offset(offset).orderBy(eventsTable.date),
    db.select({ count: sql<number>`count(*)` }).from(eventsTable).where(where),
  ]);
  res.json({ data, total: Number(countResult[0]?.count ?? 0), page: pageNum, limit: limitNum });
});

router.post("/events", async (req, res): Promise<void> => {
  const { title, description, date, time, location, city, state, distance, capacity } = req.body;
  if (!title || !date || !time || !location || !distance || !capacity) {
    res.status(400).json({ error: "title, date, time, location, distance, capacity required" });
    return;
  }
  const [event] = await db.insert(eventsTable).values({
    title, description, date, time, location, city, state,
    distance, capacity, registeredCount: 0, status: "upcoming",
  }).returning();
  res.status(201).json(event);
});

router.get("/events/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(event);
});

router.patch("/events/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { title, description, date, time, location, capacity, status } = req.body;
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates["title"] = title;
  if (description !== undefined) updates["description"] = description;
  if (date !== undefined) updates["date"] = date;
  if (time !== undefined) updates["time"] = time;
  if (location !== undefined) updates["location"] = location;
  if (capacity !== undefined) updates["capacity"] = capacity;
  if (status !== undefined) updates["status"] = status;
  const [event] = await db.update(eventsTable).set(updates).where(eq(eventsTable.id, id)).returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(event);
});

router.delete("/events/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(eventsTable).where(eq(eventsTable.id, id));
  res.sendStatus(204);
});

export default router;
