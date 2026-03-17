import { pgTable, serial, varchar, text, integer, real, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { businessCasesTable } from "./businessCases";
import { scenariosTable } from "./scenarios";

export const valueTypeEnum = pgEnum("value_type", ["cost_reduction", "revenue", "margin", "productivity", "risk"]);
export const confidenceEnum = pgEnum("confidence_level", ["high", "medium", "low"]);

export const valueDriversTable = pgTable("value_drivers", {
  id: serial("id").primaryKey(),
  businessCaseId: integer("business_case_id").notNull().references(() => businessCasesTable.id, { onDelete: "cascade" }),
  scenarioId: integer("scenario_id").references(() => scenariosTable.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  type: valueTypeEnum("type").notNull(),
  annualValue: real("annual_value").notNull(),
  confidenceLevel: confidenceEnum("confidence_level").notNull().default("medium"),
  monthsToRealize: integer("months_to_realize").notNull().default(0),
  currency: varchar("currency", { length: 10 }),
  isAutoCalculated: boolean("is_auto_calculated").notNull().default(false),
  autoCalcKey: varchar("auto_calc_key", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ValueDriver = typeof valueDriversTable.$inferSelect;
export type InsertValueDriver = typeof valueDriversTable.$inferInsert;
