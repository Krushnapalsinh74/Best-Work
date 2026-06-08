import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pointsPerKmWalking: real("points_per_km_walking").notNull().default(1),
  pointsPerKmRunning: real("points_per_km_running").notNull().default(2),
  pointsPerKmCycling: real("points_per_km_cycling").notNull().default(0.5),
  minActivityDistanceKm: real("min_activity_distance_km").notNull().default(0.5),
  maxSpeedWalkingKmh: real("max_speed_walking_kmh").notNull().default(15),
  maxSpeedRunningKmh: real("max_speed_running_kmh").notNull().default(30),
  maxSpeedCyclingKmh: real("max_speed_cycling_kmh").notNull().default(60),
  maintenanceMode: integer("maintenance_mode", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
