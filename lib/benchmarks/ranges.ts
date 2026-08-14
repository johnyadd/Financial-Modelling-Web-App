// Canonical benchmark VALUES, paired with the sources in citations.ts.
//
// The memo prompt passes source names AND these ranges, so the LLM cannot
// improvise figures. Without this, the same cited source produced different
// numbers on every generation - OpenView marketing was quoted as 15-20%,
// 20-30% and 25-35% across three runs of the same model.
//
// Edit these when you revise a benchmark. They are the product, not decoration.

export const BENCHMARK_RANGES: Record<string, string> = {
  revenueGrowthY1:    "100-140% Y1 revenue growth, UK SaaS Seed+",
  revenueGrowthY2:    "100-140% Y2 revenue growth, UK SaaS Seed+",
  revenueGrowthY3:    "40-70% Y3 revenue growth, UK SaaS Series A",
  year1Revenue:       "GBP 100k-500k Y1 revenue, UK Seed SaaS",
  grossMargin:        "75-85% gross margin, UK B2B SaaS",
  cogsPercent:        "15-25% COGS as share of revenue, UK B2B SaaS",
  marketingBudgetPct: "20-30% of revenue, UK SaaS Seed to Series A",
  rdBudgetPct:        "15-25% of revenue, UK SaaS Seed to Series A",
  monthlyChurnRate:   "1.5-2.5% monthly logo churn, UK B2B SaaS",
  ebitdaMarginY3:     "-20% to +10% EBITDA margin by Y3, UK SME SaaS",
  discountRate:       "12-18% discount rate, UK Seed to Series A",
  terminalGrowthRate: "2.0-2.5% terminal growth, UK long-run inflation",
  targetExitMultiple: "3-5x revenue, UK B2B SaaS below GBP 1M ARR",
  currentCash:        "6-18 months runway held at Seed stage, UK",
  monthlyBurnRate:    "GBP 15k-40k monthly burn, UK Seed SaaS",
  employeeCount:      "5-15 headcount at Seed stage, UK",
}

import { BENCHMARK_CITATIONS } from "./citations"

/**
 * Builds the benchmark reference block for the memo prompt: each line pairs a
 * range with the source it comes from, so the LLM quotes our figures verbatim.
 */
export function buildBenchmarkReferenceBlock(): string {
  const lines: string[] = []
  for (const [key, range] of Object.entries(BENCHMARK_RANGES)) {
    const c = BENCHMARK_CITATIONS[key]
    if (!c) continue
    const adj = c.confidenceTier === "medium" ? " (UK-adjusted)" : ""
    lines.push(`- ${range} | Source: ${c.source} ${c.vintage}${adj}`)
  }
  return lines.join("\n")
}
