"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertTriangleIcon, TrendingUpIcon, InfoIcon } from "lucide-react"
import type { MetricStatus, BenchmarkField } from "@/hooks/use-benchmarks"

// ─── colour tokens per status ────────────────────────────────────────────────
const STATUS_RING: Record<MetricStatus, string> = {
  normal:       "border-border focus:ring-ring",
  low:          "border-amber-400 focus:ring-amber-400/30",
  high:         "border-amber-400 focus:ring-amber-400/30",
  "outlier-low":  "border-red-500 focus:ring-red-400/30",
  "outlier-high": "border-red-500 focus:ring-red-400/30",
}

const STATUS_BADGE: Record<MetricStatus, { label: string; cls: string }> = {
  normal:         { label: "In range",     cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800" },
  low:            { label: "Below typical", cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800" },
  high:           { label: "Above typical", cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800" },
  "outlier-low":  { label: "Outlier low",  cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800" },
  "outlier-high": { label: "Outlier high", cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800" },
}

// ─── mini range bar ───────────────────────────────────────────────────────────
function RangeBar({
  value,
  min,
  max,
  typical,
}: {
  value: number
  min: number
  max: number
  typical: number
}) {
  const span = max - min || 1
  const clampedValue = Math.max(min, Math.min(max, value))
  const valuePct = ((clampedValue - min) / span) * 100
  const typicalPct = ((typical - min) / span) * 100

  return (
    <div className="mt-1.5">
      <div className="relative h-1.5 rounded-full bg-muted overflow-visible">
        {/* green zone — min to max */}
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-emerald-200 dark:bg-emerald-900"
          style={{ width: "100%" }}
        />
        {/* typical marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-primary rounded-full"
          style={{ left: `${typicalPct}%` }}
          title={`Typical: ${typical}`}
        />
        {/* value dot */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm transition-all",
            value < min || value > max ? "bg-red-500" : "bg-primary"
          )}
          style={{
            left: `calc(${valuePct}% - 5px)`,
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
        <span>{min}</span>
        <span className="text-primary font-medium">↑ {typical} typical</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
interface BenchmarkInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  benchmark: BenchmarkField | null
  showBar?: boolean
}

export const BenchmarkInput = React.forwardRef<
  HTMLInputElement,
  BenchmarkInputProps
>(({ benchmark, showBar = true, className, value, onChange, ...props }, ref) => {
  const numValue = parseFloat(String(value ?? ""))
  const hasValue = !isNaN(numValue)
  const status: MetricStatus = hasValue && benchmark
    ? benchmark.status
    : "normal"
  const badge = STATUS_BADGE[status]

  return (
    <div className="space-y-1">
      {/* input row */}
      <div className="relative">
        <input
          ref={ref}
          value={value}
          onChange={onChange}
          className={cn(
            "flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm",
            "shadow-sm transition-colors placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2",
            STATUS_RING[status],
            className
          )}
          {...props}
        />
        {/* status badge — only when value entered */}
        {hasValue && benchmark && (
          <span
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium px-1.5 py-0.5 rounded border",
              badge.cls
            )}
          >
            {badge.label}
          </span>
        )}
      </div>

      {/* benchmark range hint — always show when benchmark available */}
      {benchmark && (
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <InfoIcon className="w-3 h-3 flex-shrink-0" />
          Industry range: {benchmark.range.min}–{benchmark.range.max}
          {benchmark.range.unit} · typical {benchmark.range.typical}
          {benchmark.range.unit}
          {benchmark.range.note && (
            <span className="italic"> · {benchmark.range.note}</span>
          )}
        </p>
      )}

      {/* range bar */}
      {showBar && benchmark && hasValue && (
        <RangeBar
          value={numValue}
          min={benchmark.range.min}
          max={benchmark.range.max}
          typical={benchmark.range.typical}
        />
      )}

      {/* outlier warning */}
      {benchmark?.warning && hasValue && (
        <div className="flex items-start gap-1.5 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-2.5 py-2 text-xs text-red-700 dark:text-red-300">
          <AlertTriangleIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{benchmark.warning}</span>
        </div>
      )}
    </div>
  )
})
BenchmarkInput.displayName = "BenchmarkInput"
