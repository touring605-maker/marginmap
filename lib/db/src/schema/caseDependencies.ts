import { pgTable, serial, integer, real, varchar, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { businessCasesTable } from "./businessCases";

export const dependencyTypeEnum = pgEnum("dependency_type", ["sequential", "parallel", "conditional"]);

export const caseDependenciesTable = pgTable("case_dependencies", {
  id: serial("id").primaryKey(),
  fromCaseId: integer("from_case_id").notNull().references(() => businessCasesTable.id, { onDelete: "cascade" }),
  toCaseId: integer("to_case_id").notNull().references(() => businessCasesTable.id, { onDelete: "cascade" }),
  dependencyType: dependencyTypeEnum("dependency_type").notNull(),
  conditionThreshold: real("condition_threshold"),
  cascadeField: varchar("cascade_field"),
  canvasPositionJson: jsonb("canvas_position_json"),
});

export type CaseDependency = typeof caseDependenciesTable.$inferSelect;
export type InsertCaseDependency = typeof caseDependenciesTable.$inferInsert;
