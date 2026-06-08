import { Router } from "express";
import { db, usersTable, activitiesTable, challengesTable, eventsTable, reportsTable } from "@workspace/db";
import { eq, sql, and, gte } from "drizzle-orm";

const router: Router = Router();

router.get("/analytics/summary", async (_req, res): Promise<void> => {
  const [
    totalUsersResult,
    activeUsersResult,
    newRegsResult,
    totalActivitiesResult,
    distancesResult,
    activeChallengesResult,
    upcomingEventsResult,
    flaggedResult,
    pendingReportsResult,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(usersTable),
    db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.status, "active")),
    db.select({ count: sql<number>`count(*)` }).from(usersTable).where(
      gte(usersTable.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    ),
    db.select({ count: sql<number>`count(*)` }).from(activitiesTable),
    db.select({
      walkKm: sql<number>`coalesce(sum(case when type='walking' then distance else 0 end),0)`,
      runKm: sql<number>`coalesce(sum(case when type='running' then distance else 0 end),0)`,
      cycleKm: sql<number>`coalesce(sum(case when type='cycling' then distance else 0 end),0)`,
      totalCal: sql<number>`coalesce(sum(calories),0)`,
    }).from(activitiesTable),
    db.select({ count: sql<number>`count(*)` }).from(challengesTable).where(eq(challengesTable.status, "active")),
    db.select({ count: sql<number>`count(*)` }).from(eventsTable).where(eq(eventsTable.status, "upcoming")),
    db.select({ count: sql<number>`count(*)` }).from(activitiesTable).where(eq(activitiesTable.isFlagged, true)),
    db.select({ count: sql<number>`count(*)` }).from(reportsTable).where(eq(reportsTable.status, "pending")),
  ]);

  const dist = distancesResult[0];
  res.json({
    totalUsers: Number(totalUsersResult[0]?.count ?? 0),
    activeUsers: Number(activeUsersResult[0]?.count ?? 0),
    newRegistrations: Number(newRegsResult[0]?.count ?? 0),
    totalActivities: Number(totalActivitiesResult[0]?.count ?? 0),
    totalWalkingKm: Number(dist?.walkKm ?? 0),
    totalRunningKm: Number(dist?.runKm ?? 0),
    totalCyclingKm: Number(dist?.cycleKm ?? 0),
    totalCalories: Number(dist?.totalCal ?? 0),
    activeChallenges: Number(activeChallengesResult[0]?.count ?? 0),
    upcomingEvents: Number(upcomingEventsResult[0]?.count ?? 0),
    flaggedActivities: Number(flaggedResult[0]?.count ?? 0),
    pendingReports: Number(pendingReportsResult[0]?.count ?? 0),
  });
});

router.get("/analytics/user-growth", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', created_at), 'YYYY-MM-DD')`,
      value: sql<number>`count(*)`,
    })
    .from(usersTable)
    .groupBy(sql`date_trunc('day', created_at)`)
    .orderBy(sql`date_trunc('day', created_at)`);
  res.json(rows.map((r) => ({ date: r.date, value: Number(r.value) })));
});

router.get("/analytics/activity-trends", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', created_at), 'YYYY-MM-DD')`,
      walking: sql<number>`count(case when type='walking' then 1 end)`,
      running: sql<number>`count(case when type='running' then 1 end)`,
      cycling: sql<number>`count(case when type='cycling' then 1 end)`,
    })
    .from(activitiesTable)
    .groupBy(sql`date_trunc('day', created_at)`)
    .orderBy(sql`date_trunc('day', created_at)`);
  res.json(rows.map((r) => ({
    date: r.date,
    walking: Number(r.walking),
    running: Number(r.running),
    cycling: Number(r.cycling),
  })));
});

router.get("/analytics/state-breakdown", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      state: usersTable.state,
      userCount: sql<number>`count(distinct ${usersTable.id})`,
      activeUsers: sql<number>`count(distinct case when ${usersTable.status}='active' then ${usersTable.id} end)`,
      totalActivities: sql<number>`coalesce((select count(*) from activities where activities.state=${usersTable.state}),0)`,
      totalDistanceKm: sql<number>`coalesce((select sum(distance) from activities where activities.state=${usersTable.state}),0)`,
    })
    .from(usersTable)
    .groupBy(usersTable.state)
    .orderBy(sql`count(distinct ${usersTable.id}) desc`)
    .limit(30);
  res.json(rows.map((r) => ({
    state: r.state ?? "Unknown",
    userCount: Number(r.userCount),
    activeUsers: Number(r.activeUsers),
    totalActivities: Number(r.totalActivities),
    totalDistanceKm: Number(r.totalDistanceKm),
  })));
});

router.get("/analytics/top-cities", async (req, res): Promise<void> => {
  const { limit = 10 } = req.query;
  const limitNum = parseInt(limit as string, 10);
  const rows = await db
    .select({
      city: usersTable.city,
      state: usersTable.state,
      activeUsers: sql<number>`count(case when ${usersTable.status}='active' then 1 end)`,
      totalActivities: sql<number>`coalesce(sum(${usersTable.totalActivities}),0)`,
    })
    .from(usersTable)
    .groupBy(usersTable.city, usersTable.state)
    .orderBy(sql`count(case when ${usersTable.status}='active' then 1 end) desc`)
    .limit(limitNum);
  res.json(rows.map((r) => ({
    city: r.city ?? "Unknown",
    state: r.state ?? "Unknown",
    activeUsers: Number(r.activeUsers),
    totalActivities: Number(r.totalActivities),
  })));
});

router.get("/analytics/activity-feed", async (req, res): Promise<void> => {
  const { limit = 20 } = req.query;
  const limitNum = parseInt(limit as string, 10);
  const data = await db
    .select({
      id: activitiesTable.id,
      userId: activitiesTable.userId,
      userName: activitiesTable.userName,
      type: activitiesTable.type,
      distance: activitiesTable.distance,
      city: activitiesTable.city,
      state: activitiesTable.state,
      createdAt: activitiesTable.createdAt,
    })
    .from(activitiesTable)
    .orderBy(activitiesTable.createdAt)
    .limit(limitNum);
  res.json(data);
});

export default router;
