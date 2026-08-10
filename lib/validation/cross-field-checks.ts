// Layer 2 cross-field validation checks
// Runs on Step 5 review page, before final submit
// All checks are pure JavaScript on questionnaire inputs — no engine dependency

import type { FieldWarning } from "./types"

interface QuestionnaireStepData {
  step1?: Record<string, unknown>
  step2?: Record<string, unknown>
  step3?: Record<string, unknown>
  step4?: Record<string, unknown>
}

// Helper: safely parse a string field to number
function parseField(step: Record<string, unknown> | undefined, key: string): number | null {
  const raw = step?.[key]
  if (typeof raw !== "string" || raw.trim() === "") return null
  const num = parseFloat(raw)
  return isNaN(num) ? null : num
}

/**
 * Cash runway = currentCash / monthlyBurnRate (months)
 * < 3 months → error (imminent crisis)
 * 3-6 months → warning (urgent fundraise)
 * 6-12 months → info (tight for Seed → A)
 * > 12 months → no warning
 */
export function checkCashRunway(data: QuestionnaireStepData): FieldWarning | null {
  const cash = parseField(data.step4, "currentCash")
  const burn = parseField(data.step4, "monthlyBurnRate")

  if (cash === null || burn === null || burn <= 0) return null

  const months = cash / burn

  if (months < 3) {
    return {
      severity: "error",
      message: `Cash runway of ${months.toFixed(1)} months implies imminent cash crisis.`,
      suggestion: `Fundraise closure typically takes 3-6 months. Bridge financing or immediate cost reduction may be required.`,
    }
  }

  if (months < 6) {
    return {
      severity: "warning",
      message: `Cash runway of ${months.toFixed(1)} months is critically tight.`,
      suggestion: `UK Seed rounds typically take 3-6 months to close. Confirm your fundraise timeline aligns.`,
    }
  }

  if (months < 12) {
    return {
      severity: "info",
      message: `Cash runway of ${months.toFixed(1)} months is on the tighter end for a Seed → Series A trajectory.`,
      suggestion: `UK Seed stage typically targets 18-24 months runway.`,
    }
  }

  return null
}

/**
 * Capital ask sizing = targetRaiseAmount / (monthlyBurnRate × 12) — years covered
 * < 1 year covered → warning (undersized round)
 * > 3 years covered → info (over-raise, dilution consideration)
 */
export function checkCapitalAskSizing(data: QuestionnaireStepData): FieldWarning | null {
  const ask = parseField(data.step4, "targetRaiseAmount")
  const burn = parseField(data.step4, "monthlyBurnRate")

  if (ask === null || burn === null || burn <= 0 || ask <= 0) return null

  const yearsCovered = ask / (burn * 12)

  if (yearsCovered < 1) {
    const monthsCovered = yearsCovered * 12
    return {
      severity: "warning",
      message: `Target raise of £${ask.toLocaleString("en-GB")} at £${burn.toLocaleString("en-GB")}/mo burn covers only ${monthsCovered.toFixed(0)} months.`,
      suggestion: `UK Seed rounds typically target 18-24 months runway. Round may be undersized for stage progression to Series A.`,
    }
  }

  if (yearsCovered > 3) {
    return {
      severity: "info",
      message: `Target raise of £${ask.toLocaleString("en-GB")} at £${burn.toLocaleString("en-GB")}/mo burn covers ${yearsCovered.toFixed(1)} years.`,
      suggestion: `Rounds covering >3 years are unusual. Confirm dilution economics are acceptable at this raise size.`,
    }
  }

  return null
}

/**
 * Growth rate vs business stage sanity.
 * Established/Scale-up with >100% Y1 growth → warning (uncharacteristic)
 * Pre-revenue with <100% Y1 growth → info (modest for zero-base escape)
 */
export function checkGrowthVsStage(data: QuestionnaireStepData): FieldWarning | null {
  const stage = data.step1?.businessStage
  const growthY1 = parseField(data.step2, "revenueGrowthY1")

  if (typeof stage !== "string" || growthY1 === null) return null

  const stageLower = stage.toLowerCase()

  if ((stageLower.includes("established") || stageLower.includes("scale-up")) && growthY1 > 100) {
    return {
      severity: "warning",
      message: `${growthY1}% Year 1 growth is uncharacteristic for ${stage} stage.`,
      suggestion: `Established businesses typically grow 10-30% annually. Confirm whether this reflects a new product line, acquisition, or restructured base.`,
    }
  }

  if (stageLower.includes("pre-revenue") && growthY1 > 0 && growthY1 < 100) {
    return {
      severity: "info",
      message: `${growthY1}% Year 1 growth is modest for a Pre-revenue stage.`,
      suggestion: `Pre-revenue businesses typically show 100-500% Y1 growth as they escape the zero-revenue base.`,
    }
  }

  return null
}

/**
 * Payroll vs burn rate consistency.
 * If monthly payroll exceeds stated monthly burn, burn likely omits payroll.
 * Common modelling error — flags for confirmation.
 */
export function checkPayrollVsBurn(data: QuestionnaireStepData): FieldWarning | null {
  const salariesTotal = parseField(data.step3, "salariesTotal")
  const monthlyBurn = parseField(data.step4, "monthlyBurnRate")

  if (salariesTotal === null || monthlyBurn === null || monthlyBurn <= 0 || salariesTotal <= 0) {
    return null
  }

  const monthlyPayroll = salariesTotal / 12

  if (monthlyPayroll > monthlyBurn) {
    return {
      severity: "warning",
      message: `Monthly payroll (£${Math.round(monthlyPayroll).toLocaleString("en-GB")}) exceeds monthly burn rate (£${monthlyBurn.toLocaleString("en-GB")}).`,
      suggestion: `Burn rate typically includes payroll. Confirm the burn figure captures all operating costs including salaries.`,
    }
  }

  return null
}

/**
 * Run all cross-field checks against questionnaire data.
 * Returns object keyed by check name.
 */
export function runAllCrossFieldChecks(data: QuestionnaireStepData): Record<string, FieldWarning | null> {
  return {
    cashRunway:       checkCashRunway(data),
    capitalAskSizing: checkCapitalAskSizing(data),
    growthVsStage:    checkGrowthVsStage(data),
    payrollVsBurn:    checkPayrollVsBurn(data),
  }
}
