import { pgTable, serial, integer, real } from "drizzle-orm/pg-core";
import { businessCasesTable } from "./businessCases";

export const financialObjectivesTable = pgTable("financial_objectives", {
  id: serial("id").primaryKey(),
  businessCaseId: integer("business_case_id").notNull().references(() => businessCasesTable.id, { onDelete: "cascade" }).unique(),
  targetValue: real("target_value").notNull(),
  targetMonth: integer("target_month").notNull(),
});

export type FinancialObjective = typeof financialObjectivesTable.$inferSelect;
export type InsertFinancialObjective = typeof financialObjectivesTable.$inferInsert;
