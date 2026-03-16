import { eq, and, isNull, gt } from "drizzle-orm";
import { db, costLineItemsTable, valueDriversTable, financialObjectivesTable, exchangeRatesTable, caseDependenciesTable, businessCasesTable } from "@workspace/db";
import type { BusinessCase } from "@workspace/db";

interface CashFlowPeriod {
  period: number;
  periodLabel: string;
  costs: number;
  benefits: number;
  netCashFlow: number;
  cumulativeNet: number;
  cumulativeCosts: number;
  cumulativeBenefits: number;
  cumulativeNpv: number;
  runningIrr: number | null;
}

interface ObjectiveProgress {
  targetValue: number;
  targetMonth: number;
  projectedValue: number;
  onTrack: boolean;
}

interface FinancialModelResult {
  cashFlows: CashFlowPeriod[];
  npv: number;
  irr: number | null;
  breakevenMonth: number | null;
  paybackPeriodMonths: number | null;
  roi: number;
  totalInvestment: number;
  totalExpectedValue: number;
  confidenceAdjustedValue: number;
  objectiveProgress: ObjectiveProgress | null;
}

const confidenceWeights: Record<string, number> = {
  high: 1.0,
  medium: 0.7,
  low: 0.4,
};

const CACHE_TTL_MS = 60 * 60 * 1000;

async function getExchangeRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;

  const oneHourAgo = new Date(Date.now() - CACHE_TTL_MS);
  const [cached] = await db.select().from(exchangeRatesTable).where(
    and(
      eq(exchangeRatesTable.baseCurrency, from),
      eq(exchangeRatesTable.targetCurrency, to),
      gt(exchangeRatesTable.fetchedAt, oneHourAgo)
    )
  );

  if (cached) return cached.rate;

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await res.json() as { result: string; rates: Record<string, number> };

    if (data.result !== "success") return 1;

    const now = new Date();
    const values = Object.entries(data.rates).map(([target, rate]) => ({
      baseCurrency: from,
      targetCurrency: target,
      rate,
      fetchedAt: now,
    }));

    await db.delete(exchangeRatesTable).where(eq(exchangeRatesTable.baseCurrency, from));
    if (values.length > 0) {
      await db.insert(exchangeRatesTable).values(values);
    }

    return data.rates[to] ?? 1;
  } catch {
    return 1;
  }
}

function calculateIRR(cashFlows: number[], maxIter = 1000, tolerance = 1e-7): number | null {
  if (cashFlows.length < 2) return null;

  const hasPositive = cashFlows.some(cf => cf > 0);
  const hasNegative = cashFlows.some(cf => cf < 0);
  if (!hasPositive || !hasNegative) return null;

  let rate = 0.1 / 12;

  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let j = 0; j < cashFlows.length; j++) {
      const factor = Math.pow(1 + rate, j + 1);
      npv += cashFlows[j] / factor;
      dnpv -= (j + 1) * cashFlows[j] / Math.pow(1 + rate, j + 2);
    }
    if (Math.abs(npv) < tolerance) {
      return rate * 12;
    }
    if (Math.abs(dnpv) < tolerance) return null;
    rate = rate - npv / dnpv;
    if (!isFinite(rate) || rate < -1) return null;
  }
  return null;
}

function computeMonthlyCost(cost: { amount: number; frequency: string; escalationRate: number | null; currency?: string | null }, month: number, fxRate: number): number {
  const yearIndex = Math.floor(month / 12);
  const escalation = cost.escalationRate ? Math.pow(1 + cost.escalationRate / 100, yearIndex) : 1;
  let val = 0;

  if (cost.frequency === "once" && month === 0) {
    val = cost.amount;
  } else if (cost.frequency === "monthly") {
    val = cost.amount * escalation;
  } else if (cost.frequency === "annually" && month % 12 === 0) {
    val = cost.amount * escalation;
  }

  return val * fxRate;
}

function computeMonthlyBenefit(value: { annualValue: number; monthsToRealize: number; currency?: string | null }, month: number, fxRate: number): number {
  if (month >= value.monthsToRealize) {
    return (value.annualValue / 12) * fxRate;
  }
  return 0;
}

async function getCascadedValueFromUpstream(
  targetCaseId: number,
  targetCurrency: string
): Promise<number> {
  const incomingDeps = await db
    .select()
    .from(caseDependenciesTable)
    .where(eq(caseDependenciesTable.toCaseId, targetCaseId));

  let cascadedTotal = 0;
  for (const dep of incomingDeps) {
    if (!dep.cascadeField) continue;

    const [sourceCase] = await db
      .select()
      .from(businessCasesTable)
      .where(eq(businessCasesTable.id, dep.fromCaseId));
    if (!sourceCase) continue;

    const sourceModel = await computeFinancialModelInternal(sourceCase, null, true);
    let sourceValue = 0;
    switch (dep.cascadeField) {
      case "npv": sourceValue = sourceModel.npv; break;
      case "totalAnnualSavings": sourceValue = sourceModel.totalExpectedValue / Math.max(1, sourceCase.timeHorizonMonths / 12); break;
      case "totalExpectedValue": sourceValue = sourceModel.totalExpectedValue; break;
      case "confidenceAdjustedValue": sourceValue = sourceModel.confidenceAdjustedValue; break;
      default: continue;
    }

    if (dep.dependencyType === "conditional" && dep.conditionThreshold != null) {
      if (sourceValue < dep.conditionThreshold) continue;
    }

    const fxRate = await getExchangeRate(sourceCase.currency, targetCurrency);
    cascadedTotal += sourceValue * fxRate;
  }

  return cascadedTotal;
}

async function computeFinancialModelInternal(
  bc: BusinessCase,
  scenarioId?: number | null,
  skipCascade?: boolean
): Promise<FinancialModelResult> {
  const costConditions = scenarioId
    ? [eq(costLineItemsTable.businessCaseId, bc.id), eq(costLineItemsTable.scenarioId, scenarioId)]
    : [eq(costLineItemsTable.businessCaseId, bc.id), isNull(costLineItemsTable.scenarioId)];

  const valueConditions = scenarioId
    ? [eq(valueDriversTable.businessCaseId, bc.id), eq(valueDriversTable.scenarioId, scenarioId)]
    : [eq(valueDriversTable.businessCaseId, bc.id), isNull(valueDriversTable.scenarioId)];

  const costs = await db.select().from(costLineItemsTable).where(and(...costConditions));
  const values = await db.select().from(valueDriversTable).where(and(...valueConditions));
  const [objective] = await db.select().from(financialObjectivesTable).where(eq(financialObjectivesTable.businessCaseId, bc.id));

  const caseCurrency = bc.currency;

  const costCurrencies = new Set(costs.map(c => c.currency ?? caseCurrency));
  const valueCurrencies = new Set(values.map(v => v.currency ?? caseCurrency));
  const allCurrencies = new Set([...costCurrencies, ...valueCurrencies]);
  allCurrencies.delete(caseCurrency);

  const fxRates: Record<string, number> = {};
  for (const cur of allCurrencies) {
    fxRates[cur] = await getExchangeRate(cur, caseCurrency);
  }
  fxRates[caseCurrency] = 1;

  let cascadedAnnualValue = 0;
  if (!skipCascade) {
    const cascadedTotal = await getCascadedValueFromUpstream(bc.id, caseCurrency);
    cascadedAnnualValue = cascadedTotal;
  }

  const months = bc.timeHorizonMonths;
  const discountRate = bc.discountRate;
  const monthlyRate = discountRate / 12;

  const monthlyBenefits: number[] = [];
  const monthlyNetFlows: number[] = [];
  let totalInvestment = 0;
  let totalExpectedValue = 0;

  for (let m = 0; m < months; m++) {
    let monthlyCost = 0;
    let monthlyBenefit = 0;

    for (const cost of costs) {
      const fxRate = fxRates[cost.currency ?? caseCurrency] ?? 1;
      monthlyCost += computeMonthlyCost(cost, m, fxRate);
    }

    for (const value of values) {
      const fxRate = fxRates[value.currency ?? caseCurrency] ?? 1;
      monthlyBenefit += computeMonthlyBenefit(value, m, fxRate);
    }

    if (cascadedAnnualValue > 0) {
      monthlyBenefit += cascadedAnnualValue / 12;
    }

    totalInvestment += monthlyCost;
    totalExpectedValue += monthlyBenefit;
    monthlyBenefits.push(monthlyBenefit);
    monthlyNetFlows.push(monthlyBenefit - monthlyCost);
  }

  let confidenceAdjustedValue = 0;
  for (const value of values) {
    const fxRate = fxRates[value.currency ?? caseCurrency] ?? 1;
    const activeMonths = Math.max(0, months - value.monthsToRealize);
    const weight = confidenceWeights[value.confidenceLevel] ?? 0.7;
    confidenceAdjustedValue += (value.annualValue / 12) * activeMonths * weight * fxRate;
  }

  let cumulative = 0;
  let breakevenMonth: number | null = null;
  let cumulativeNpv = 0;
  let runningCumulativeCosts = 0;
  let runningCumulativeBenefits = 0;

  const cashFlows: CashFlowPeriod[] = [];

  for (let i = 0; i < months; i++) {
    const net = monthlyNetFlows[i];
    cumulative += net;

    if (breakevenMonth === null && cumulative >= 0) {
      breakevenMonth = i + 1;
    }

    const discountFactor = Math.pow(1 + monthlyRate, i + 1);
    cumulativeNpv += net / discountFactor;

    const netFlowsUpToNow = monthlyNetFlows.slice(0, i + 1);
    const runningIrr = i >= 1 ? calculateIRR(netFlowsUpToNow) : null;

    let monthlyCostPeriod = 0;
    let monthlyBenefitPeriod = 0;
    for (const cost of costs) {
      const fxRate = fxRates[cost.currency ?? caseCurrency] ?? 1;
      monthlyCostPeriod += computeMonthlyCost(cost, i, fxRate);
    }
    for (const value of values) {
      const fxRate = fxRates[value.currency ?? caseCurrency] ?? 1;
      monthlyBenefitPeriod += computeMonthlyBenefit(value, i, fxRate);
    }
    if (cascadedAnnualValue > 0) {
      monthlyBenefitPeriod += cascadedAnnualValue / 12;
    }

    runningCumulativeCosts += monthlyCostPeriod;
    runningCumulativeBenefits += monthlyBenefitPeriod;

    cashFlows.push({
      period: i + 1,
      periodLabel: `Month ${i + 1}`,
      costs: Math.round(monthlyCostPeriod * 100) / 100,
      benefits: Math.round(monthlyBenefitPeriod * 100) / 100,
      netCashFlow: Math.round(net * 100) / 100,
      cumulativeNet: Math.round(cumulative * 100) / 100,
      cumulativeCosts: Math.round(runningCumulativeCosts * 100) / 100,
      cumulativeBenefits: Math.round(runningCumulativeBenefits * 100) / 100,
      cumulativeNpv: Math.round(cumulativeNpv * 100) / 100,
      runningIrr: runningIrr !== null ? Math.round(runningIrr * 10000) / 10000 : null,
    });
  }

  const npv = cashFlows.length > 0 ? cashFlows[cashFlows.length - 1].cumulativeNpv : 0;
  const irr = calculateIRR(monthlyNetFlows);
  const roi = totalInvestment > 0 ? (totalExpectedValue - totalInvestment) / totalInvestment : 0;

  let objectiveProgress: ObjectiveProgress | null = null;
  if (objective) {
    const projectedAtTarget = cashFlows.find(cf => cf.period === objective.targetMonth);
    const projectedValue = projectedAtTarget ? projectedAtTarget.cumulativeNpv : (cashFlows.length > 0 ? cashFlows[cashFlows.length - 1].cumulativeNpv : 0);
    objectiveProgress = {
      targetValue: objective.targetValue,
      targetMonth: objective.targetMonth,
      projectedValue: Math.round(projectedValue * 100) / 100,
      onTrack: projectedValue >= objective.targetValue,
    };
  }

  return {
    cashFlows,
    npv: Math.round(npv * 100) / 100,
    irr: irr !== null ? Math.round(irr * 10000) / 10000 : null,
    breakevenMonth,
    paybackPeriodMonths: breakevenMonth,
    roi: Math.round(roi * 10000) / 10000,
    totalInvestment: Math.round(totalInvestment * 100) / 100,
    totalExpectedValue: Math.round(totalExpectedValue * 100) / 100,
    confidenceAdjustedValue: Math.round(confidenceAdjustedValue * 100) / 100,
    objectiveProgress,
  };
}

export async function computeFinancialModel(
  bc: BusinessCase,
  scenarioId?: number | null
): Promise<FinancialModelResult> {
  return computeFinancialModelInternal(bc, scenarioId, false);
}
