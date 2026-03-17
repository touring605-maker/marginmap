import { pgTable, serial, varchar, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { organizationsTable } from "./organizations";

export const userTemplatesTable = pgTable("user_templates", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  industry: varchar("industry"),
  description: text("description"),
  costItems: jsonb("cost_items").notNull().default([]),
  valueDrivers: jsonb("value_drivers").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type UserTemplate = typeof userTemplatesTable.$inferSelect;
export type InsertUserTemplate = typeof userTemplatesTable.$inferInsert;
