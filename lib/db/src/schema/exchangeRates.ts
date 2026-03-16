import { pgTable, serial, varchar, real, timestamp } from "drizzle-orm/pg-core";

export const exchangeRatesTable = pgTable("exchange_rates", {
  id: serial("id").primaryKey(),
  baseCurrency: varchar("base_currency", { length: 10 }).notNull(),
  targetCurrency: varchar("target_currency", { length: 10 }).notNull(),
  rate: real("rate").notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ExchangeRate = typeof exchangeRatesTable.$inferSelect;
