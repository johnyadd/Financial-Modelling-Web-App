// Step 3 (Costs & Margins) field-level validation checks
// Each function is pure - takes value + context, returns FieldWarning | null

import type { FieldWarning } from "./types"

// UK minimum wage 2024/25: £11.44/hr × 40hr × 52 weeks ≈ £23,800
// Conservative floor: £22,880/FTE annual
const UK_MIN_WAGE_ANNUAL = 22880

// Helper: does the country string indicate UK?
function isUK(country?: string): boolean {
  if (!country) return false
  const c = country.toLowerCase()
  return c.includes("united kingdom") || c === "uk" || c.includes("britain") || c.includes("england")
}

// -- Percentage bounds check (generic) -------------------------------------

/**
 * Percentage field bounds check.
 * <0 = error (percentages can't be negative for these fields)
 * >100 = warning with "did you mean decimal" hint
 */
export function checkPercentBounds(value: string, fieldLabel: string): FieldWarning | null {
  const num = parseFloat(value)
  if (isNaN(num)) return null

  if (num < 0) {
    return {
      severity: "error",
      message: `${fieldLabel} cannot be negative.`,
    }
  }

  if (num > 100) {
    return {
      severity: "warning",
      message: `${fieldLabel} of ${num}% exceeds 100%.`,
      suggestion: num < 1000
        ? `If you entered a decimal (0.${Math.round(num)}), the field expects a percentage — try ${(num / 100).toFixed(1)}.`
        : `Review this value — percentages typically fall between 0 and 100.`,
    }
  }

  return null
}

// -- Salary sanity check ---------------------------------------------------

interface SalaryContext {
  employeeCount?: string
  country?: string
}

/**
 * Flag when average salary per employee falls below UK minimum wage.
 * This is the specific check that catches the "£4,500 total for 20 employees" pattern
 * that our memo generator surfaced as legally non-viable.
 * Only fires when country is UK - other markets have different floors.
 */
export function checkSalarySanity(value: string, context: SalaryContext): FieldWarning | null {
  const total = parseFloat(value)
  if (!total || total <= 0) return null

  const employees = parseFloat(context.employeeCount ?? "0")
  if (!employees || employees <= 0) return null

  if (!isUK(context.country)) return null

  const perEmployee = total / employees

  if (perEmployee < UK_MIN_WAGE_ANNUAL) {
    return {
      severity: "warning",
      message: `Average salary of £${Math.round(perEmployee).toLocaleString("en-GB")}/employee is below UK minimum wage of £${UK_MIN_WAGE_ANNUAL.toLocaleString("en-GB")}/FTE.`,
      suggestion: total < 100000
        ? `If the figure should be in thousands, try £${Math.round(total * 1000).toLocaleString("en-GB")}.`
        : `Review employee count (${employees}) — this ratio suggests either understated total or overstated headcount.`,
    }
  }

  return null
}

// -- Operating expenses vs Y1 revenue check --------------------------------

interface OpexContext {
  year1Revenue?: string
}

/**
 * Flag when opex is >5x Y1 revenue.
 * Legitimate for pre-revenue or heavy-burn Series A+ scenarios, but often signals
 * a decimal error (revenue entered as £5k instead of £5M).
 */
export function checkOpexVsRevenue(value: string, context: OpexContext): FieldWarning | null {
  const opex = parseFloat(value)
  const revenue = parseFloat(context.year1Revenue ?? "0")

  if (!opex || opex <= 0 || !revenue || revenue <= 0) return null

  const ratio = opex / revenue

  if (ratio > 5) {
    return {
      severity: "warning",
      message: `Operating expenses (£${opex.toLocaleString("en-GB")}) are ${ratio.toFixed(1)}× Y1 revenue (£${revenue.toLocaleString("en-GB")}).`,
      suggestion: revenue < 100000
        ? `If Y1 revenue should be in thousands, review the Revenue step. This ratio typically indicates a scale mismatch.`
        : `Confirm both figures are in the same units — this ratio is high even for pre-revenue burn.`,
    }
  }

  return null
}

// -- Marketing spend as % of revenue --------------------------------------

/**
 * Marketing budget vs Y1 revenue ratio.
 * >100% = warning (marketing > revenue, unusual outside heavy CAC burn)
 * 50-100% = info (aggressive but not unreasonable for growth stage)
 */
export function checkMarketingSpendRatio(value: string, context: OpexContext): FieldWarning | null {
  const marketing = parseFloat(value)
  const revenue = parseFloat(context.year1Revenue ?? "0")

  if (!marketing || marketing <= 0 || !revenue || revenue <= 0) return null

  const pct = (marketing / revenue) * 100

  if (pct > 100) {
    return {
      severity: "warning",
      message: `Marketing budget (£${marketing.toLocaleString("en-GB")}) exceeds Y1 revenue (£${revenue.toLocaleString("en-GB")}) — ${pct.toFixed(0)}% ratio.`,
      suggestion: `Aggressive CAC burn is common at Seed stage, but this level typically signals a scale mismatch between budget and revenue.`,
    }
  }

  if (pct > 50) {
    return {
      severity: "info",
      message: `Marketing is ${pct.toFixed(0)}% of Y1 revenue. UK SaaS Seed-stage typical: 30-50%. Higher is acceptable for growth-focused burn but worth confirming.`,
    }
  }

  return null
}

// -- R&D vs revenue --------------------------------------------------------

/**
 * R&D budget vs Y1 revenue ratio.
 * >200% = warning (unusually high even for deep-tech pre-revenue)
 */
export function checkRndVsRevenue(value: string, context: OpexContext): FieldWarning | null {
  const rnd = parseFloat(value)
  const revenue = parseFloat(context.year1Revenue ?? "0")

  if (!rnd || rnd <= 0 || !revenue || revenue <= 0) return null

  const pct = (rnd / revenue) * 100

  if (pct > 200) {
    return {
      severity: "warning",
      message: `R&D (£${rnd.toLocaleString("en-GB")}) is ${pct.toFixed(0)}% of Y1 revenue.`,
      suggestion: `Deep-tech pre-revenue typically caps at 100-200% of Y1 revenue. Confirm both figures are in the same units.`,
    }
  }

  return null
}
