"use client"

import { useMemo } from "react"
import { useQuestionnaireStore } from "@/store/questionnaire-store"
import {
  getBenchmarks,
  getMetricStatus,
  getBenchmarkWarning,
  getPreFillValue,
  type SectorBenchmarks,
  type BenchmarkRange,
  BENCHMARK_METRIC_LABELS,
} from "@/lib/benchmarks"

export type MetricStatus = "normal" | "low" | "high" | "outlier-low" | "outlier-high"

export type BenchmarkField = {
  range: BenchmarkRange
  status: MetricStatus
  warning: string | null
  prefill: number | null
  label: string
}

export function useBenchmarks() {
  const { data } = useQuestionnaireStore()
  const industry = data.step1.industry ?? ""
  const subSector = data.step1.subSector ?? ""

  const benchmarks = useMemo(
    () => getBenchmarks(industry, subSector),
    [industry, subSector]
  )

  const hasBenchmarks = !!benchmarks

  // Returns status + warning for a numeric field value
  function getFieldBenchmark(
    metric: keyof SectorBenchmarks,
    value: string | undefined
  ): BenchmarkField | null {
    if (!benchmarks) return null
    const range = benchmarks[metric]
    const numValue = parseFloat(value ?? "")
    const label = BENCHMARK_METRIC_LABELS[metric]

    if (isNaN(numValue)) {
      return {
        range,
        status: "normal",
        warning: null,
        prefill: range.typical,
        label,
      }
    }

    const status = getMetricStatus(numValue, range)
    const warning = getBenchmarkWarning(label, numValue, range)

    return { range, status, warning, prefill: range.typical, label }
  }

  function getPrefill(metric: keyof SectorBenchmarks): number | null {
    return getPreFillValue(industry, subSector, metric)
  }

  function getPlaceholder(metric: keyof SectorBenchmarks): string {
    if (!benchmarks) return ""
    const b = benchmarks[metric]
    return `Typical: ${b.typical}${b.unit} (range ${b.min}–${b.max}${b.unit})`
  }

  function getRangeLabel(metric: keyof SectorBenchmarks): string {
    if (!benchmarks) return ""
    const b = benchmarks[metric]
    return `${b.min}–${b.max}${b.unit}`
  }

  return {
    benchmarks,
    hasBenchmarks,
    industry,
    subSector,
    getFieldBenchmark,
    getPrefill,
    getPlaceholder,
    getRangeLabel,
  }
}
