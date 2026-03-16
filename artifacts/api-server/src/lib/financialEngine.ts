import { eq, and, isNull } from "drizzle-orm";
import { db, costLineItemsTable, valueDriversTable, financialObjectivesTable } from "@workspace/db";
import type { BusinessCase } from "@workspace/db";

interface CashFlowPeriod {
  period: number;
  periodLabel: string;
  costs: number;
  benefits: number;
  netCashFlow: number;
  cumulativeNet: number;
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

function calculateNPV(cashFlows: number[], discountRate: number): number {
  const monthlyRate = discountRate / 12;
  return cashFlows.reduce((npv, cf, i) => npv + cf / Math.pow(1 + monthlyRate, i + 1), 0);
}

function calculateIRR(cashFlows: number[], maxIter = 1000, tolerance = 1e-7): number | null {
  if (cashFlows.length < 2) return null;

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

export async function computeFinancialModel(
  bc: BusinessCase,
  scenarioId?: number | null
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

  const months = bc.timeHorizonMonths;
  const monthlyFlows: number[] = [];
  let totalInvestment = 0;
  let totalExpectedValue = 0;
  let confidenceAdjustedValue = 0;

  for (let m = 0; m < months; m++) {
    let monthlyCost = 0;
    let monthlyBenefit = 0;

    for (const cost of costs) {
      const yearIndex = Math.floor(m / 12);
      const escalation = cost.escalationRate ? Math.pow(1 + cost.escalationRate / 100, yearIndex) : 1;

      if (cost.frequency === "once" && m === 0) {
        monthlyCost += cost.amount;
      } else if (cost.frequency === "monthly") {
        monthlyCost += cost.amount * escalation;
      } else if (cost.frequency === "annually" && m % 12 === 0) {
        monthlyCost += cost.amount * escalation;
      }
    }

    for (const value of values) {
      if (m >= value.monthsToRealize) {
        monthlyBenefit += value.annualValue / 12;
      }
    }

    totalInvestment += monthlyCost;
    totalExpectedValue += monthlyBenefit;

    monthlyFlows.push(monthlyBenefit - monthlyCost);
  }

  for (const value of values) {
    const activeMonths = Math.max(0, months - value.monthsToRealize);
    const weight = confidenceWeights[value.confidenceLevel] ?? 0.7;
    confidenceAdjustedValue += (value.annualValue / 12) * activeMonths * weight;
  }

  let cumulative = 0;
  let breakevenMonth: number | null = null;
  const cashFlows: CashFlowPeriod[] = monthlyFlows.map((net, i) => {
    cumulative += net;
    if (breakevenMonth === null && cumulative >= 0 && i > 0) {
      breakevenMonth = i + 1;
    }

    let monthlyCost = 0;
    let monthlyBenefit = 0;
    for (const cost of costs) {
      const yearIndex = Math.floor(i / 12);
      const escalation = cost.escalationRate ? Math.pow(1 + cost.escalationRate / 100, yearIndex) : 1;
      if (cost.frequency === "once" && i === 0) monthlyCost += cost.amount;
      else if (cost.frequency === "monthly") monthlyCost += cost.amount * escalation;
      else if (cost.frequency === "annually" && i % 12 === 0) monthlyCost += cost.amount * escalation;
    }
    for (const value of values) {
      if (i >= value.monthsToRealize) {
        monthlyBenefit += value.annualValue / 12;
      }
    }

    return {
      period: i + 1,
      periodLabel: `Month ${i + 1}`,
      costs: Math.round(monthlyCost * 100) / 100,
      benefits: Math.round(monthlyBenefit * 100) / 100,
      netCashFlow: Math.round(net * 100) / 100,
      cumulativeNet: Math.round(cumulative * 100) / 100,
    };
  });

  const npv = calculateNPV(monthlyFlows, bc.discountRate);
  const irr = calculateIRR(monthlyFlows);
  const roi = totalInvestment > 0 ? (totalExpectedValue - totalInvestment) / totalInvestment : 0;

  let objectiveProgress: ObjectiveProgress | null = null;
  if (objective) {
    const projectedAtTarget = cashFlows.find(cf => cf.period === objective.targetMonth);
    const projectedValue = projectedAtTarget ? projectedAtTarget.cumulativeNet : cumulative;
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
