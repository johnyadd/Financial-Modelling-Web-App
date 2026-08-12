"use client"

import { useEffect } from "react"
import { XIcon, ExternalLinkIcon } from "lucide-react"
import type { BenchmarkCitation, ConfidenceTier } from "@/lib/benchmarks/citations"

interface CitationDrawerProps {
  citation: BenchmarkCitation
  onClose: () => void
}

const TIER_LABEL: Record<ConfidenceTier, string> = {
  high:   "High confidence",
  medium: "Medium confidence",
  low:    "Low confidence",
}

const TIER_STYLES: Record<ConfidenceTier, string> = {
  high:   "bg-emerald-50 border-emerald-500/30 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400",
  medium: "bg-amber-50 border-amber-500/30 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
  low:    "bg-red-50 border-red-500/30 text-red-700 dark:bg-red-950/20 dark:text-red-400",
}

/**
 * Modal drawer showing full citation details for a benchmark source.
 * Opened from a CitationBadge click. Closes on backdrop click, X button, or Escape key.
 * Pure Tailwind — no shadcn dialog primitive required.
 */
export function CitationDrawer({ citation, onClose }: CitationDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Citation for ${citation.source}`}
    >
      <div
        className="w-full max-w-lg rounded-lg border border-border bg-background shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div className="space-y-1 pr-4">
            <h3 className="text-base font-semibold leading-tight">{citation.source}</h3>
            <p className="text-xs text-muted-foreground">
              Vintage {citation.vintage} · {citation.geography}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close citation"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Confidence tier */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Confidence
            </p>
            <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${TIER_STYLES[citation.confidenceTier]}`}>
              {TIER_LABEL[citation.confidenceTier]}
            </span>
          </div>

          {/* Methodology */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Methodology
            </p>
            <p className="text-sm leading-relaxed">{citation.methodology}</p>
          </div>

          {/* Sample size (optional) */}
          {citation.sampleSize && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                Sample
              </p>
              <p className="text-sm leading-relaxed">{citation.sampleSize}</p>
            </div>
          )}

          {/* UK adjustment reasoning (for analogical citations) */}
          {citation.reasoning && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                UK adjustment reasoning
              </p>
              <p className="text-sm leading-relaxed italic text-muted-foreground">
                {citation.reasoning}
              </p>
            </div>
          )}
        </div>

        {/* Footer with external link */}
        {citation.url && (
          <div className="p-5 border-t border-border">
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              View source
              <ExternalLinkIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
