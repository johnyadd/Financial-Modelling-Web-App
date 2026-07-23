"use client"

import { forwardRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, SparklesIcon, LoaderIcon, CheckIcon } from "lucide-react"
import type { BenchmarkEntry } from "@/lib/benchmarks/types"
import type { AISuggestionContext, AISuggestionResult } from "@/lib/schemas/assumptions"

interface BenchmarkInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  benchmark?: BenchmarkEntry
  showBenchmark?: boolean
  formatValue?: (value: string | number) => string
  // AI suggest props
  assumptionKey?: string
  aiContext?: AISuggestionContext
  onAIAccept?: (value: number | string) => void
}

export const BenchmarkInput = forwardRef<HTMLInputElement, BenchmarkInputProps>(
  ({ className, benchmark, showBenchmark = true, formatValue, assumptionKey, aiContext, onAIAccept, ...props }, ref) => {
    const [aiLoading, setAiLoading] = useState(false)
    const [aiSuggestion, setAiSuggestion] = useState<AISuggestionResult | null>(null)
    const [aiSource, setAiSource] = useState<string>("")

    if (!benchmark && !assumptionKey) {
      return <Input ref={ref} className={className} {...props} />
    }

    async function fetchAISuggestion() {
      if (!assumptionKey || !aiContext) return
      setAiLoading(true)
      try {
        const res = await fetch("/api/ai-suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ assumptionKey, context: aiContext }),
        })
        const data = await res.json()
        if (data.suggestion) {
          setAiSuggestion(data.suggestion)
          setAiSource(data.source ?? "")
        }
      } catch (err) {
        console.error("AI suggest error:", err)
      } finally {
        setAiLoading(false)
      }
    }

    function handleAcceptAI() {
      if (aiSuggestion && onAIAccept) {
        onAIAccept(aiSuggestion.value)
        setAiSuggestion(null)
      }
    }

    const currentValue = props.value ? Number(props.value) : null
    const benchmarkValue = benchmark?.p50 ?? null

    let variance: "above" | "below" | "normal" | null = null
    if (currentValue !== null && benchmarkValue !== null && benchmark) {
      const diff = ((currentValue - benchmarkValue) / benchmarkValue) * 100
      if (Math.abs(diff) < 15) variance = "normal"
      else if (diff > 0) variance = "above"
      else variance = "below"
    }

    return (
      <div className="space-y-1">
        <div className="relative">
          <Input
            ref={ref}
            className={cn(
              variance === "above" && "border-blue-300 focus-visible:ring-blue-500",
              variance === "below" && "border-amber-300 focus-visible:ring-amber-500",
              variance === "normal" && "border-emerald-300 focus-visible:ring-emerald-500",
              assumptionKey && "pr-24",
              className
            )}
            {...props}
          />
          {benchmark && (
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1 text-xs text-muted-foreground">
              {variance === "above" && (
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              )}
              {variance === "below" && (
                <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
              )}
              {variance === "normal" && (
                <Minus className="w-3.5 h-3.5 text-emerald-500" />
              )}
            </div>
          )}
          {assumptionKey && aiContext && !aiSuggestion && (
            <button
              type="button"
              onClick={fetchAISuggestion}
              disabled={aiLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-md transition-colors disabled:opacity-50"
              title="Get AI-suggested value"
            >
              {aiLoading ? (
                <LoaderIcon className="w-3 h-3 animate-spin" />
              ) : (
                <><SparklesIcon className="w-3 h-3" />AI</>
              )}
            </button>
          )}
        </div>

        {aiSuggestion && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <SparklesIcon className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">AI suggestion</span>
                {aiSource === "llm" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">Claude</span>
                )}
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full",
                  aiSuggestion.confidence === "high" && "bg-emerald-100 text-emerald-700",
                  aiSuggestion.confidence === "medium" && "bg-amber-100 text-amber-700",
                  aiSuggestion.confidence === "low" && "bg-gray-100 text-gray-600"
                )}>
                  {aiSuggestion.confidence}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAiSuggestion(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </button>
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              Suggested: {aiSuggestion.value}
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              {aiSuggestion.rationale}
            </p>
            {aiSuggestion.source && (
              <p className="text-[10px] text-muted-foreground italic mb-2">
                Source: {aiSuggestion.source}
              </p>
            )}
            <button
              type="button"
              onClick={handleAcceptAI}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <CheckIcon className="w-3 h-3" />Use this value
            </button>
          </div>
        )}

        {benchmark && showBenchmark && benchmarkValue !== null && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">
              {benchmark.sourceLabel} typical:{" "}
              <span className="font-medium text-foreground">
                {formatValue ? formatValue(benchmarkValue) : benchmarkValue}
              </span>
            </span>
            {variance === "above" && (
              <span className="text-blue-500 font-medium">Above benchmark</span>
            )}
            {variance === "below" && (
              <span className="text-amber-500 font-medium">Below benchmark</span>
            )}
            {variance === "normal" && (
              <span className="text-emerald-500 font-medium">Within typical range</span>
            )}
          </div>
        )}
      </div>
    )
  }
)

BenchmarkInput.displayName = "BenchmarkInput"
