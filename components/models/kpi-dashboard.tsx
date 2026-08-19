"use client"

import { useEffect, useState } from "react"
import { compareToPlan } from "@/lib/actuals/compare"
import type { ActualPeriod, VarianceRow } from "@/lib/actuals/compare"
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react"

interface KpiDashboardProps {
  modelInputId: string
  currency: string
  summary: Record<string, unknown>
  /** Year one of the P&L — the plan actuals compare against. */
  planYear1: Record<string, unknown>
}

// Has a billions tier, which the existing formatter lacks - that is why Apple
// renders as "USD 442901.47m" on the model detail page.
function fmt(v: unknown, currency: string): string {
  const n = Number(v)
  if (!Number.isFinite(n)) return "-"
  const abs = Math.abs(n)
  const sign = n < 0 ? "-" : ""
  if (abs >= 1000000000) return `${sign}${currency} ${(abs / 1000000000).toFixed(2)}bn`
  if (abs >= 1000000) return `${sign}${currency} ${(abs / 1000000).toFixed(2)}m`
  if (abs >= 1000) return `${sign}${currency} ${(abs / 1000).toFixed(1)}k`
  return `${sign}${currency} ${abs.toFixed(0)}`
}

function pct(v: unknown): string {
  const n = Number(v)
  return Number.isFinite(n) ? `${n.toFixed(1)}%` : "-"
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}

// Direction reads by IMPACT, not sign: costs above plan is bad, revenue above is good.
function VarianceTile({ row, currency }: { row: VarianceRow; currency: string }) {
  const good = row.variance === null ? null : row.inverted ? row.variance <= 0 : row.variance >= 0
  const Icon = good === null ? MinusIcon : good ? TrendingUpIcon : TrendingDownIcon
  const tone = good === null
    ? "text-muted-foreground"
    : good
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-amber-600 dark:text-amber-400"
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs text-muted-foreground">{row.label}</p>
      <p className="text-xl font-bold mt-0.5">{fmt(row.actual, currency)}</p>
      <div className={`flex items-center gap-1 mt-1 ${tone}`}>
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs">
          {row.variancePct !== null ? `${row.variancePct > 0 ? "+" : ""}${row.variancePct.toFixed(1)}%` : "-"}
          <span className="text-muted-foreground"> vs plan {fmt(row.plan, currency)}</span>
        </span>
      </div>
    </div>
  )
}

export function KpiDashboard({ modelInputId, currency, summary, planYear1 }: KpiDashboardProps) {
  const [rows, setRows] = useState<VarianceRow[]>([])
  const [periodLabel, setPeriodLabel] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/actuals?modelInputId=${modelInputId}`, { credentials: "include" })
        const data = await res.json()
        const periods = (data.periods ?? []) as ActualPeriod[]
        if (cancelled || periods.length === 0) return
        const inYear = periods[0].period_type === "quarter" ? 4 : 12
        setRows(compareToPlan(periods, planYear1, inYear))
        const elapsed = Math.max(...periods.map((p) => p.periods_elapsed))
        const unit = periods[0].period_type === "quarter" ? "quarters" : "months"
        setPeriodLabel(`${elapsed} ${unit} to ${periods[periods.length - 1].period_label}`)
      } catch {
        // Degrades to plan-only rather than breaking the page.
      }
    }
    load()
    return () => { cancelled = true }
  }, [modelInputId, planYear1])

  const hasActuals = rows.length > 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold">Key metrics</h3>
        <span className="text-xs text-muted-foreground">
          {hasActuals ? `Actual vs plan - ${periodLabel}` : "Plan only - add a reporting period to compare"}
        </span>
      </div>

      {hasActuals && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {rows.filter((r) => r.actual !== null).slice(0, 4).map((r) => (
            <VarianceTile key={r.metric} row={r} currency={currency} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile label="Closing cash (final year)" value={fmt(summary.closing_cash, currency)} />
        <Tile label="Runway" value={summary.runway_months ? `${summary.runway_months} months` : "-"}
          sub={summary.post_raise_runway ? `${summary.post_raise_runway} post-raise` : undefined} />
        <Tile label="Final EBITDA margin" value={pct(summary.final_ebitda_margin)} />
        <Tile label="Final year revenue" value={fmt(summary.final_year_revenue, currency)} />
      </div>
    </div>
  )
}
