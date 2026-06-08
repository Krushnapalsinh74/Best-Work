import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  mobile: text("mobile").notNull(),
  gender: text("gender"),
  city: text("city"),
  state: text("state"),
  status: text("status").notNull().default("active"),
  isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
  totalDistance: real("total_distance").notNull().default(0),
  walkingDistance: real("walking_distance").notNull().default(0),
  runningDistance: real("running_distance").notNull().default(0),
  cyclingDistance: real("cycling_distance").notNull().default(0),
  totalActivities: integer("total_activities").notNull().default(0),
  totalCalories: integer("total_calories").notNull().default(0),
  points: integer("points").notNull().default(0),
  badgeCount: integer("badge_count").notNull().default(0),
  suspendedReason: text("suspended_reason"),
  lastLoginAt: integer("last_login_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
