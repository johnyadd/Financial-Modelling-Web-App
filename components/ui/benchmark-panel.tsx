"use client"

import { ChevronDownIcon, ChevronUpIcon, BarChart2Icon } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { SectorBenchmarks } from "@/lib/benchmarks"
import { BENCHMARK_METRIC_LABELS } from "@/lib/benchmarks"

const PANEL_METRICS: (keyof SectorBenchmarks)[] = [
  "grossMargin",
  "ebitdaMargin",
  "revenueGrowthY1",
  "revenueGrowthY2",
  "revenueGrowthY3",
  "churnRateAnnual",
  "cacPaybackMonths",
  "ltvCacRatio",
  "monthlyBurnRate",
  "discountRate",
  "terminalGrowthRate",
  "revenueMultiple",
  "ebitdaMultiple",
]

interface BenchmarkPanelProps {
  benchmarks: SectorBenchmarks
  industry: string
  subSector: string
}

export function BenchmarkPanel({
  benchmarks,
  industry,
  subSector,
}: BenchmarkPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
      {/* header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <BarChart2Icon className="w-4 h-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-primary">
              Industry benchmarks loaded
            </p>
            <p className="text-xs text-muted-foreground">
              {industry} · {subSector} — inputs will be colour-coded against
              these ranges
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUpIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {/* expanded table */}
      {open && (
        <div className="border-t border-primary/10 px-4 pb-4 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {PANEL_METRICS.map((metric) => {
              const b = benchmarks[metric]
              return (
                <div
                  key={metric}
                  className="flex items-center justify-between py-1 border-b border-border/50 last:border-0"
                >
                  <span className="text-xs text-muted-foreground">
                    {BENCHMARK_METRIC_LABELS[metric]}
                  </span>
                  <span className="text-xs font-medium text-foreground tabular-nums">
                    {b.min}–{b.max}
                    <span className="text-muted-foreground">{b.unit}</span>
                    <span className="ml-1 text-primary">
                      ({b.typical} typical)
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            Sources: Damodaran NYU, PitchBook, UK ONS, KPMG sector reports
            2023–2024. Ranges are indicative — your business may legitimately
            sit outside them.
          </p>
        </div>
      )}
    </div>
  )
}
