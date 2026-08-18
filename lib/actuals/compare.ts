// Year-to-date actuals against pro-rata year-to-date plan.
//
// The model forecasts ANNUALLY; a board pack reports MONTHLY. Phasing an annual
// figure by dividing by twelve is wrong for anything seasonal, so instead we
// compare YTD actual against the plan scaled by periods elapsed. Honest, needs
// no seasonality input, and matches what many real packs do.

export interface ActualPeriod {
  period_label: string
  plan_year: number
  periods_elapsed: number
  period_type: string
  income_statement?: Record<string, unknown> | null
  balance_sheet?: Record<string, unknown> | null
  cash_flow?: Record<string, unknown> | null
}

export interface VarianceRow {
  metric: string
  label: string
  actual: number | null
  plan: number | null
  variance: number | null
  variancePct: number | null
  /** True when a positive variance is bad — costs over plan, for instance. */
  inverted: boolean
}

/** P&L lines worth reporting, in reading order. */
const TRACKED: { key: string; label: string; inverted: boolean }[] = [
  { key: "revenue",            label: "Revenue",            inverted: false },
  { key: "cost_of_goods_sold", label: "Cost of sales",      inverted: true  },
  { key: "gross_profit",       label: "Gross profit",       inverted: false },
  { key: "operating_expenses", label: "Operating expenses", inverted: true  },
  { key: "ebitda",             label: "EBITDA",             inverted: false },
  { key: "net_profit",         label: "Net profit",         inverted: false },
]

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** Sums a P&L line across every period supplied. */
function ytdActual(periods: ActualPeriod[], key: string): number | null {
  let total = 0
  let found = false
  for (const p of periods) {
    const v = num((p.income_statement ?? {})[key])
    if (v !== null) { total += v; found = true }
  }
  return found ? total : null
}

/**
 * Compares YTD actuals against the plan scaled to the same elapsed fraction.
 * periodsInYear is 12 for monthly reporting, 4 for quarterly.
 */
export function compareToPlan(
  periods: ActualPeriod[],
  planAnnual: Record<string, unknown>,
  periodsInYear = 12
): VarianceRow[] {
  if (periods.length === 0) return []
  const elapsed = Math.max(...periods.map((p) => p.periods_elapsed))
  const fraction = Math.min(elapsed / periodsInYear, 1)

  const rows: VarianceRow[] = []
  for (const t of TRACKED) {
    const actual = ytdActual(periods, t.key)
    const annual = num(planAnnual[t.key])
    const plan = annual === null ? null : annual * fraction
    if (actual === null && plan === null) continue

    const variance = actual !== null && plan !== null ? actual - plan : null
    // Divide by the absolute plan: a swing from -50k to +10k is an improvement,
    // and a signed denominator would report it as negative.
    const variancePct =
      variance !== null && plan !== null && plan !== 0
        ? (variance / Math.abs(plan)) * 100
        : null

    rows.push({ metric: t.key, label: t.label, actual, plan, variance, variancePct, inverted: t.inverted })
  }
  return rows
}

/** Compact text form for the board-pack prompt. */
export function formatVarianceForPrompt(rows: VarianceRow[], elapsedLabel: string): string {
  const lines: string[] = [`Year-to-date actuals vs plan (${elapsedLabel}):`]
  for (const r of rows) {
    if (r.actual === null || r.plan === null) continue
    const pct = r.variancePct !== null ? ` (${r.variancePct.toFixed(1)}%)` : ""
    const dir = r.variance === null ? "" : r.variance >= 0 ? "above" : "below"
    lines.push(`  ${r.label}: actual ${Math.round(r.actual)} vs plan ${Math.round(r.plan)} - ${dir} plan${pct}`)
  }
  return lines.join("\n")
}
