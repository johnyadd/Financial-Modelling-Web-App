// Step 2 (Revenue) field-level validation checks

import type { FieldWarning } from "./types"

export type YearNumber = 1 | 2 | 3

/**
 * Growth rate bounds check with year-aware thresholds.
 * Y1: high growth (>500%) is normal for Seed-stage with tiny base.
 * Y2/Y3: growth typically moderates as base expands; hypergrowth becomes harder to defend.
 * Sub-zero: decline is legitimate but should be flagged for confirmation.
 */
export function checkGrowthRateBounds(value: string, year: YearNumber): FieldWarning | null {
  const num = parseFloat(value)
  if (isNaN(num)) return null

  const yearLabel = `Year ${year}`

  // Hard error: <-100% means revenue drops below zero, which is impossible
  if (num < -100) {
    return {
      severity: "error",
      message: `${yearLabel} growth rate cannot be less than -100% (revenue can't drop below zero).`,
    }
  }

  // Extreme decline warning
  if (num < -50) {
    return {
      severity: "warning",
      message: `${yearLabel} growth of ${num}% implies significant decline.`,
      suggestion: `Confirm this is intentional (wind-down, market exit, or restructuring scenario).`,
    }
  }

  // Moderate decline — informational
  if (num < 0) {
    return {
      severity: "info",
      message: `${yearLabel} shows negative growth (${num}%). Verify this matches your business context.`,
    }
  }

  // Year-specific high-growth thresholds
  if (year === 1) {
    if (num > 1000) {
      return {
        severity: "warning",
        message: `${yearLabel} growth of ${num}% is extreme even for pre-revenue to Seed stage.`,
        suggestion: `500-1500% Y1 typically indicates near-zero starting revenue — confirm base and stage.`,
      }
    }
    if (num > 500) {
      return {
        severity: "info",
        message: `${yearLabel} growth of ${num}% is aggressive but plausible for Seed-stage with strong PMF signal.`,
      }
    }
  } else {
    // Year 2 and 3 — growth should moderate as base expands
    if (num > 500) {
      return {
        severity: "warning",
        message: `${yearLabel} growth of ${num}% is unusually high — hypergrowth this late is rare.`,
        suggestion: `Growth typically moderates as base expands. Confirm this matches your defensibility story.`,
      }
    }
    if (num > 200) {
      return {
        severity: "info",
        message: `${yearLabel} growth of ${num}% is above typical Series A trajectory (UK SaaS: 100-200%).`,
      }
    }
  }

  return null
}

/**
 * Revenue non-negativity check.
 * Only flags clearly invalid negative values.
 * Absolute scale (small vs large revenue) is too context-dependent
 * for a generic check without industry+stage benchmarks.
 */
export function checkRevenueNegative(value: string, yearLabel: string): FieldWarning | null {
  const num = parseFloat(value)
  if (isNaN(num)) return null

  if (num < 0) {
    return {
      severity: "error",
      message: `${yearLabel} revenue cannot be negative.`,
    }
  }

  return null
}
