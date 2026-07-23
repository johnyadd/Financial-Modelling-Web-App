"use client"

import { useState } from "react"
import { SparklesIcon, LoaderIcon, CheckIcon, InfoIcon } from "lucide-react"
import type { AISuggestionContext, AISuggestionResult } from "@/lib/schemas/assumptions"

interface AISuggestButtonProps {
  assumptionKey: string
  context: AISuggestionContext
  currentValue?: number | string
  onAccept: (value: number | string) => void
  compact?: boolean
}

export function AISuggestButton({
  assumptionKey,
  context,
  currentValue,
  onAccept,
  compact = false,
}: AISuggestButtonProps) {
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<AISuggestionResult | null>(null)
  const [source, setSource] = useState<string>("")
  const [showRationale, setShowRationale] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchSuggestion() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ assumptionKey, context }),
      })
      const data = await res.json()
      if (data.suggestion) {
        setSuggestion(data.suggestion)
        setSource(data.source ?? "")
      } else {
        setError(data.error ?? "No suggestion available")
      }
    } catch (err) {
      setError("Failed to fetch suggestion")
    } finally {
      setLoading(false)
    }
  }

  function handleAccept() {
    if (suggestion) {
      onAccept(suggestion.value)
      setSuggestion(null)
    }
  }

  // Compact mode: just a button next to the input
  if (compact && !suggestion) {
    return (
      <button
        type="button"
        onClick={fetchSuggestion}
        disabled={loading}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-md transition-colors disabled:opacity-50"
      >
        {loading ? (
          <><LoaderIcon className="w-3 h-3 animate-spin" />Thinking...</>
        ) : (
          <><SparklesIcon className="w-3 h-3" />AI suggest</>
        )}
      </button>
    )
  }

  // Full mode with suggestion result
  if (suggestion) {
    return (
      <div className="mt-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <SparklesIcon className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">AI suggestion</span>
            {source === "llm" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">Claude</span>
            )}
            <span className={"text-[10px] px-1.5 py-0.5 rounded-full " + (
              suggestion.confidence === "high" ? "bg-emerald-100 text-emerald-700" :
              suggestion.confidence === "medium" ? "bg-amber-100 text-amber-700" :
              "bg-gray-100 text-gray-600"
            )}>
              {suggestion.confidence}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSuggestion(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>

        <p className="text-sm font-semibold text-foreground mb-1">
          Suggested value: {suggestion.value}
        </p>

        <p className="text-xs text-muted-foreground mb-2">
          {suggestion.rationale}
        </p>

        {suggestion.source && (
          <p className="text-[10px] text-muted-foreground italic mb-3">
            Source: {suggestion.source}
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAccept}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <CheckIcon className="w-3 h-3" />Use this value
          </button>
          <button
            type="button"
            onClick={() => setSuggestion(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Keep my value
          </button>
        </div>
      </div>
    )
  }

  // Default state: full button
  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={fetchSuggestion}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-md transition-colors disabled:opacity-50"
      >
        {loading ? (
          <><LoaderIcon className="w-3 h-3 animate-spin" />Getting suggestion...</>
        ) : (
          <><SparklesIcon className="w-3 h-3" />AI suggest a value</>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}
