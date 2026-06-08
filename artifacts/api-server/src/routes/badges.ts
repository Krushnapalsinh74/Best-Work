import { Router } from "express";
import { db, badgesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: Router = Router();

router.get("/badges", async (_req, res): Promise<void> => {
  const data = await db.select().from(badgesTable).orderBy(badgesTable.tier);
  res.json(data);
});

router.post("/badges", async (req, res): Promise<void> => {
  const { name, description, tier, imageUrl, criteria } = req.body;
  if (!name || !tier) {
    res.status(400).json({ error: "name and tier required" });
    return;
  }
  const [badge] = await db.insert(badgesTable).values({
    name, description, tier, imageUrl, criteria, awardedCount: 0,
  }).returning();
  res.status(201).json(badge);
});

router.patch("/badges/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { name, description, tier, imageUrl, criteria } = req.body;
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates["name"] = name;
  if (description !== undefined) updates["description"] = description;
  if (tier !== undefined) updates["tier"] = tier;
  if (imageUrl !== undefined) updates["imageUrl"] = imageUrl;
  if (criteria !== undefined) updates["criteria"] = criteria;
  const [badge] = await db.update(badgesTable).set(updates).where(eq(badgesTable.id, id)).returning();
  if (!badge) {
    res.status(404).json({ error: "Badge not found" });
    return;
  }
  res.json(badge);
});

router.delete("/badges/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(badgesTable).where(eq(badgesTable.id, id));
  res.sendStatus(204);
});

export default router;
