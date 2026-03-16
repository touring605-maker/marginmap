import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, gt } from "drizzle-orm";
import { db, exchangeRatesTable } from "@workspace/db";
import { GetExchangeRatesQueryParams, GetExchangeRatesResponse } from "@workspace/api-zod";

const CACHE_TTL_MS = 60 * 60 * 1000;

async function fetchAndCacheRates(baseCurrency: string): Promise<Record<string, number>> {
  const oneHourAgo = new Date(Date.now() - CACHE_TTL_MS);
  const cached = await db.select().from(exchangeRatesTable).where(
    and(eq(exchangeRatesTable.baseCurrency, baseCurrency), gt(exchangeRatesTable.fetchedAt, oneHourAgo))
  );

  if (cached.length > 0) {
    const rates: Record<string, number> = {};
    for (const row of cached) {
      rates[row.targetCurrency] = row.rate;
    }
    return rates;
  }

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
    const data = await res.json() as { result: string; rates: Record<string, number> };

    if (data.result !== "success") {
      return {};
    }

    const now = new Date();
    const values = Object.entries(data.rates).map(([target, rate]) => ({
      baseCurrency,
      targetCurrency: target,
      rate,
      fetchedAt: now,
    }));

    await db.delete(exchangeRatesTable).where(eq(exchangeRatesTable.baseCurrency, baseCurrency));
    if (values.length > 0) {
      await db.insert(exchangeRatesTable).values(values);
    }

    return data.rates;
  } catch {
    return {};
  }
}

const router: IRouter = Router();

router.get("/exchange-rates", async (req: Request, res: Response): Promise<void> => {
  const query = GetExchangeRatesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const base = query.data.base;
  const rates = await fetchAndCacheRates(base);
  res.json(GetExchangeRatesResponse.parse({
    base,
    rates,
    fetchedAt: new Date().toISOString(),
  }));
});

export default router;
