"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoaderIcon, PlusIcon, TrashIcon, CalendarIcon } from "lucide-react"
import { getDriverFieldsForSubType } from "@/lib/schemas/assumptions"

const NUMERIC = /^-?\d*\.?\d*$/

/** Only the P&L lines compareToPlan actually reads. */
const LINES = [
  { key: "revenue",            label: "Revenue" },
  { key: "cost_of_goods_sold", label: "Cost of sales" },
  { key: "gross_profit",       label: "Gross profit" },
  { key: "operating_expenses", label: "Operating expenses" },
  { key: "ebitda",             label: "EBITDA" },
  { key: "net_profit",         label: "Net profit" },
]

interface Period {
  id: string
  period_label: string
  period_type: string
  plan_year: number
  periods_elapsed: number
  income_statement: Record<string, unknown>
}

export function ActualsPanel({ modelInputId, currency = "GBP", subType, planDrivers = {} }: {
  modelInputId: string
  currency?: string
  subType?: string
  planDrivers?: Record<string, unknown>
}) {
  const router = useRouter()
  const [periods, setPeriods] = useState<Period[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [label, setLabel] = useState("")
  const [periodType, setPeriodType] = useState("month")
  const [planYear, setPlanYear] = useState("1")
  const [elapsed, setElapsed] = useState("")
  const [values, setValues] = useState<Record<string, string>>({})
  const [driverValues, setDriverValues] = useState<Record<string, string>>({})

  // Revenue-section drivers only — cost assumptions are not operational metrics.
  const driverFields = subType
    ? getDriverFieldsForSubType(subType as Parameters<typeof getDriverFieldsForSubType>[0])
        .filter((a) => a.section === "revenue")
        .map((a) => ({ key: a.key, label: a.shortLabel ?? a.label, suffix: a.suffix }))
    : []

  async function load() {
    try {
      const res = await fetch(`/api/actuals?modelInputId=${modelInputId}`, { credentials: "include" })
      const data = await res.json()
      if (res.ok) setPeriods(data.periods ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [modelInputId])

  // "2026-03" means three months elapsed on a January year start. Derived rather
  // than asked for, since making the user do the arithmetic invites errors.
  function deriveElapsed(l: string): string {
    const m = l.match(/^\d{4}-(\d{1,2})$/)
    if (m) return String(parseInt(m[1], 10))
    const q = l.match(/^\d{4}-Q([1-4])$/i)
    if (q) return q[1]
    return ""
  }

  async function handleSave() {
    if (!label.trim()) { setError("Enter a period label, e.g. 2026-03"); return }
    setSaving(true)
    setError(null)
    try {
      const incomeStatement: Record<string, number> = {}
      for (const l of LINES) {
        const v = values[l.key]
        if (v !== undefined && v !== "" && Number.isFinite(Number(v))) {
          incomeStatement[l.key] = Number(v)
        }
      }
      const res = await fetch("/api/actuals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          modelInputId,
          periodLabel: label.trim(),
          periodType,
          planYear: Number(planYear) || 1,
          periodsElapsed: Number(elapsed || deriveElapsed(label)) || 1,
          incomeStatement,
          drivers: Object.fromEntries(
            Object.entries(driverValues)
              .filter(([, v]) => v !== "" && Number.isFinite(Number(v)))
              .map(([k, v]) => [k, Number(v)])
          ),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Failed to save"); return }
      setLabel(""); setElapsed(""); setValues({}); setDriverValues({})
      await load()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(periodLabel: string) {
    await fetch("/api/actuals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ modelInputId, periodLabel }),
    })
    await load()
    router.refresh()
  }

  return (
    <div className="rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Reporting periods</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Add actuals to compare against plan in the board pack. Year-to-date figures,
          not the single month.
        </p>
      </div>

      {loading ? (
        <div className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderIcon className="w-4 h-4 animate-spin" />Loading periods...
        </div>
      ) : periods.length > 0 ? (
        <div className="p-4 space-y-2 border-b border-border">
          {periods.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 text-sm">
              <div>
                <span className="font-medium">{p.period_label}</span>
                <span className="text-muted-foreground ml-2 text-xs">
                  {p.periods_elapsed} {p.period_type === "quarter" ? "quarters" : "months"} elapsed
                  {" · "}revenue {currency} {Number(p.income_statement?.revenue ?? 0).toLocaleString()}
                </span>
              </div>
              <button type="button" onClick={() => handleDelete(p.period_label)}
                className="text-muted-foreground hover:text-red-600 transition-colors">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Period</label>
            <Input value={label} placeholder="2026-03"
              onChange={(e) => { setLabel(e.target.value); setElapsed(deriveElapsed(e.target.value)) }}
              className="h-9" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Type</label>
            <select value={periodType} onChange={(e) => setPeriodType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm">
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Plan year</label>
            <Input value={planYear} onChange={(e) => { if (NUMERIC.test(e.target.value)) setPlanYear(e.target.value) }} className="h-9" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Periods elapsed</label>
            <Input value={elapsed} placeholder="auto"
              onChange={(e) => { if (NUMERIC.test(e.target.value)) setElapsed(e.target.value) }}
              className="h-9" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {LINES.map((l) => (
            <div key={l.key}>
              <label className="text-xs text-muted-foreground">{l.label} ({currency})</label>
              <Input value={values[l.key] ?? ""} inputMode="decimal" placeholder="—"
                onChange={(e) => { if (NUMERIC.test(e.target.value)) setValues({ ...values, [l.key]: e.target.value }) }}
                className="h-9" />
            </div>
          ))}
        </div>

        {driverFields.length > 0 && (
          <div className="rounded-md border border-border bg-muted/30 p-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Operational drivers</span>
              {" — optional. Fill these in and the board pack can explain WHY revenue moved,"}
              {" not just that it did."}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {driverFields.map((d) => (
                <div key={d.key}>
                  <label className="text-xs text-muted-foreground">
                    {d.label}{d.suffix ? ` (${d.suffix})` : ""}
                  </label>
                  <Input value={driverValues[d.key] ?? ""} inputMode="decimal"
                    placeholder={planDrivers[d.key] != null ? `plan ${planDrivers[d.key]}` : "—"}
                    onChange={(e) => { if (NUMERIC.test(e.target.value)) setDriverValues({ ...driverValues, [d.key]: e.target.value }) }}
                    className="h-9" />
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (<><LoaderIcon className="w-4 h-4 animate-spin" />Saving...</>) : (<><PlusIcon className="w-4 h-4" />Add period</>)}
          </Button>
          <span className="text-xs text-muted-foreground">Saving refreshes the board pack.</span>
        </div>
      </div>
    </div>
  )
}
