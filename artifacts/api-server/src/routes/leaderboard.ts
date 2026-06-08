import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";

const router: Router = Router();

router.get("/leaderboard", async (req, res): Promise<void> => {
  const { scope, state, city, period, activityType, limit = 50 } = req.query;
  const limitNum = parseInt(limit as string, 10);

  let distanceCol: any = usersTable.totalDistance;
  if (activityType === "walking") distanceCol = usersTable.walkingDistance;
  else if (activityType === "running") distanceCol = usersTable.runningDistance;
  else if (activityType === "cycling") distanceCol = usersTable.cyclingDistance;

  const conditions = [];
  if (state) conditions.push(eq(usersTable.state, state as string));
  if (city) conditions.push(eq(usersTable.city, city as string));

  const query = db
    .select({
      userId: usersTable.id,
      name: usersTable.name,
      city: usersTable.city,
      state: usersTable.state,
      totalDistance: distanceCol,
      totalActivities: usersTable.totalActivities,
      points: usersTable.points,
    })
    .from(usersTable)
    .orderBy(desc(distanceCol))
    .limit(limitNum);

  const users = await query;
  const entries = users.map((u, idx) => ({
    rank: idx + 1,
    userId: u.userId,
    name: u.name,
    city: u.city,
    state: u.state,
    totalDistance: u.totalDistance,
    totalActivities: u.totalActivities,
    points: u.points,
    activityType: activityType || null,
  }));
  res.json(entries);
});

export default router;
