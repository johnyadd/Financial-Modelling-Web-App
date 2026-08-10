// Step 4 (Funding & Exit) field-level validation checks

import type { FieldWarning } from "./types"

/**
 * Discount rate / WACC check.
 * UK Seed → Series A typical: 8-20% (weighted toward 12-15%)
 * <5% is too low even for late-stage established businesses
 * >30% is only defensible for very early Pre-Seed / very speculative
 * Extreme errors: <1% or >50%
 */
export function checkDiscountRate(value: string): FieldWarning | null {
  const num = parseFloat(value)
  if (isNaN(num)) return null

  if (num < 0) {
    return {
      severity: "error",
      message: `Discount rate cannot be negative.`,
    }
  }

  if (num > 100) {
    return {
      severity: "warning",
      message: `Discount rate of ${num}% exceeds 100%.`,
      suggestion: `If you entered a decimal (0.${Math.round(num)}), the field expects a percentage — try ${(num / 100).toFixed(1)}.`,
    }
  }

  if (num < 5) {
    return {
      severity: "warning",
      message: `Discount rate of ${num}% is below UK typical range (8-20% for Seed → Series A).`,
      suggestion: `Very low rates are only defensible for mature, low-risk businesses.`,
    }
  }

  if (num > 30) {
    return {
      severity: "warning",
      message: `Discount rate of ${num}% is above UK typical range (8-20% for Seed → Series A).`,
      suggestion: `Rates above 30% are only defensible for very early Pre-Seed or highly speculative ventures.`,
    }
  }

  return null
}

/**
 * Terminal growth rate check.
 * UK long-run inflation target: 2%
 * Typical range: 0-3% (must not exceed long-run GDP growth)
 * Above 4% is implausible — implies perpetual growth exceeding UK GDP forever
 * Negative values indicate perpetual decline — usually a modelling error
 */
export function checkTerminalGrowthRate(value: string): FieldWarning | null {
  const num = parseFloat(value)
  if (isNaN(num)) return null

  if (num < 0) {
    return {
      severity: "warning",
      message: `Terminal growth of ${num}% implies perpetual decline.`,
      suggestion: `Terminal growth typically matches long-run inflation (UK: 2%). Negative values are unusual outside declining industries.`,
    }
  }

  if (num > 100) {
    return {
      severity: "warning",
      message: `Terminal growth of ${num}% exceeds 100%.`,
      suggestion: `If you entered a decimal (0.0${Math.round(num)}), the field expects a percentage — try ${(num / 100).toFixed(2)}.`,
    }
  }

  if (num > 4) {
    return {
      severity: "warning",
      message: `Terminal growth of ${num}% exceeds long-run UK GDP growth (~2%).`,
      suggestion: `Rates above 4% imply the business grows faster than the UK economy forever — usually corrected downward for defensible valuations.`,
    }
  }

  return null
}

/**
 * Target exit multiple check.
 * UK B2B SaaS typical: 4-10x revenue at acquisition
 * Higher-quality assets: 10-15x
 * Below 1x is a distress sale
 * Above 15x is aggressive — needs justification
 */
export function checkExitMultiple(value: string): FieldWarning | null {
  const num = parseFloat(value)
  if (isNaN(num)) return null

  if (num < 0) {
    return {
      severity: "error",
      message: `Exit multiple cannot be negative.`,
    }
  }

  if (num < 1) {
    return {
      severity: "warning",
      message: `Exit multiple of ${num}x implies a distress sale (below invested capital).`,
      suggestion: `Confirm this scenario is intentional. Investor-facing memos typically model 4-10x for UK B2B SaaS.`,
    }
  }

  if (num > 20) {
    return {
      severity: "warning",
      message: `Exit multiple of ${num}x is above UK typical range (4-10x SaaS, 10-15x premium).`,
      suggestion: `Multiples above 15x require exceptional growth or category leadership to defend to investors.`,
    }
  }

  if (num > 15) {
    return {
      severity: "info",
      message: `Exit multiple of ${num}x is at the top of UK premium range (10-15x).`,
    }
  }

  return null
}

/**
 * Interest rate check.
 * UK commercial debt typical: 6-12% (SME loans, venture debt)
 * Above 20% is loan-shark territory or specialised distressed financing
 * Zero interest with non-zero debt is unusual (should be flagged only in cross-field context — not here)
 */
export function checkInterestRate(value: string): FieldWarning | null {
  const num = parseFloat(value)
  if (isNaN(num)) return null

  if (num < 0) {
    return {
      severity: "error",
      message: `Interest rate cannot be negative.`,
    }
  }

  if (num > 100) {
    return {
      severity: "warning",
      message: `Interest rate of ${num}% exceeds 100%.`,
      suggestion: `If you entered a decimal (0.${Math.round(num)}), the field expects a percentage — try ${(num / 100).toFixed(1)}.`,
    }
  }

  if (num > 20) {
    return {
      severity: "warning",
      message: `Interest rate of ${num}% is above UK typical range (6-12% for SME debt / venture debt).`,
      suggestion: `Rates above 20% typically indicate distressed lending or specialised financing.`,
    }
  }

  return null
}
