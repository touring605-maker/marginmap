import { pgTable, serial, varchar, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const orgRoleEnum = pgEnum("org_role", ["owner", "admin", "member"]);

export const organizationsTable = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const organizationMembersTable = pgTable("organization_members", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizationsTable.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  role: orgRoleEnum("role").notNull().default("member"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Organization = typeof organizationsTable.$inferSelect;
export type OrganizationMember = typeof organizationMembersTable.$inferSelect;
