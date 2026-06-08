import { Router } from "express";
import { db, usersTable, activitiesTable } from "@workspace/db";
import { eq, ilike, or, and, sql } from "drizzle-orm";

const router: Router = Router();

router.get("/users", async (req, res): Promise<void> => {
  const { page = 1, limit = 20, search, state, city, gender, status, activityType } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(usersTable.name, `%${search}%`),
        ilike(usersTable.email, `%${search}%`),
        ilike(usersTable.mobile, `%${search}%`)
      )
    );
  }
  if (state) conditions.push(ilike(usersTable.state, `%${state}%`));
  if (city) conditions.push(ilike(usersTable.city, `%${city}%`));
  if (gender) conditions.push(eq(usersTable.gender, gender as string));
  if (status) conditions.push(eq(usersTable.status, status as string));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [data, countResult] = await Promise.all([
    db.select().from(usersTable).where(where).limit(limitNum).offset(offset).orderBy(usersTable.createdAt),
    db.select({ count: sql<number>`count(*)` }).from(usersTable).where(where),
  ]);

  res.json({ data, total: Number(countResult[0]?.count ?? 0), page: pageNum, limit: limitNum });
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { name, city, state, gender } = req.body;
  const updates: Record<string, string> = {};
  if (name) updates["name"] = name;
  if (city) updates["city"] = city;
  if (state) updates["state"] = state;
  if (gender) updates["gender"] = gender;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.post("/users/:id/suspend", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { reason } = req.body;
  const [user] = await db
    .update(usersTable)
    .set({ status: "suspended", suspendedReason: reason })
    .where(eq(usersTable.id, id))
    .returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.post("/users/:id/ban", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { reason } = req.body;
  const [user] = await db
    .update(usersTable)
    .set({ status: "banned", suspendedReason: reason })
    .where(eq(usersTable.id, id))
    .returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.post("/users/:id/restore", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [user] = await db
    .update(usersTable)
    .set({ status: "active", suspendedReason: null })
    .where(eq(usersTable.id, id))
    .returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.post("/users/:id/verify", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [user] = await db.update(usersTable).set({ isVerified: true }).where(eq(usersTable.id, id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.get("/users/:id/activities", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const data = await db
    .select()
    .from(activitiesTable)
    .where(eq(activitiesTable.userId, id))
    .orderBy(activitiesTable.createdAt)
    .limit(50);
  res.json({ data, total: data.length, page: 1, limit: 50 });
});

export default router;
