export type Channel = 'wholesale' | 'dtc' | 'dropship';
export type SharedCostBehavior = 'fixed' | 'stepFixed' | 'variable';

export interface BaselineData {
  wholesaleVolume: number;
  dtcVolume: number;
  dropshipVolume: number;
  wholesaleASP: number;
  wholesaleDiscountRate: number;
  dtcASP: number;
  dtcReturnRate: number;
  dropshipServiceFeeRate: number;
  dropshipMarketplaceFeeRate: number;
  cogsPerUnit: number;
  dtcFulfillmentCostPerUnit: number;
  dropshipFulfillmentCostPerOrder: number;
  dtcCAC: number;
  wholesaleCommissionRate: number;
  returnProcessingCostPerUnit: number;
  totalSharedCostPool: number;
  sharedCostBehavior: SharedCostBehavior;
  stepFixedThresholdVolume?: number;
  stepFixedIncrease?: number;
  warehouseCapacityUnits: number;
  wholesaleInventoryUnits: number;
  dtcInventoryUnits: number;
  dropshipInventoryUnits: number;
}

export interface ChannelMixShift {
  from: Channel;
  to: Channel;
  pct: number;
}

export interface ScenarioDriverOverrides {
  wholesaleVolume?: number;
  dtcVolume?: number;
  dropshipVolume?: number;
  channelMixShift?: ChannelMixShift;
  wholesaleASP?: number;
  wholesaleDiscountRate?: number;
  dtcASP?: number;
  dtcReturnRate?: number;
  dropshipServiceFeeRate?: number;
  dropshipMarketplaceFeeRate?: number;
  dtcFulfillmentCostPerUnit?: number;
  dropshipFulfillmentCostPerOrder?: number;
  dtcCAC?: number;
  wholesaleCommissionRate?: number;
  returnProcessingCostPerUnit?: number;
  totalSharedCostPool?: number;
  sharedCostBehavior?: SharedCostBehavior;
}

export interface Scenario {
  id: string;
  name: string;
  isBaseline: boolean;
  drivers: ScenarioDriverOverrides;
  createdAt: string;
}

export interface MarginMapState {
  baseline: BaselineData | null;
  scenarios: Scenario[];
  activeScenarioIds: string[];
  setupComplete: boolean;
}

export interface ChannelMetrics {
  channel: Channel;
  volume: number;
  grossRevenue: number;
  netRevenue: number;
  grossMargin: number;
  grossMarginPct: number;
  channelVariableCosts: number;
  contributionMargin: number;
  contributionMarginPct: number;
  allocatedSharedCosts: number;
  channelNetMargin: number;
  channelNetMarginPct: number;
}

export interface AggregateMetrics {
  totalRevenue: number;
  blendedGrossMarginPct: number;
  blendedContributionMarginPct: number;
  totalContributionMargin: number;
  totalNetMargin: number;
  revenueMix: Record<Channel, number>;
  contributionMix: Record<Channel, number>;
}

export interface ConstraintFlag {
  type: 'warehouse_capacity' | 'inventory_shortfall' | 'cac_payback';
  channel?: Channel;
  scenarioName: string;
  message: string;
  value?: number;
  severity: 'warning' | 'critical';
}

export interface ScenarioResult {
  scenario: Scenario;
  channels: Record<Channel, ChannelMetrics>;
  aggregate: AggregateMetrics;
  constraints: ConstraintFlag[];
}

function resolveDrivers(baseline: BaselineData, overrides: ScenarioDriverOverrides): BaselineData {
  const resolved = { ...baseline };

  if (overrides.wholesaleVolume !== undefined) resolved.wholesaleVolume = overrides.wholesaleVolume;
  if (overrides.dtcVolume !== undefined) resolved.dtcVolume = overrides.dtcVolume;
  if (overrides.dropshipVolume !== undefined) resolved.dropshipVolume = overrides.dropshipVolume;
  if (overrides.wholesaleASP !== undefined) resolved.wholesaleASP = overrides.wholesaleASP;
  if (overrides.wholesaleDiscountRate !== undefined) resolved.wholesaleDiscountRate = overrides.wholesaleDiscountRate;
  if (overrides.dtcASP !== undefined) resolved.dtcASP = overrides.dtcASP;
  if (overrides.dtcReturnRate !== undefined) resolved.dtcReturnRate = overrides.dtcReturnRate;
  if (overrides.dropshipServiceFeeRate !== undefined) resolved.dropshipServiceFeeRate = overrides.dropshipServiceFeeRate;
  if (overrides.dropshipMarketplaceFeeRate !== undefined) resolved.dropshipMarketplaceFeeRate = overrides.dropshipMarketplaceFeeRate;
  if (overrides.dtcFulfillmentCostPerUnit !== undefined) resolved.dtcFulfillmentCostPerUnit = overrides.dtcFulfillmentCostPerUnit;
  if (overrides.dropshipFulfillmentCostPerOrder !== undefined) resolved.dropshipFulfillmentCostPerOrder = overrides.dropshipFulfillmentCostPerOrder;
  if (overrides.dtcCAC !== undefined) resolved.dtcCAC = overrides.dtcCAC;
  if (overrides.wholesaleCommissionRate !== undefined) resolved.wholesaleCommissionRate = overrides.wholesaleCommissionRate;
  if (overrides.returnProcessingCostPerUnit !== undefined) resolved.returnProcessingCostPerUnit = overrides.returnProcessingCostPerUnit;
  if (overrides.totalSharedCostPool !== undefined) resolved.totalSharedCostPool = overrides.totalSharedCostPool;
  if (overrides.sharedCostBehavior !== undefined) resolved.sharedCostBehavior = overrides.sharedCostBehavior;

  if (overrides.channelMixShift) {
    const { from, to, pct: rawPct } = overrides.channelMixShift;
    const pct = Math.max(0, Math.min(1, rawPct));
    const volumeKey = (ch: Channel) => `${ch}Volume` as keyof BaselineData;
    const fromVol = resolved[volumeKey(from)] as number;
    const shift = Math.round(fromVol * pct);
    (resolved as Record<string, unknown>)[volumeKey(from)] = fromVol - shift;
    (resolved as Record<string, unknown>)[volumeKey(to)] = (resolved[volumeKey(to)] as number) + shift;
  }

  return resolved;
}

function computeChannelMetrics(channel: Channel, d: BaselineData): ChannelMetrics {
  let volume: number;
  let grossRevenue: number;
  let netRevenue: number;
  let channelVariableCosts: number;

  switch (channel) {
    case 'wholesale': {
      volume = d.wholesaleVolume;
      grossRevenue = volume * d.wholesaleASP * (1 - d.wholesaleDiscountRate);
      netRevenue = grossRevenue;
      channelVariableCosts = grossRevenue * d.wholesaleCommissionRate;
      break;
    }
    case 'dtc': {
      volume = d.dtcVolume;
      grossRevenue = volume * d.dtcASP;
      const returnedUnits = volume * d.dtcReturnRate;
      const returnRevenueLoss = returnedUnits * d.dtcASP;
      netRevenue = grossRevenue - returnRevenueLoss;
      const fulfillmentCost = volume * d.dtcFulfillmentCostPerUnit;
      const returnProcessingCost = returnedUnits * d.returnProcessingCostPerUnit;
      const acquisitionCost = volume * d.dtcCAC;
      channelVariableCosts = fulfillmentCost + returnProcessingCost + acquisitionCost;
      break;
    }
    case 'dropship': {
      volume = d.dropshipVolume;
      grossRevenue = volume * d.dropshipServiceFeeRate * d.dtcASP;
      netRevenue = grossRevenue;
      const fulfillmentCost = volume * d.dropshipFulfillmentCostPerOrder;
      const platformFees = grossRevenue * d.dropshipMarketplaceFeeRate;
      channelVariableCosts = fulfillmentCost + platformFees;
      break;
    }
  }

  const totalCOGS = volume * d.cogsPerUnit;
  const grossMargin = netRevenue - totalCOGS;
  const grossMarginPct = netRevenue !== 0 ? grossMargin / netRevenue : 0;
  const contributionMargin = grossMargin - channelVariableCosts;
  const contributionMarginPct = netRevenue !== 0 ? contributionMargin / netRevenue : 0;

  return {
    channel,
    volume,
    grossRevenue,
    netRevenue,
    grossMargin,
    grossMarginPct,
    channelVariableCosts,
    contributionMargin,
    contributionMarginPct,
    allocatedSharedCosts: 0,
    channelNetMargin: contributionMargin,
    channelNetMarginPct: contributionMarginPct,
  };
}

function computeSharedCostPool(d: BaselineData, baseline: BaselineData): number {
  const totalVolume = d.wholesaleVolume + d.dtcVolume + d.dropshipVolume;
  const baselineVolume = baseline.wholesaleVolume + baseline.dtcVolume + baseline.dropshipVolume;

  switch (d.sharedCostBehavior) {
    case 'fixed':
      return d.totalSharedCostPool;
    case 'stepFixed': {
      const threshold = d.stepFixedThresholdVolume ?? baselineVolume;
      const increase = d.stepFixedIncrease ?? 0;
      return totalVolume > threshold
        ? d.totalSharedCostPool + increase
        : d.totalSharedCostPool;
    }
    case 'variable': {
      if (baselineVolume === 0) return d.totalSharedCostPool;
      return d.totalSharedCostPool * (totalVolume / baselineVolume);
    }
    default:
      return d.totalSharedCostPool;
  }
}

function allocateSharedCosts(
  channels: Record<Channel, ChannelMetrics>,
  sharedPool: number
): void {
  const totalRevenue =
    channels.wholesale.netRevenue +
    channels.dtc.netRevenue +
    channels.dropship.netRevenue;

  const allChannels: Channel[] = ['wholesale', 'dtc', 'dropship'];
  for (const ch of allChannels) {
    const share = totalRevenue !== 0 ? channels[ch].netRevenue / totalRevenue : 1 / 3;
    const allocated = sharedPool * share;
    channels[ch].allocatedSharedCosts = allocated;
    channels[ch].channelNetMargin = channels[ch].contributionMargin - allocated;
    channels[ch].channelNetMarginPct =
      channels[ch].netRevenue !== 0
        ? channels[ch].channelNetMargin / channels[ch].netRevenue
        : 0;
  }
}

function computeAggregate(channels: Record<Channel, ChannelMetrics>): AggregateMetrics {
  const allChannels: Channel[] = ['wholesale', 'dtc', 'dropship'];
  const totalRevenue = allChannels.reduce((s, ch) => s + channels[ch].netRevenue, 0);
  const totalGrossMargin = allChannels.reduce((s, ch) => s + channels[ch].grossMargin, 0);
  const totalContributionMargin = allChannels.reduce((s, ch) => s + channels[ch].contributionMargin, 0);
  const totalNetMargin = allChannels.reduce((s, ch) => s + channels[ch].channelNetMargin, 0);

  const blendedGrossMarginPct = totalRevenue !== 0 ? totalGrossMargin / totalRevenue : 0;
  const blendedContributionMarginPct = totalRevenue !== 0 ? totalContributionMargin / totalRevenue : 0;

  const revenueMix: Record<Channel, number> = {
    wholesale: totalRevenue !== 0 ? channels.wholesale.netRevenue / totalRevenue : 0,
    dtc: totalRevenue !== 0 ? channels.dtc.netRevenue / totalRevenue : 0,
    dropship: totalRevenue !== 0 ? channels.dropship.netRevenue / totalRevenue : 0,
  };

  const contributionMix: Record<Channel, number> = {
    wholesale: totalContributionMargin !== 0 ? channels.wholesale.contributionMargin / totalContributionMargin : 0,
    dtc: totalContributionMargin !== 0 ? channels.dtc.contributionMargin / totalContributionMargin : 0,
    dropship: totalContributionMargin !== 0 ? channels.dropship.contributionMargin / totalContributionMargin : 0,
  };

  return {
    totalRevenue,
    blendedGrossMarginPct,
    blendedContributionMarginPct,
    totalContributionMargin,
    totalNetMargin,
    revenueMix,
    contributionMix,
  };
}

function checkConstraints(
  scenario: Scenario,
  d: BaselineData,
  channels: Record<Channel, ChannelMetrics>
): ConstraintFlag[] {
  const flags: ConstraintFlag[] = [];
  const totalVolume = d.wholesaleVolume + d.dtcVolume + d.dropshipVolume;

  if (totalVolume > d.warehouseCapacityUnits) {
    flags.push({
      type: 'warehouse_capacity',
      scenarioName: scenario.name,
      message: `Total volume (${totalVolume.toLocaleString()}) exceeds warehouse capacity (${d.warehouseCapacityUnits.toLocaleString()})`,
      value: totalVolume,
      severity: totalVolume > d.warehouseCapacityUnits * 1.1 ? 'critical' : 'warning',
    });
  }

  const inventoryMap: Record<Channel, { volume: number; available: number }> = {
    wholesale: { volume: d.wholesaleVolume, available: d.wholesaleInventoryUnits },
    dtc: { volume: d.dtcVolume, available: d.dtcInventoryUnits },
    dropship: { volume: d.dropshipVolume, available: d.dropshipInventoryUnits },
  };

  for (const ch of ['wholesale', 'dtc', 'dropship'] as Channel[]) {
    const { volume, available } = inventoryMap[ch];
    if (volume > available) {
      flags.push({
        type: 'inventory_shortfall',
        channel: ch,
        scenarioName: scenario.name,
        message: `${ch.toUpperCase()} volume (${volume.toLocaleString()}) exceeds available inventory (${available.toLocaleString()})`,
        value: volume - available,
        severity: 'warning',
      });
    }
  }

  if (channels.dtc.contributionMargin > 0 && d.dtcVolume > 0) {
    const cmPerUnit = channels.dtc.contributionMargin / d.dtcVolume;
    const paybackMonths = cmPerUnit > 0 ? d.dtcCAC / cmPerUnit : Infinity;
    if (paybackMonths > 12) {
      flags.push({
        type: 'cac_payback',
        channel: 'dtc',
        scenarioName: scenario.name,
        message: `DTC CAC payback period is ${paybackMonths === Infinity ? '∞' : paybackMonths.toFixed(1)} months (>12 months)`,
        value: paybackMonths,
        severity: 'critical',
      });
    }
  }

  return flags;
}

export function computeScenario(
  baseline: BaselineData,
  scenario: Scenario
): ScenarioResult {
  const d = scenario.isBaseline ? baseline : resolveDrivers(baseline, scenario.drivers);

  const channels: Record<Channel, ChannelMetrics> = {
    wholesale: computeChannelMetrics('wholesale', d),
    dtc: computeChannelMetrics('dtc', d),
    dropship: computeChannelMetrics('dropship', d),
  };

  const sharedPool = computeSharedCostPool(d, baseline);
  allocateSharedCosts(channels, sharedPool);

  const aggregate = computeAggregate(channels);
  const constraints = checkConstraints(scenario, d, channels);

  return { scenario, channels, aggregate, constraints };
}

export function computeAllScenarios(
  baseline: BaselineData,
  scenarios: Scenario[]
): ScenarioResult[] {
  return scenarios.map((s) => computeScenario(baseline, s));
}

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString();
}

export const DRIVER_LABELS: Record<string, string> = {
  wholesaleVolume: 'Wholesale Unit Volume',
  dtcVolume: 'DTC Unit Volume',
  dropshipVolume: 'Dropship Order Volume',
  wholesaleASP: 'Wholesale ASP',
  wholesaleDiscountRate: 'Wholesale Discount Rate',
  dtcASP: 'DTC ASP',
  dtcReturnRate: 'DTC Return Rate',
  dropshipServiceFeeRate: 'Dropship Service Fee Rate',
  dropshipMarketplaceFeeRate: 'Marketplace/Platform Fees',
  cogsPerUnit: 'Product COGS / Unit',
  dtcFulfillmentCostPerUnit: 'Fulfillment Cost / Unit (DTC)',
  dropshipFulfillmentCostPerOrder: 'Fulfillment Cost / Order (Dropship)',
  dtcCAC: 'Customer Acquisition Cost (DTC)',
  wholesaleCommissionRate: 'Sales Commission Rate (Wholesale)',
  returnProcessingCostPerUnit: 'Return Processing Cost / Unit',
  totalSharedCostPool: 'Total Shared Cost Pool',
  sharedCostBehavior: 'Shared Cost Behavior',
  stepFixedThresholdVolume: 'Step-Fixed Threshold Volume',
  stepFixedIncrease: 'Step-Fixed Increase Amount',
  warehouseCapacityUnits: 'Warehouse Throughput Ceiling',
  wholesaleInventoryUnits: 'Wholesale Inventory Available',
  dtcInventoryUnits: 'DTC Inventory Available',
  dropshipInventoryUnits: 'Dropship Inventory Available',
};

export const JARGON_TOOLTIPS: Record<string, string> = {
  'Gross Revenue': 'Total revenue before any deductions like returns or discounts.',
  'Net Revenue': 'Revenue after returns, discounts, and allowances are subtracted.',
  'Gross Margin': 'Revenue minus the direct cost of goods sold (COGS). Shows how much you keep after production costs.',
  'Channel Variable Costs': 'Costs that change with sales volume in a channel — fulfillment, commissions, ad spend, etc.',
  'Contribution Margin': 'What is left after subtracting all variable costs from gross margin. Shows the profit each channel contributes before shared overhead.',
  'Allocated Shared Costs': 'Portion of company-wide overhead (warehouse, tech, G&A) assigned to this channel based on its share of revenue.',
  'Channel Net Margin': 'The bottom-line profit for a channel after all variable costs and its share of overhead.',
  'ASP': 'Average Selling Price — the typical price per unit actually realized after any negotiated discounts.',
  'CAC': 'Customer Acquisition Cost — how much you spend on average to acquire one new customer through marketing and sales.',
  'COGS': 'Cost of Goods Sold — the direct cost to produce or purchase one unit.',
  'Step-Fixed Costs': 'Costs that stay flat up to a capacity threshold, then jump to a new level when that threshold is crossed.',
  'Revenue Mix': 'Each channel\'s share of total company revenue, shown as a percentage.',
  'Contribution Mix': 'Each channel\'s share of total contribution margin, showing where profit really comes from.',
  'CAC Payback': 'How many months it takes for the profit from an average customer to cover the cost of acquiring them.',
};

export const RATE_DRIVERS = new Set([
  'wholesaleDiscountRate',
  'dtcReturnRate',
  'dropshipServiceFeeRate',
  'dropshipMarketplaceFeeRate',
  'wholesaleCommissionRate',
]);

export const CURRENCY_DRIVERS = new Set([
  'wholesaleASP',
  'dtcASP',
  'cogsPerUnit',
  'dtcFulfillmentCostPerUnit',
  'dropshipFulfillmentCostPerOrder',
  'dtcCAC',
  'returnProcessingCostPerUnit',
  'totalSharedCostPool',
  'stepFixedIncrease',
]);
