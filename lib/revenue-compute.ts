/**
 * Finanyst — Revenue Compute
 * ---------------------------
 * Pure functions that turn driver-mode inputs into year1/2/3 revenue.
 *
 * Called from step2-model-revenue.tsx onSubmit when revenueEntryMode = "driverBased".
 * The computed values then populate year1Revenue/year2Revenue/year3Revenue so that
 * all downstream steps (costs, working capital, valuation) work unchanged.
 *
 * Design:
 * - Each sub-type has its own compute function
 * - Input is Partial<Step2Data> (all fields as string | undefined, matching the form)
 * - Output is ComputedRevenue { year1, year2, year3 } as numbers
 * - Empty/invalid inputs default to 0 (via n() helper) or field-specific defaults
 * - Sub-types WITHOUT an explicit growth driver use DEFAULT_GROWTH_Y2/Y3
 * - Sub-types WITH an explicit growth driver (retail same-store, REIT NAV, SaaS B2B monthly)
 *   use their own logic
 *
 * Sessions 2c-a covers 11 sub-types (matching Sessions 2a + 3a UI coverage).
 * Sessions 2c-b + 2c-c will add the remaining 16.
 */

import type { Step2Data } from "./schemas"
import type { BusinessTypeSub } from "./schemas/assumptions"

export interface ComputedRevenue {
  year1: number
  year2: number
  year3: number
}

// Default growth trajectory for sub-types without an explicit growth driver.
// User confirmed 2026-08-05: 20% Y2 over Y1, 15% Y3 over Y2 (declining).
const DEFAULT_GROWTH_Y2 = 0.20
const DEFAULT_GROWTH_Y3 = 0.15

// REIT revenue = portfolio × avgPropertyValue × yield.
// The questionnaire doesn't capture avgPropertyValue, so we use a rough default.
// TODO: consider adding avgPropertyValue field in a future iteration for accuracy.
const REIT_DEFAULT_PROPERTY_VALUE = 2_000_000

// Short-term rental: cleaning fee is per booking, amortized over avg stay length.
const STR_AVG_STAY_NIGHTS = 3

// -- HELPERS -------------------------------------------------------------

/** Safely parse a string field to number; returns fallback if empty/invalid. */
function n(value: string | undefined, fallback = 0): number {
  if (!value || value.trim() === "") return fallback
  const parsed = parseFloat(value)
  return isNaN(parsed) ? fallback : parsed
}

/** Apply default growth trajectory to a Year 1 base. */
function applyDefaultGrowth(y1: number): ComputedRevenue {
  const y2 = y1 * (1 + DEFAULT_GROWTH_Y2)
  const y3 = y2 * (1 + DEFAULT_GROWTH_Y3)
  return { year1: y1, year2: y2, year3: y3 }
}

// -- SUB-TYPE COMPUTE FUNCTIONS -----------------------------------------

// ─── SaaS B2B: 36-month customer projection with churn + expansion ────
// customers(m) = customers(m-1) × (1 − monthlyChurn) + newCustomersPerMonth
// yearN revenue = sum of monthly MRR × (1 + expansion%)
function computeSaasB2b(data: Partial<Step2Data>): ComputedRevenue {
  const c0 = n(data.saasB2b_startingCustomers)
  const newPerMo = n(data.saasB2b_newCustomersPerMonth)
  const monthlyChurn = n(data.saasB2b_monthlyChurnRate) / 100
  const arpu = n(data.saasB2b_arpu)
  const expansion = n(data.saasB2b_expansionRevenuePct, 15) / 100

  let customers = c0
  const monthlyMrr: number[] = []
  for (let month = 1; month <= 36; month++) {
    customers = customers * (1 - monthlyChurn) + newPerMo
    if (customers < 0) customers = 0
    monthlyMrr.push(customers * arpu)
  }

  const sumRange = (start: number, end: number) =>
    monthlyMrr.slice(start, end).reduce((s, m) => s + m, 0) * (1 + expansion)

  return {
    year1: sumRange(0, 12),
    year2: sumRange(12, 24),
    year3: sumRange(24, 36),
  }
}

// ─── E-commerce D2C: traffic × conversion × AOV × 12 × (1 + repeat × 0.5) ─
// The 0.5 factor discounts the 12-month repeat rate to an average uplift per order.
function computeEcomD2c(data: Partial<Step2Data>): ComputedRevenue {
  const traffic = n(data.ecomD2c_monthlyTraffic)
  const conversion = n(data.ecomD2c_conversionRate) / 100
  const aov = n(data.ecomD2c_averageOrderValue)
  const repeatRate = n(data.ecomD2c_repeatPurchaseRate) / 100

  const y1 = traffic * conversion * aov * 12 * (1 + repeatRate * 0.5)
  return applyDefaultGrowth(y1)
}

// ─── Professional Services: staff × hours × utilization × rate × 12 ──
function computeSvcProf(data: Partial<Step2Data>): ComputedRevenue {
  const staff = n(data.svcProf_billableStaffCount)
  const hours = n(data.svcProf_billableHoursPerMonth, 160)
  const util = n(data.svcProf_utilizationRate, 70) / 100
  const rate = n(data.svcProf_hourlyRate)

  const y1 = staff * hours * util * rate * 12
  return applyDefaultGrowth(y1)
}

// ─── Product Manufacturing ───────────────────────────────────────────
// units × capacity × price × sell-through × 12
function computeProductMfg(data: Partial<Step2Data>): ComputedRevenue {
  const units = n(data.productMfg_unitsPerMonth)
  const capacity = n(data.productMfg_capacityUtilization, 75) / 100
  const price = n(data.productMfg_unitPrice)
  const sellThrough = n(data.productMfg_sellThroughRate, 85) / 100

  const y1 = units * capacity * price * sellThrough * 12
  return applyDefaultGrowth(y1)
}

// ─── Product Retail: same-store growth is the explicit growth driver ──
function computeProductRetail(data: Partial<Step2Data>): ComputedRevenue {
  const stores = n(data.productRetail_storeCount)
  const revPerStore = n(data.productRetail_revenuePerStore)
  const ssg = n(data.productRetail_sameSalesGrowth, 3) / 100

  const y1 = stores * revPerStore * 12
  const y2 = y1 * (1 + ssg)
  const y3 = y2 * (1 + ssg)
  return { year1: y1, year2: y2, year3: y3 }
}

// ─── Product Wholesale ───────────────────────────────────────────────
function computeProductWhsl(data: Partial<Step2Data>): ComputedRevenue {
  const accounts = n(data.productWhsl_activeAccounts)
  const orders = n(data.productWhsl_ordersPerAccount)
  const aov = n(data.productWhsl_averageOrderValue)

  const y1 = accounts * orders * aov * 12
  return applyDefaultGrowth(y1)
}

// ─── Real Estate Development ─────────────────────────────────────────
// grossMargin only affects profitability, not revenue.
// sellThroughMonths affects timing but at annual granularity we assume steady-state.
function computeReDev(data: Partial<Step2Data>): ComputedRevenue {
  const units = n(data.reDev_unitsBuiltYear)
  const asp = n(data.reDev_averageSellingPrice)

  const y1 = units * asp
  return applyDefaultGrowth(y1)
}

// ─── Real Estate Rental ──────────────────────────────────────────────
// units × rent × 12 × occupancy × (1 + otherIncome%)
function computeReRent(data: Partial<Step2Data>): ComputedRevenue {
  const units = n(data.reRent_rentableUnits)
  const rent = n(data.reRent_monthlyRent)
  const occ = n(data.reRent_occupancyRate, 92) / 100
  const otherPct = n(data.reRent_otherIncomePct, 8) / 100

  const y1 = units * rent * 12 * occ * (1 + otherPct)
  return applyDefaultGrowth(y1)
}

// ─── Real Estate Agency ──────────────────────────────────────────────
function computeReAgcy(data: Partial<Step2Data>): ComputedRevenue {
  const txns = n(data.reAgcy_monthlyTransactions)
  const value = n(data.reAgcy_averageTransactionValue)
  const commission = n(data.reAgcy_commissionRate, 2) / 100

  const y1 = txns * value * commission * 12
  return applyDefaultGrowth(y1)
}

// ─── Real Estate REIT: uses navGrowth as explicit growth driver ──────
function computeReReit(data: Partial<Step2Data>): ComputedRevenue {
  const properties = n(data.reReit_portfolioProperties)
  const yieldPct = n(data.reReit_averageYield, 5) / 100
  const navGrowth = n(data.reReit_navGrowth, 3) / 100

  const y1 = properties * REIT_DEFAULT_PROPERTY_VALUE * yieldPct
  const y2 = y1 * (1 + navGrowth)
  const y3 = y2 * (1 + navGrowth)
  return { year1: y1, year2: y2, year3: y3 }
}

// ─── Real Estate Short-term Rental ───────────────────────────────────
// units × 365 × occupancy × (nightlyRate + cleaning-per-night)
function computeReStr(data: Partial<Step2Data>): ComputedRevenue {
  const units = n(data.reStr_rentableUnits)
  const rate = n(data.reStr_averageNightlyRate)
  const occ = n(data.reStr_occupancyRate, 55) / 100
  const cleaning = n(data.reStr_cleaningFeePerBooking)
  const effectiveNightly = rate + (cleaning / STR_AVG_STAY_NIGHTS)

  const y1 = units * 365 * occ * effectiveNightly
  return applyDefaultGrowth(y1)
}

// -- DISPATCHER ---------------------------------------------------------

/**
 * Main entry point. Returns computed year1/2/3 revenue for the given sub-type,
 * or null if:
 *   - subType is undefined
 *   - the sub-type is not yet implemented (Sessions 2c-b and 2c-c will fill these)
 *
 * Callers should treat null as "compute not available yet — fall back to top-line".
 */
export function computeRevenue(
  subType: BusinessTypeSub | undefined,
  data: Partial<Step2Data>
): ComputedRevenue | null {
  if (!subType) return null

  switch (subType) {
    // Session 2c-a: Sessions 2a + 3a coverage (11 sub-types)
    case "saas_b2b":                    return computeSaasB2b(data)
    case "ecom_d2c":                    return computeEcomD2c(data)
    case "services_professional":       return computeSvcProf(data)
    case "product_manufacturing":       return computeProductMfg(data)
    case "product_retail":              return computeProductRetail(data)
    case "product_wholesale":           return computeProductWhsl(data)
    case "realestate_development":      return computeReDev(data)
    case "realestate_rental":           return computeReRent(data)
    case "realestate_agency":           return computeReAgcy(data)
    case "realestate_reit":             return computeReReit(data)
    case "realestate_shorttermrental":  return computeReStr(data)

    // Session 2c-b will add: health_clinic, health_hospital, health_device,
    // health_saas, health_pharmacy, edu_institution, edu_edtech, edu_tutoring,
    // edu_corptraining
    // Session 2c-c will add: saas_b2c, saas_usage, ecom_marketplace,
    // services_agency, services_freelance, hosp_restaurant, hosp_hotel,
    // hosp_catering
    default:
      return null
  }
}

// -- GROWTH RATE DERIVATION --------------------------------------------

/**
 * Derive year-over-year growth as string percentage (matches form field type).
 * Returns "" if base is 0 to avoid division-by-zero.
 * Rounded to 1 decimal place.
 */
export function deriveGrowthRate(base: number, target: number): string {
  if (base === 0) return ""
  const growthPct = ((target - base) / base) * 100
  return growthPct.toFixed(1)
}
