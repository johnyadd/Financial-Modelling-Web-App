// Scenario bridge: what changed between two cases, and what moved as a result.
//
// Deliberately NOT a per-driver decomposition. A true variance bridge needs one
// engine run per driver changed; a bridge with a large unexplained residual is
// worse than no bridge. This reports the delta honestly and leaves attribution
// to the narrative, which can reason about direction without inventing precision.

import type { ScenarioOverrides } from "./types"

export interface InputDelta {
  field: string
  label: string
  from: unknown
  to: unknown
}

export interface OutputDelta {
  metric: string
  label: string
  base: number | null
  compared: number | null
  delta: number | null
  deltaPct: number | null
}

/** Outputs worth surfacing, in reading order. Keys match summary_metrics. */
const TRACKED_METRICS: Record<string, string> = {
  year1_revenue:       "Year 1 revenue",
  year3_revenue:       "Year 3 revenue",
  final_year_revenue:  "Final year revenue",
  final_ebitda_margin: "Final EBITDA margin",
  equity_value:        "Equity value",
  enterprise_value:    "Enterprise value",
  npv:                 "NPV of forecast cash flows",
  irr:                 "IRR",
  runway_months:       "Runway (months)",
  post_raise_runway:   "Post-raise runway (months)",
}

const FIELD_LABELS: Record<string, string> = {
  monthlyChurnRate:    "Monthly churn",
  newCustomersPerMonth: "New customers per month",
  startingCustomers:   "Starting customers",
  arpu:                "ARPU",
  grossMargin:         "Gross margin",
  cogsPercent:         "COGS %",
  marketingBudgetPct:  "Marketing % of revenue",
  rdBudgetPct:         "R&D % of revenue",
  discountRate:        "Discount rate",
  targetExitMultiple:  "Exit multiple",
  terminalGrowthRate:  "Terminal growth",
  currentCash:         "Current cash",
  monthlyBurnRate:     "Monthly burn",
}

/** camelCase to sentence case, for fields with no explicit label. */
function humanise(key: string): string {
  const spaced = key.replace(/([A-Z])/g, " $1").toLowerCase().trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** Which inputs a case overrides, and what they moved from and to. */
export function diffInputs(
  base: { step2: Record<string, unknown>; step3: Record<string, unknown>; step4: Record<string, unknown> },
  overrides?: ScenarioOverrides
): InputDelta[] {
  if (!overrides) return []
  const deltas: InputDelta[] = []
  for (const step of ["step2", "step3", "step4"] as const) {
    const over = overrides[step] ?? {}
    for (const [field, to] of Object.entries(over)) {
      const from = base[step][field]
      if (String(from) === String(to)) continue
      deltas.push({ field, label: FIELD_LABELS[field] ?? humanise(field), from, to })
    }
  }
  return deltas
}

/** How the tracked outputs moved. Metrics absent from both sides are skipped. */
export function diffOutputs(
  baseSummary: Record<string, unknown>,
  comparedSummary: Record<string, unknown>
): OutputDelta[] {
  const deltas: OutputDelta[] = []
  for (const [metric, label] of Object.entries(TRACKED_METRICS)) {
    const b = toNumber(baseSummary?.[metric])
    const c = toNumber(comparedSummary?.[metric])
    if (b === null && c === null) continue
    const delta = b !== null && c !== null ? c - b : null
    const deltaPct = delta !== null && b !== null && b !== 0
      ? (delta / Math.abs(b)) * 100
      : null
    deltas.push({ metric, label, base: b, compared: c, delta, deltaPct })
  }
  return deltas
}

/** Compact text form, for the memo prompt. */
export function formatBridgeForPrompt(
  caseLabel: string,
  inputs: InputDelta[],
  outputs: OutputDelta[]
): string {
  const lines: string[] = [`${caseLabel} case:`]
  lines.push("  Inputs changed from base:")
  if (inputs.length === 0) lines.push("    (none)")
  for (const i of inputs) lines.push(`    ${i.label}: ${i.from} -> ${i.to}`)
  lines.push("  Resulting output movement:")
  for (const o of outputs) {
    if (o.delta === null) continue
    const pct = o.deltaPct !== null ? ` (${o.deltaPct.toFixed(1)}%)` : ""
    lines.push(`    ${o.label}: ${o.base} -> ${o.compared}${pct}`)
  }
  return lines.join("\\n")
}
