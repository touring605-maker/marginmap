import { pgTable, serial, varchar, text, timestamp, integer, foreignKey } from "drizzle-orm/pg-core";
import { organizationsTable } from "./organizations";

export const companiesTable = pgTable("companies", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  parentCompanyId: integer("parent_company_id"),
  industry: varchar("industry"),
  logoUrl: text("logo_url"),
  hq: varchar("hq"),
  description: text("description"),
  fiscalYearEnd: varchar("fiscal_year_end"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  foreignKey({
    columns: [t.parentCompanyId],
    foreignColumns: [t.id],
    name: "companies_parent_company_id_fk",
  }).onDelete("set null"),
]);

export const channelsTable = pgTable("channels", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const channelCompaniesTable = pgTable("channel_companies", {
  id: serial("id").primaryKey(),
  channelId: integer("channel_id").notNull().references(() => channelsTable.id, { onDelete: "cascade" }),
  companyId: integer("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
});

export type Company = typeof companiesTable.$inferSelect;
export type InsertCompany = typeof companiesTable.$inferInsert;
export type Channel = typeof channelsTable.$inferSelect;
export type InsertChannel = typeof channelsTable.$inferInsert;
export type ChannelCompany = typeof channelCompaniesTable.$inferSelect;
