import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const challengesTable = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull().default("distance"),
  period: text("period").notNull().default("monthly"),
  targetDistance: real("target_distance").notNull(),
  targetDuration: integer("target_duration"),
  activityTypes: text("activity_types").notNull().default("walking,running,cycling"),
  status: text("status").notNull().default("active"),
  participantCount: integer("participant_count").notNull().default(0),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertChallengeSchema = createInsertSchema(challengesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challengesTable.$inferSelect;
