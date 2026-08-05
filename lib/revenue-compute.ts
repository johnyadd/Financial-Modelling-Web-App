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
 * - Sub-types WITH an explicit growth driver (retail same-store, REIT NAV, SaaS 36-month sims,
 *   edu_corptraining retention + expansion, hosp_catering explicit growthRate) use their own logic
 *
 * Session 2c-a covers 11 sub-types (Sessions 2a + 3a UI coverage).
 * Session 2c-b adds 9 sub-types (Session 3b UI coverage: Healthcare + Education).
 * Session 2c-c adds the final 8 sub-types (Session 3c UI coverage: SaaS B2C/Usage,
 *   E-com Marketplace, Services Agency/Freelance, Hospitality Restaurant/Hotel/Catering).
 * Total: 27/27 sub-types.
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

// Freelance: weeklyRate assumes a standard 40-hour week for scaling by
// actual chargeable hours (which are typically 25-35 for solo consultants).
const FREELANCE_STD_HOURS_PER_WEEK = 40

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

/**
 * 36-month customer simulation with churn.
 * customers(m) = customers(m-1) × (1 − monthlyChurn) + newCustomersPerMonth
 * Returns array of 36 monthly customer counts.
 */
function simulateCustomers(
  startingCustomers: number,
  newPerMonth: number,
  monthlyChurnPct: number
): number[] {
  const monthlyChurn = monthlyChurnPct / 100
  let customers = startingCustomers
  const result: number[] = []
  for (let month = 1; month <= 36; month++) {
    customers = customers * (1 - monthlyChurn) + newPerMonth
    if (customers < 0) customers = 0
    result.push(customers)
  }
  return result
}

// -- SUB-TYPE COMPUTE FUNCTIONS: Session 2c-a (11 sub-types) ------------

// ─── SaaS B2B: 36-month customer projection with churn + expansion ────
function computeSaasB2b(data: Partial<Step2Data>): ComputedRevenue {
  const c0 = n(data.saasB2b_startingCustomers)
  const newPerMo = n(data.saasB2b_newCustomersPerMonth)
  const monthlyChurnPct = n(data.saasB2b_monthlyChurnRate)
  const arpu = n(data.saasB2b_arpu)
  const expansion = n(data.saasB2b_expansionRevenuePct, 15) / 100

  const monthlyCustomers = simulateCustomers(c0, newPerMo, monthlyChurnPct)
  const monthlyMrr = monthlyCustomers.map((c) => c * arpu)

  const sumRange = (start: number, end: number) =>
    monthlyMrr.slice(start, end).reduce((s, m) => s + m, 0) * (1 + expansion)

  return {
    year1: sumRange(0, 12),
    year2: sumRange(12, 24),
    year3: sumRange(24, 36),
  }
}

// ─── E-commerce D2C: traffic × conversion × AOV × 12 × (1 + repeat × 0.5) ─
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
function computeReDev(data: Partial<Step2Data>): ComputedRevenue {
  const units = n(data.reDev_unitsBuiltYear)
  const asp = n(data.reDev_averageSellingPrice)

  const y1 = units * asp
  return applyDefaultGrowth(y1)
}

// ─── Real Estate Rental ──────────────────────────────────────────────
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
function computeReStr(data: Partial<Step2Data>): ComputedRevenue {
  const units = n(data.reStr_rentableUnits)
  const rate = n(data.reStr_averageNightlyRate)
  const occ = n(data.reStr_occupancyRate, 55) / 100
  const cleaning = n(data.reStr_cleaningFeePerBooking)
  const effectiveNightly = rate + (cleaning / STR_AVG_STAY_NIGHTS)

  const y1 = units * 365 * occ * effectiveNightly
  return applyDefaultGrowth(y1)
}

// -- SUB-TYPE COMPUTE FUNCTIONS: Session 2c-b (9 sub-types) -------------

// ─── Healthcare Clinic: patient visits × avg fee × 12 ────────────────
// Retention is an informational field for this iteration — clinics also acquire
// new patients, so shrinking Y2/Y3 by retention alone would be misleading.
function computeHealthClinic(data: Partial<Step2Data>): ComputedRevenue {
  const visits = n(data.healthClinic_patientVisitsPerMonth)
  const fee = n(data.healthClinic_averageFeePerVisit)

  const y1 = visits * fee * 12
  return applyDefaultGrowth(y1)
}

// ─── Healthcare Hospital: bed-days × ADR × (1 + ancillary %) ─────────
function computeHealthHosp(data: Partial<Step2Data>): ComputedRevenue {
  const beds = n(data.healthHosp_bedCount)
  const occ = n(data.healthHosp_occupancyRate, 70) / 100
  const adr = n(data.healthHosp_averageDailyRate)
  const ancillary = n(data.healthHosp_ancillaryRevenuePct, 40) / 100

  const y1 = beds * 365 * occ * adr * (1 + ancillary)
  return applyDefaultGrowth(y1)
}

// ─── Healthcare Device: unit sales + recurring service revenue ───────
// New sales: unitsPerQuarter × 4 × unitPrice
// Recurring: installBase × unitPrice × serviceRevenuePct (annual service run-rate)
function computeHealthDev(data: Partial<Step2Data>): ComputedRevenue {
  const unitsPerQ = n(data.healthDev_unitsSoldPerQuarter)
  const unitPrice = n(data.healthDev_unitPrice)
  const serviceRev = n(data.healthDev_serviceRevenuePct, 30) / 100
  const installBase = n(data.healthDev_installBase)

  const newSalesRevenue = unitsPerQ * 4 * unitPrice
  const recurringRevenue = installBase * unitPrice * serviceRev
  const y1 = newSalesRevenue + recurringRevenue
  return applyDefaultGrowth(y1)
}

// ─── Healthcare SaaS: 36-month customer simulation (no expansion field) ─
function computeHealthSaas(data: Partial<Step2Data>): ComputedRevenue {
  const c0 = n(data.healthSaas_startingCustomers)
  const newPerMo = n(data.healthSaas_newCustomersPerMonth)
  const monthlyChurnPct = n(data.healthSaas_monthlyChurnRate, 1.5)
  const arpu = n(data.healthSaas_arpu)

  const monthlyCustomers = simulateCustomers(c0, newPerMo, monthlyChurnPct)
  const monthlyMrr = monthlyCustomers.map((c) => c * arpu)

  const sumRange = (start: number, end: number) =>
    monthlyMrr.slice(start, end).reduce((s, m) => s + m, 0)

  return {
    year1: sumRange(0, 12),
    year2: sumRange(12, 24),
    year3: sumRange(24, 36),
  }
}

// ─── Healthcare Pharmacy: footfall × conversion × basket × 365 ───────
// Prescription% is an informational mix indicator, not a multiplier.
function computeHealthPharm(data: Partial<Step2Data>): ComputedRevenue {
  const footfall = n(data.healthPharm_dailyFootfall)
  const conversion = n(data.healthPharm_conversionRate, 70) / 100
  const basket = n(data.healthPharm_basketSize)

  const y1 = footfall * conversion * basket * 365
  return applyDefaultGrowth(y1)
}

// ─── Education Institution: enrolled × tuition ───────────────────────
// Retention is informational — new intakes offset leavers at steady-state.
function computeEduInst(data: Partial<Step2Data>): ComputedRevenue {
  const students = n(data.eduInst_enrolledStudents)
  const tuition = n(data.eduInst_tuitionPerStudent)

  const y1 = students * tuition
  return applyDefaultGrowth(y1)
}

// ─── Education EdTech: 36-month paying-customer simulation ────────────
// New paying customers per month = signups × (paidConversion / 100)
// Then standard churn dynamics
function computeEduTech(data: Partial<Step2Data>): ComputedRevenue {
  const signups = n(data.eduTech_monthlySignups)
  const paidConv = n(data.eduTech_paidConversionRate, 3) / 100
  const arpu = n(data.eduTech_arpu)
  const monthlyChurnPct = n(data.eduTech_monthlyChurnRate, 8)

  const newPayingPerMo = signups * paidConv
  const monthlyCustomers = simulateCustomers(0, newPayingPerMo, monthlyChurnPct)
  const monthlyMrr = monthlyCustomers.map((c) => c * arpu)

  const sumRange = (start: number, end: number) =>
    monthlyMrr.slice(start, end).reduce((s, m) => s + m, 0)

  return {
    year1: sumRange(0, 12),
    year2: sumRange(12, 24),
    year3: sumRange(24, 36),
  }
}

// ─── Education Tutoring: students × sessions × price × 12 ────────────
function computeEduTut(data: Partial<Step2Data>): ComputedRevenue {
  const students = n(data.eduTut_activeStudents)
  const sessions = n(data.eduTut_sessionsPerStudentPerMonth, 4)
  const price = n(data.eduTut_pricePerSession)

  const y1 = students * sessions * price * 12
  return applyDefaultGrowth(y1)
}

// ─── Education Corporate Training: retention + expansion drive growth ─
// Y1 = contracts × ACV × (1 + expansion%)
// Y2 = Y1 × (retention/100 + expansion/100)
// Y3 = Y2 × (retention/100 + expansion/100)
function computeEduCorp(data: Partial<Step2Data>): ComputedRevenue {
  const contracts = n(data.eduCorp_enterpriseContracts)
  const acv = n(data.eduCorp_averageContractValue)
  const retention = n(data.eduCorp_retentionRate, 80) / 100
  const expansion = n(data.eduCorp_expansionPct, 10) / 100

  const y1 = contracts * acv * (1 + expansion)
  const yoyFactor = retention + expansion
  const y2 = y1 * yoyFactor
  const y3 = y2 * yoyFactor
  return { year1: y1, year2: y2, year3: y3 }
}

// -- SUB-TYPE COMPUTE FUNCTIONS: Session 2c-c (8 sub-types) -------------

// ─── SaaS B2C: 36-month sim, paying = signups × paidConversion ────────
// K-factor (viral coefficient) is informational for this iteration to avoid
// compounding sensitivity; add explicit viral amplification if data supports it.
function computeSaasB2c(data: Partial<Step2Data>): ComputedRevenue {
  const signups = n(data.saasB2c_monthlySignups)
  const paidConv = n(data.saasB2c_paidConversionRate, 4) / 100
  const arpu = n(data.saasB2c_arpu)
  const monthlyChurnPct = n(data.saasB2c_monthlyChurnRate, 6)

  const newPayingPerMo = signups * paidConv
  const monthlyCustomers = simulateCustomers(0, newPayingPerMo, monthlyChurnPct)
  const monthlyMrr = monthlyCustomers.map((c) => c * arpu)

  const sumRange = (start: number, end: number) =>
    monthlyMrr.slice(start, end).reduce((s, m) => s + m, 0)

  return {
    year1: sumRange(0, 12),
    year2: sumRange(12, 24),
    year3: sumRange(24, 36),
  }
}

// ─── SaaS Usage: accounts × units × price × 12 ────────────────────────
// Steady-state assumption for Y1; monthly account churn is informational.
function computeSaasUsage(data: Partial<Step2Data>): ComputedRevenue {
  const accounts = n(data.saasUsage_activeAccounts)
  const units = n(data.saasUsage_avgUnitsPerAccountPerMonth)
  const price = n(data.saasUsage_pricePerUnit)

  const y1 = accounts * units * price * 12
  return applyDefaultGrowth(y1)
}

// ─── E-commerce Marketplace: GMV × take rate × 12 ─────────────────────
// activeSellers and transactions/seller are informational cross-checks.
function computeEcomMkt(data: Partial<Step2Data>): ComputedRevenue {
  const gmv = n(data.ecomMkt_monthlyGmv)
  const takeRate = n(data.ecomMkt_takeRate, 10) / 100

  const y1 = gmv * takeRate * 12
  return applyDefaultGrowth(y1)
}

// ─── Services Agency: retainers + one-off projects ────────────────────
// Retainer revenue + project revenue both annualized to monthly cadence
function computeSvcAgcy(data: Partial<Step2Data>): ComputedRevenue {
  const clients = n(data.svcAgcy_retainedClients)
  const arpa = n(data.svcAgcy_arpaPerMonth)
  const newProjects = n(data.svcAgcy_newProjectsPerMonth)
  const projectValue = n(data.svcAgcy_averageProjectValue)

  const retainerRevenue = clients * arpa * 12
  const projectRevenue = newProjects * projectValue * 12
  const y1 = retainerRevenue + projectRevenue
  return applyDefaultGrowth(y1)
}

// ─── Services Freelance: chargeable hrs × implied hourly × weeks ──────
// weeklyRate assumed to reflect a 40-hour week; scale by actual chargeable hours.
// This models solo consultants realistically (25-35 chargeable hrs of full week).
function computeSvcFree(data: Partial<Step2Data>): ComputedRevenue {
  const hrsPerWeek = n(data.svcFree_chargeableHoursPerWeek)
  const weeklyRate = n(data.svcFree_weeklyRate)
  const weeks = n(data.svcFree_weeksWorkedPerYear, 44)
  const impliedHourly = weeklyRate / FREELANCE_STD_HOURS_PER_WEEK

  const y1 = hrsPerWeek * impliedHourly * weeks
  return applyDefaultGrowth(y1)
}

// ─── Hospitality Restaurant: seats × turns × spend × operating days ───
function computeHospRest(data: Partial<Step2Data>): ComputedRevenue {
  const seats = n(data.hospRest_seatCount)
  const turns = n(data.hospRest_tableTurnsPerDay)
  const spend = n(data.hospRest_averageSpendPerCover)
  const days = n(data.hospRest_operatingDaysPerYear, 350)

  const y1 = seats * turns * spend * days
  return applyDefaultGrowth(y1)
}

// ─── Hospitality Hotel: room-nights × ADR × (1 + F&B%) ────────────────
// Parallels health_hospital formula. F&B typically 5-70% depending on service level.
function computeHospHotel(data: Partial<Step2Data>): ComputedRevenue {
  const rooms = n(data.hospHotel_roomCount)
  const occ = n(data.hospHotel_occupancyRate, 72) / 100
  const adr = n(data.hospHotel_averageDailyRate)
  const fbPct = n(data.hospHotel_foodBeverageRevenuePct, 30) / 100

  const y1 = rooms * 365 * occ * adr * (1 + fbPct)
  return applyDefaultGrowth(y1)
}

// ─── Hospitality Catering: events × avg value with explicit growth ────
// growthRate is an explicit YoY driver (catering scales fast in early years).
function computeHospCater(data: Partial<Step2Data>): ComputedRevenue {
  const events = n(data.hospCater_eventsPerMonth)
  const eventValue = n(data.hospCater_averageEventValue)
  const growth = n(data.hospCater_growthRate, 15) / 100

  const y1 = events * eventValue * 12
  const y2 = y1 * (1 + growth)
  const y3 = y2 * (1 + growth)
  return { year1: y1, year2: y2, year3: y3 }
}

// -- DISPATCHER ---------------------------------------------------------

/**
 * Main entry point. Returns computed year1/2/3 revenue for the given sub-type,
 * or null if subType is undefined.
 *
 * All 27 sub-types are now wired for driver-based revenue compute.
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

    // Session 2c-b: Session 3b coverage (9 sub-types)
    case "health_clinic":               return computeHealthClinic(data)
    case "health_hospital":             return computeHealthHosp(data)
    case "health_device":               return computeHealthDev(data)
    case "health_saas":                 return computeHealthSaas(data)
    case "health_pharmacy":             return computeHealthPharm(data)
    case "edu_institution":             return computeEduInst(data)
    case "edu_edtech":                  return computeEduTech(data)
    case "edu_tutoring":                return computeEduTut(data)
    case "edu_corptraining":            return computeEduCorp(data)

    // Session 2c-c: Session 3c coverage (final 8 sub-types)
    case "saas_b2c":                    return computeSaasB2c(data)
    case "saas_usage":                  return computeSaasUsage(data)
    case "ecom_marketplace":            return computeEcomMkt(data)
    case "services_agency":             return computeSvcAgcy(data)
    case "services_freelance":          return computeSvcFree(data)
    case "hosp_restaurant":             return computeHospRest(data)
    case "hosp_hotel":                  return computeHospHotel(data)
    case "hosp_catering":               return computeHospCater(data)

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
