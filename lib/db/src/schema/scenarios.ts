import { pgTable, serial, varchar, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { businessCasesTable } from "./businessCases";

export const scenarioTypeEnum = pgEnum("scenario_type", ["base", "optimistic", "conservative"]);

export const scenariosTable = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  businessCaseId: integer("business_case_id").notNull().references(() => businessCasesTable.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  type: scenarioTypeEnum("type").notNull().default("base"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Scenario = typeof scenariosTable.$inferSelect;
export type InsertScenario = typeof scenariosTable.$inferInsert;
