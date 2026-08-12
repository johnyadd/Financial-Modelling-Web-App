"use client"

import { useState } from "react"
import { InfoIcon } from "lucide-react"
import type { BenchmarkCitation, ConfidenceTier } from "@/lib/benchmarks/citations"
import { CitationDrawer } from "./citation-drawer"

interface CitationBadgeProps {
  citation: BenchmarkCitation
  /** Optional custom label to show instead of the source name (e.g. shortened) */
  label?: string
}

const TIER_DOT_COLORS: Record<ConfidenceTier, string> = {
  high:   "bg-emerald-500",
  medium: "bg-amber-500",
  low:    "bg-red-500",
}

/**
 * "Source" pill shown next to AI-suggested values in the questionnaire.
 * Displays: colored confidence dot + source name (truncated) + info icon.
 * Click opens the CitationDrawer with full citation details.
 */
export function CitationBadge({ citation, label }: CitationBadgeProps) {
  const [open, setOpen] = useState(false)
  const displayText = label ?? citation.source

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label={`View citation for ${citation.source}`}
      >
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${TIER_DOT_COLORS[citation.confidenceTier]}`} />
        <span className="max-w-[180px] truncate">{displayText}</span>
        <InfoIcon className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <CitationDrawer citation={citation} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
