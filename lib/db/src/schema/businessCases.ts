import { pgTable, serial, varchar, text, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";
import { organizationsTable } from "./organizations";
import { companiesTable } from "./companies";

export const caseStatusEnum = pgEnum("case_status", ["draft", "in_review", "approved"]);
export const caseScenarioModeEnum = pgEnum("case_scenario_mode", ["single", "multi"]);

export const businessCasesTable = pgTable("business_cases", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  orgId: integer("org_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
  ownerId: varchar("owner_id").notNull().references(() => usersTable.id),
  companyId: integer("company_id").references(() => companiesTable.id, { onDelete: "set null" }),
  industry: varchar("industry"),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  timeHorizonMonths: integer("time_horizon_months").notNull().default(36),
  discountRate: real("discount_rate").notNull().default(0.10),
  scenarioType: caseScenarioModeEnum("scenario_type").notNull().default("single"),
  status: caseStatusEnum("status").notNull().default("draft"),
  shareToken: varchar("share_token").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type BusinessCase = typeof businessCasesTable.$inferSelect;
export type InsertBusinessCase = typeof businessCasesTable.$inferInsert;
