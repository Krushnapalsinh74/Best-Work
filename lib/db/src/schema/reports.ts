import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reportsTable = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reporterId: integer("reporter_id").notNull(),
  reporterName: text("reporter_name").notNull(),
  reportedUserId: integer("reported_user_id"),
  reportedUserName: text("reported_user_name"),
  reportedActivityId: integer("reported_activity_id"),
  type: text("type").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  resolution: text("resolution"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  resolvedAt: integer("resolved_at", { mode: "timestamp_ms" }),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({ id: true, createdAt: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
