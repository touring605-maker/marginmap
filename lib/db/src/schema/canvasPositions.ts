import { pgTable, serial, integer, real } from "drizzle-orm/pg-core";
import { businessCasesTable } from "./businessCases";
import { organizationsTable } from "./organizations";

export const canvasPositionsTable = pgTable("canvas_positions", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
  caseId: integer("case_id").notNull().references(() => businessCasesTable.id, { onDelete: "cascade" }),
  x: real("x").notNull().default(0),
  y: real("y").notNull().default(0),
});

export type CanvasPosition = typeof canvasPositionsTable.$inferSelect;
