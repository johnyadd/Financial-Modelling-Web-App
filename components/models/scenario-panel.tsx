"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getDriverFieldsForSubType, getAssumption } from "@/lib/schemas/assumptions"
import { LoaderIcon, ChevronDownIcon, ChevronUpIcon, ScaleIcon } from "lucide-react"

const COST_LEVERS = ["grossMargin", "cogsPercent", "marketingBudgetPct", "rdBudgetPct"]

// Accepts digits, one decimal point and a leading minus - including partial
// entries like "-" or "1." so typing is not blocked mid-keystroke.
const NUMERIC = /^-?\d*\.?\d*$/

// grossMargin and cogsPercent are the same number expressed two ways.
// Editing them independently let a scenario set COGS 40% AND gross margin 45%,
// which the engine computed into a case labelled "Upside" that was worse than
// base — the memo then had to reason about a contradiction rather than a scenario.
function withDerived(o: Overrides, key: string, value: string): Overrides {
  const next = { ...o, [key]: value }
  const n = Number(value)
  if (value === "" || !Number.isFinite(n)) return next
  const other = Math.round((100 - n) * 10) / 10
  if (key === "grossMargin") next.cogsPercent = String(other)
  if (key === "cogsPercent") next.grossMargin = String(other)
  return next
}

type Overrides = Record<string, string>

interface ScenarioPanelProps {
  model: {
    id: string
    step2_revenue?: Record<string, unknown> | null
    step3_costs?: Record<string, unknown> | null
    scenarios?: { upside?: { step2?: Overrides; step3?: Overrides }; downside?: { step2?: Overrides; step3?: Overrides } } | null
  }
}

interface Field {
  key: string
  label: string
  suffix?: string
  step: "step2" | "step3"
  baseValue: string
}

export function ScenarioPanel({ model }: ScenarioPanelProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const step2 = (model.step2_revenue ?? {}) as Record<string, unknown>
  const step3 = (model.step3_costs ?? {}) as Record<string, unknown>
  const subType = step2.businessTypeSub as string | undefined

  const [upside, setUpside] = useState<Overrides>({
    ...(model.scenarios?.upside?.step2 ?? {}),
    ...(model.scenarios?.upside?.step3 ?? {}),
  })
  const [downside, setDownside] = useState<Overrides>({
    ...(model.scenarios?.downside?.step2 ?? {}),
    ...(model.scenarios?.downside?.step3 ?? {}),
  })

  const driverFields: Field[] = subType
    ? getDriverFieldsForSubType(subType as Parameters<typeof getDriverFieldsForSubType>[0])
        .map((a) => ({
          key: a.key,
          label: a.shortLabel ?? a.label,
          suffix: a.suffix,
          step: "step2" as const,
          baseValue: String(step2[a.key] ?? ""),
        }))
        .filter((f) => f.baseValue !== "")
    : []

  const costFields: Field[] = COST_LEVERS.map((key) => {
    const a = getAssumption(key)
    return {
      key,
      label: a?.shortLabel ?? a?.label ?? key,
      suffix: a?.suffix,
      step: "step3" as const,
      baseValue: String(step3[key] ?? ""),
    }
  }).filter((f) => f.baseValue !== "")

  const fields = [...driverFields, ...costFields]

  function split(overrides: Overrides) {
    const s2: Overrides = {}
    const s3: Overrides = {}
    for (const f of fields) {
      const v = overrides[f.key]
      if (v === undefined || v === "" || v === f.baseValue) continue
      if (f.step === "step2") s2[f.key] = v
      else s3[f.key] = v
    }
    const out: { step2?: Overrides; step3?: Overrides } = {}
    if (Object.keys(s2).length) out.step2 = s2
    if (Object.keys(s3).length) out.step3 = s3
    return Object.keys(out).length ? out : undefined
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {}
      const up = split(upside)
      const down = split(downside)
      if (up) payload.upside = up
      if (down) payload.downside = down

      const supabase = createClient()
      const { error: saveError } = await supabase
        .from("model_inputs")
        .update({ scenarios: Object.keys(payload).length ? payload : null })
        .eq("id", model.id)
      if (saveError) throw new Error(saveError.message)

      const res = await fetch("/api/engine/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ modelInputId: model.id }),
      })
      if (!res.ok) throw new Error("Recalculation failed")

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  if (fields.length === 0) return null

  return (
    <div className="rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ScaleIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Scenario cases</span>
          <span className="text-xs text-muted-foreground">
            Define upside and downside. Blank means same as base.
          </span>
        </div>
        {open ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
      </button>

      {open && (
        <div className="border-t border-border p-4 space-y-3">
          <div className="grid grid-cols-[1fr_90px_90px_90px] gap-2 text-xs text-muted-foreground font-medium">
            <span>Driver</span>
            <span className="text-right">Base</span>
            <span className="text-right">Downside</span>
            <span className="text-right">Upside</span>
          </div>

          {fields.map((f) => (
            <div key={f.key} className="grid grid-cols-[1fr_90px_90px_90px] gap-2 items-center">
              <span className="text-sm">{f.label}</span>
              <span className="text-sm text-muted-foreground text-right font-mono">
                {f.baseValue}{f.suffix ?? ""}
              </span>
              <Input
                value={downside[f.key] ?? ""}
                placeholder={f.baseValue}
                inputMode="decimal"
                onChange={(e) => { if (NUMERIC.test(e.target.value)) setDownside(withDerived(downside, f.key, e.target.value)) }}
                className="h-8 text-sm text-right"
              />
              <Input
                value={upside[f.key] ?? ""}
                placeholder={f.baseValue}
                inputMode="decimal"
                onChange={(e) => { if (NUMERIC.test(e.target.value)) setUpside(withDerived(upside, f.key, e.target.value)) }}
                className="h-8 text-sm text-right"
              />
            </div>
          ))}

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <><LoaderIcon className="w-4 h-4 animate-spin" />Recalculating...</>
              ) : (
                "Save and recalculate"
              )}
            </Button>
            <span className="text-xs text-muted-foreground">
              Recalculates all cases and refreshes the memo.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
