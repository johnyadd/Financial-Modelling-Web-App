"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MODEL_TYPES } from "@/lib/questionnaire-data"
import { BUSINESS_GOALS } from "@/lib/goals"
import { GenerateButton } from "@/components/models/generate-button"
import {
  RevenueEbitdaChart,
  MarginProgressionChart,
  FCFChart,
  ScenarioChart,
  RevenueGrowthChart,
} from "@/components/models/model-charts"
import {
  BalanceSheetTable,
  CashFlowTable,
  BalanceSheetChart,
  CashFlowChart,
} from "@/components/models/three-statement-tables"
import {
  ArrowLeftIcon,
  TrendingUpIcon,
  ReceiptIcon,
  BanknoteIcon,
  BuildingIcon,
  SparklesIcon,
  CheckCircle2Icon,
  ClockIcon,
  BarChart2Icon,
  TableIcon,
  DownloadIcon,
  LandmarkIcon,
  WalletIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ModelDetailProps {
  model: {
    id: string
    entity_type: string
    source: string
    model_type: string
    goal_id: string | null
    status: string
    name: string | null
    step1_business: Record<string, unknown>
    step2_revenue: Record<string, unknown>
    step3_costs: Record<string, unknown>
    step4_funding: Record<string, unknown>
    created_at: string
    updated_at: string
  }
  output?: Record<string, unknown> | null
}

function fmt(val: unknown, currency = "GBP"): string {
  const n = parseFloat(String(val))
  if (isNaN(n)) return "—"
  if (Math.abs(n) >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(2)}m`
  if (Math.abs(n) >= 1_000) return `${currency} ${(n / 1_000).toFixed(1)}k`
  return `${currency} ${n.toFixed(0)}`
}

function pct(val: unknown): string {
  const n = parseFloat(String(val))
  if (isNaN(n)) return "—"
  return `${n.toFixed(1)}%`
}

function mul(val: unknown): string {
  const n = parseFloat(String(val))
  if (isNaN(n)) return "—"
  return `${n.toFixed(1)}x`
}

function MetricCard({ label, value, sub, highlight = false }: {
  label: string; value: string; sub?: string; highlight?: boolean
}) {
  return (
    <div className={cn("rounded-xl border p-4", highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card")}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-xl font-bold", highlight ? "text-primary" : "text-foreground")}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="text-primary">{icon}</div>
      <h3 className="font-semibold text-foreground">{title}</h3>
    </div>
  )
}

function DataRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between items-start text-sm py-1.5 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[55%]">{value}</span>
    </div>
  )
}

function PLTable({ pnl, currency }: { pnl: Record<string, unknown>[]; currency: string }) {
  const rows = [
    { key: "revenue",       label: "Revenue" },
    { key: "gross_profit",  label: "Gross profit" },
    { key: "ebitda",        label: "EBITDA" },
    { key: "ebitda_margin", label: "EBITDA margin", isPct: true },
    { key: "ebit",          label: "EBIT" },
    { key: "tax",           label: "Tax" },
    { key: "net_income",    label: "Net income" },
  ]
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 text-muted-foreground font-medium">Line item</th>
            {pnl.map((row) => (
              <th key={String(row.year)} className="text-right py-2 text-muted-foreground font-medium px-2">Year {String(row.year)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ key, label, isPct }) => (
            <tr key={key} className={cn("border-b border-border/40", (key === "ebitda" || key === "net_income") ? "font-semibold" : "")}>
              <td className="py-2 text-foreground">{label}</td>
              {pnl.map((row) => (
                <td key={String(row.year)} className={cn("text-right py-2 px-2 tabular-nums", parseFloat(String(row[key])) < 0 ? "text-red-600 dark:text-red-400" : "text-foreground")}>
                  {isPct ? pct(row[key]) : fmt(row[key], currency)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FCFTable({ fcfSchedule, pvFcfs, currency }: { fcfSchedule: number[]; pvFcfs: number[]; currency: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 text-muted-foreground font-medium">Year</th>
            {fcfSchedule.map((_, i) => (
              <th key={i} className="text-right py-2 px-2 text-muted-foreground font-medium">Year {i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/40">
            <td className="py-2 text-foreground font-medium">Free cash flow</td>
            {fcfSchedule.map((val, i) => (
              <td key={i} className={cn("text-right py-2 px-2 tabular-nums", val < 0 ? "text-red-600 dark:text-red-400" : "text-foreground")}>{fmt(val, currency)}</td>
            ))}
          </tr>
          <tr>
            <td className="py-2 text-foreground font-medium">PV of FCF</td>
            {pvFcfs.map((val, i) => (
              <td key={i} className={cn("text-right py-2 px-2 tabular-nums", val < 0 ? "text-red-600 dark:text-red-400" : "text-foreground")}>{fmt(val, currency)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function ScenariosCard({ scenarios, currency }: { scenarios: Record<string, Record<string, unknown>>; currency: string }) {
  const config = {
    bear: { label: "Bear case", cls: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950" },
    base: { label: "Base case", cls: "border-primary/20 bg-primary/5" },
    bull: { label: "Bull case", cls: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950" },
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {(["bear", "base", "bull"] as const).map((key) => {
        const s = scenarios[key]; const c = config[key]
        if (!s) return null
        return (
          <div key={key} className={cn("rounded-xl border p-4", c.cls)}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{c.label}</p>
            <div className="space-y-2">
              <div><p className="text-xs text-muted-foreground">Enterprise value</p><p className="font-bold text-foreground">{fmt(s.enterprise_value, currency)}</p></div>
              <div><p className="text-xs text-muted-foreground">Year 1 revenue</p><p className="font-medium text-foreground">{fmt(s.year1_revenue, currency)}</p></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SensitivityTable({ sensitivity, currency }: { sensitivity: Record<string, unknown>; currency: string }) {
  const drs = sensitivity.discount_rates as number[]
  const tgrs = sensitivity.terminal_growth_rates as number[]
  const matrix = sensitivity.npv_matrix as number[][]
  const baseNpv = sensitivity.base_npv as number
  return (
    <div className="overflow-x-auto">
      <p className="text-xs text-muted-foreground mb-3">Enterprise value by discount rate (rows) and terminal growth rate (columns)</p>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-4 text-muted-foreground">DR \ TGR</th>
            {tgrs.map((tgr) => (<th key={tgr} className="text-right py-2 px-2 text-muted-foreground">{tgr}%</th>))}
          </tr>
        </thead>
        <tbody>
          {drs.map((dr, i) => (
            <tr key={dr} className="border-b border-border/40">
              <td className="py-2 pr-4 text-muted-foreground font-medium">{dr}%</td>
              {matrix[i].map((val, j) => {
                const isBase = Math.abs(val - baseNpv) < 1
                return (
                  <td key={j} className={cn("text-right py-2 px-2 tabular-nums", isBase ? "font-bold text-primary" : val < 0 ? "text-red-600 dark:text-red-400" : "text-foreground")}>
                    {fmt(val, currency)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ModelDetail({ model, output }: ModelDetailProps) {
  const router = useRouter()
  const s1 = model.step1_business as Record<string, string>
  const s2 = model.step2_revenue as Record<string, string>
  const s3 = model.step3_costs as Record<string, string>
  const s4 = model.step4_funding as Record<string, string>

  const currency = s1.currency ?? "GBP"
  const modelLabel = MODEL_TYPES.find((m) => m.value === model.model_type)?.label
  const goal = BUSINESS_GOALS.find((g) => g.id === model.goal_id)
  const isComplete = model.status === "complete"
  const isPending = model.status === "inputs_complete"
  const isThreeStatement = model.model_type === "three_statement"

  const createdAt = new Date(model.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  })

  // Extract output — three_statement uses different column
  const rawOutput = isThreeStatement
    ? (output?.three_statement ?? output?.dcf_output ?? {})
    : (output?.dcf_output ?? output?.three_statement ?? {})
  const dcfOutput = rawOutput as Record<string, unknown>

  const summary       = (dcfOutput?.summary ?? output?.summary_metrics ?? {}) as Record<string, unknown>
  const pnl           = (dcfOutput?.pnl ?? dcfOutput?.income_statement ?? []) as Record<string, unknown>[]
  const fcfSchedule   = (dcfOutput?.fcf_schedule ?? []) as number[]
  const pvFcfs        = (dcfOutput?.pv_fcfs ?? []) as number[]
  const scenarios     = (dcfOutput?.scenarios ?? {}) as Record<string, Record<string, unknown>>
  const sensitivity   = (dcfOutput?.sensitivity ?? null) as Record<string, unknown> | null
  const balanceSheet  = (dcfOutput?.balance_sheet ?? []) as Record<string, unknown>[]
  const cashFlow      = (dcfOutput?.cash_flow ?? []) as Record<string, unknown>[]

  const hasResults = isComplete && output && Object.keys(summary).length > 0

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <button onClick={() => router.push("/dashboard")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeftIcon className="w-4 h-4" />Back to dashboard
        </button>

        {/* header */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="text-xs">{model.entity_type === "startup" ? "Startup" : "Existing business"}</Badge>
              {isComplete ? (
                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300 gap-1"><CheckCircle2Icon className="w-3 h-3" />Complete</Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 gap-1"><ClockIcon className="w-3 h-3" />Awaiting engine</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{s1.businessName ?? modelLabel ?? "Financial model"}</h1>
            <p className="text-sm text-muted-foreground">{modelLabel} · Created {createdAt}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {isComplete && (
              <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(`/api/models/export/${model.id}`, '_blank')}>
                <DownloadIcon className="w-4 h-4" />Export Excel
              </Button>
            )}
            <GenerateButton modelInputId={model.id} status={model.status} />
          </div>
        </div>

        {goal && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 mb-6 flex items-center gap-3">
            <SparklesIcon className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-sm text-foreground">
              <span className="font-medium">Goal:</span> {goal.icon} {goal.title}
              <span className="text-muted-foreground mx-2">·</span>
              <span className="font-medium">Model:</span> {modelLabel}
            </p>
          </div>
        )}

        {/* results */}
        {hasResults && (
          <div className="space-y-8 mb-8">

            {/* key metrics */}
            <div>
              <SectionHeader icon={<BarChart2Icon className="w-4 h-4" />} title="Key metrics" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {summary.enterprise_value != null && <MetricCard label="Enterprise value" value={fmt(summary.enterprise_value, currency)} highlight />}
                {summary.equity_value != null && <MetricCard label="Equity value" value={fmt(summary.equity_value, currency)} />}
                {summary.irr != null && <MetricCard label="IRR" value={pct(summary.irr)} />}
                {summary.exit_valuation != null && <MetricCard label="Exit valuation" value={fmt(summary.exit_valuation, currency)} sub={`${mul(summary.exit_multiple)} revenue`} />}
                {summary.runway_months != null && <MetricCard label="Runway" value={`${Number(summary.runway_months).toFixed(1)} months`} />}
                {summary.closing_cash != null && <MetricCard label="Closing cash" value={fmt(summary.closing_cash, currency)} />}
                {summary.revenue_cagr != null && <MetricCard label="Revenue CAGR" value={pct(summary.revenue_cagr)} />}
                {summary.discount_rate != null && <MetricCard label="Discount rate" value={pct(summary.discount_rate)} />}
                {summary.terminal_growth != null && <MetricCard label="Terminal growth" value={pct(summary.terminal_growth)} />}
                {summary.terminal_value != null && <MetricCard label="Terminal value" value={fmt(summary.terminal_value, currency)} />}
              </div>
            </div>

            {/* charts */}
            {pnl.length > 0 && (
              <>
                <Separator />
                <div>
                  <SectionHeader icon={<BarChart2Icon className="w-4 h-4" />} title="Charts & visualisations" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-sm font-semibold text-foreground mb-3">Revenue & EBITDA</p>
                      <RevenueEbitdaChart pnl={pnl} currency={currency} />
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-sm font-semibold text-foreground mb-3">Revenue growth</p>
                      <RevenueGrowthChart pnl={pnl} currency={currency} />
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-sm font-semibold text-foreground mb-3">Margin progression</p>
                      <MarginProgressionChart pnl={pnl} />
                    </div>
                    {fcfSchedule.length > 0 && (
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-sm font-semibold text-foreground mb-3">Free cash flow</p>
                        <FCFChart fcfSchedule={fcfSchedule} currency={currency} />
                      </div>
                    )}
                    {balanceSheet.length > 0 && (
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-sm font-semibold text-foreground mb-3">Balance sheet composition</p>
                        <BalanceSheetChart balanceSheet={balanceSheet} currency={currency} />
                      </div>
                    )}
                    {cashFlow.length > 0 && (
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-sm font-semibold text-foreground mb-3">Cash flow waterfall</p>
                        <CashFlowChart cashFlow={cashFlow} currency={currency} />
                      </div>
                    )}
                    {Object.keys(scenarios).length > 0 && (
                      <div className="rounded-xl border border-border bg-card p-4 md:col-span-2">
                        <p className="text-sm font-semibold text-foreground mb-3">Scenario comparison</p>
                        <ScenarioChart scenarios={scenarios} currency={currency} />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* P&L */}
            {pnl.length > 0 && (
              <>
                <Separator />
                <div>
                  <SectionHeader icon={<ReceiptIcon className="w-4 h-4" />} title="Income statement" />
                  <PLTable pnl={pnl} currency={currency} />
                </div>
              </>
            )}

            {/* Balance Sheet */}
            {balanceSheet.length > 0 && (
              <>
                <Separator />
                <div>
                  <SectionHeader icon={<LandmarkIcon className="w-4 h-4" />} title="Balance sheet" />
                  <BalanceSheetTable balanceSheet={balanceSheet} currency={currency} />
                </div>
              </>
            )}

            {/* Cash Flow Statement */}
            {cashFlow.length > 0 && (
              <>
                <Separator />
                <div>
                  <SectionHeader icon={<WalletIcon className="w-4 h-4" />} title="Cash flow statement" />
                  <CashFlowTable cashFlow={cashFlow} currency={currency} />
                </div>
              </>
            )}

            {/* FCF schedule (DCF models) */}
            {fcfSchedule.length > 0 && !isThreeStatement && (
              <>
                <Separator />
                <div>
                  <SectionHeader icon={<TrendingUpIcon className="w-4 h-4" />} title="Free cash flow" />
                  <FCFTable fcfSchedule={fcfSchedule} pvFcfs={pvFcfs} currency={currency} />
                </div>
              </>
            )}

            {/* Scenarios */}
            {Object.keys(scenarios).length > 0 && (
              <>
                <Separator />
                <div>
                  <SectionHeader icon={<BarChart2Icon className="w-4 h-4" />} title="Scenario analysis" />
                  <ScenariosCard scenarios={scenarios} currency={currency} />
                </div>
              </>
            )}

            {/* Sensitivity */}
            {sensitivity && (
              <>
                <Separator />
                <div>
                  <SectionHeader icon={<TableIcon className="w-4 h-4" />} title="Sensitivity analysis" />
                  <SensitivityTable sensitivity={sensitivity} currency={currency} />
                </div>
              </>
            )}
          </div>
        )}

        {/* inputs */}
        <Separator className="mb-8" />
        <h3 className="font-semibold text-foreground mb-4">Model inputs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3"><BuildingIcon className="w-4 h-4 text-primary" /><h4 className="font-semibold text-sm">Business info</h4></div>
            <DataRow label="Business name" value={s1.businessName} />
            <DataRow label="Industry" value={s1.industry} />
            <DataRow label="Sub-sector" value={s1.subSector} />
            <DataRow label="Stage" value={s1.businessStage} />
            <DataRow label="Country" value={s1.country} />
            <DataRow label="Currency" value={s1.currency} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3"><TrendingUpIcon className="w-4 h-4 text-primary" /><h4 className="font-semibold text-sm">Revenue assumptions</h4></div>
            <DataRow label="Revenue model" value={s2.revenueModel} />
            <DataRow label="Year 1 revenue" value={fmt(s2.year1Revenue, currency)} />
            <DataRow label="Year 2 revenue" value={fmt(s2.year2Revenue, currency)} />
            <DataRow label="Year 3 revenue" value={fmt(s2.year3Revenue, currency)} />
            <DataRow label="Y1 growth" value={s2.revenueGrowthY1 ? `${s2.revenueGrowthY1}%` : null} />
            <DataRow label="Y2 growth" value={s2.revenueGrowthY2 ? `${s2.revenueGrowthY2}%` : null} />
            <DataRow label="Y3 growth" value={s2.revenueGrowthY3 ? `${s2.revenueGrowthY3}%` : null} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3"><ReceiptIcon className="w-4 h-4 text-primary" /><h4 className="font-semibold text-sm">Cost structure</h4></div>
            <DataRow label="Gross margin" value={s3.grossMargin ? `${s3.grossMargin}%` : null} />
            <DataRow label="Total payroll" value={fmt(s3.salariesTotal, currency)} />
            <DataRow label="COGS %" value={s3.cogsPercent ? `${s3.cogsPercent}%` : null} />
            <DataRow label="Marketing %" value={s3.marketingBudgetPct ? `${s3.marketingBudgetPct}%` : null} />
            <DataRow label="R&D %" value={s3.rdBudgetPct ? `${s3.rdBudgetPct}%` : null} />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3"><BanknoteIcon className="w-4 h-4 text-primary" /><h4 className="font-semibold text-sm">Funding & exit</h4></div>
            <DataRow label="Funding stage" value={s4.fundingStage} />
            <DataRow label="Current cash" value={fmt(s4.currentCash, currency)} />
            <DataRow label="Monthly burn" value={fmt(s4.monthlyBurnRate, currency)} />
            <DataRow label="Runway" value={s4.runwayMonths ? `${s4.runwayMonths} months` : null} />
            <DataRow label="Discount rate" value={s4.discountRate ? `${s4.discountRate}%` : null} />
            <DataRow label="Terminal growth" value={s4.terminalGrowthRate ? `${s4.terminalGrowthRate}%` : null} />
            <DataRow label="Exit horizon" value={s4.exitHorizonYears} />
          </div>
        </div>

        {isPending && (
          <div className="mt-6 rounded-xl border border-border bg-muted/20 p-5 flex items-start gap-3">
            <ClockIcon className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Ready to generate</p>
              <p className="text-sm text-muted-foreground">Your inputs are saved. Click "Generate financial model" above to run the calculation engine.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
