import { pgTable, text, serial, timestamp, boolean, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  mobile: text("mobile").notNull(),
  gender: text("gender"),
  city: text("city"),
  state: text("state"),
  status: text("status").notNull().default("active"),
  isVerified: boolean("is_verified").notNull().default(false),
  totalDistance: real("total_distance").notNull().default(0),
  walkingDistance: real("walking_distance").notNull().default(0),
  runningDistance: real("running_distance").notNull().default(0),
  cyclingDistance: real("cycling_distance").notNull().default(0),
  totalActivities: integer("total_activities").notNull().default(0),
  totalCalories: integer("total_calories").notNull().default(0),
  points: integer("points").notNull().default(0),
  badgeCount: integer("badge_count").notNull().default(0),
  suspendedReason: text("suspended_reason"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
