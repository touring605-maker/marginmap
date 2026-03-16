import { pgTable, serial, varchar, text, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { businessCasesTable } from "./businessCases";
import { scenariosTable } from "./scenarios";

export const costTypeEnum = pgEnum("cost_type", ["one_time", "capex", "opex", "escalating", "transition"]);
export const frequencyEnum = pgEnum("frequency", ["once", "monthly", "annually"]);

export const costLineItemsTable = pgTable("cost_line_items", {
  id: serial("id").primaryKey(),
  businessCaseId: integer("business_case_id").notNull().references(() => businessCasesTable.id, { onDelete: "cascade" }),
  scenarioId: integer("scenario_id").references(() => scenariosTable.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  type: costTypeEnum("type").notNull(),
  amount: real("amount").notNull(),
  frequency: frequencyEnum("frequency").notNull().default("once"),
  escalationRate: real("escalation_rate"),
  depreciationYears: integer("depreciation_years"),
  currency: varchar("currency", { length: 10 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CostLineItem = typeof costLineItemsTable.$inferSelect;
export type InsertCostLineItem = typeof costLineItemsTable.$inferInsert;
