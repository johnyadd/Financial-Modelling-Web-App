"use client"

import { AlertTriangleIcon, InfoIcon, AlertCircleIcon, CheckCircle2Icon } from "lucide-react"
import type { FieldWarning } from "@/lib/validation/types"

interface CrossFieldPanelProps {
  warnings: Record<string, FieldWarning | null>
}

/**
 * Renders cross-field validation warnings on Step 5 review page.
 * Aggregates all Layer 2 checks and displays each firing warning as a card.
 * Shows "no issues detected" if all checks return null.
 * Advisory only — never blocks submit.
 */
export function CrossFieldPanel({ warnings }: CrossFieldPanelProps) {
  const firingWarnings = Object.entries(warnings).filter(([, w]) => w !== null)

  if (firingWarnings.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/10 p-4">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2Icon className="w-4 h-4" />
          <p className="text-sm font-medium">No cross-field issues detected</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Your inputs are internally consistent. Ready to generate the model.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/10 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangleIcon className="w-4 h-4 text-amber-700 dark:text-amber-400" />
        <p className="text-sm font-semibold text-foreground">
          {firingWarnings.length} item{firingWarnings.length === 1 ? "" : "s"} to review before submitting
        </p>
      </div>

      <p className="text-xs text-muted-foreground -mt-1">
        Cross-field consistency checks — advisory only, these don&apos;t block submission.
      </p>

      <div className="space-y-2">
        {firingWarnings.map(([key, warning]) => warning && (
          <WarningCard key={key} warning={warning} />
        ))}
      </div>
    </div>
  )
}

function WarningCard({ warning }: { warning: FieldWarning }) {
  const { severity, message, suggestion } = warning

  const Icon =
    severity === "error"
      ? AlertCircleIcon
      : severity === "warning"
        ? AlertTriangleIcon
        : InfoIcon

  const cls =
    severity === "error"
      ? "border-red-500/30 bg-red-50/60 dark:bg-red-950/10 text-red-700 dark:text-red-400"
      : severity === "warning"
        ? "border-amber-500/30 bg-white dark:bg-background text-amber-700 dark:text-amber-400"
        : "border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/10 text-blue-700 dark:text-blue-400"

  return (
    <div className={"rounded-md border p-3 " + cls}>
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <p className="text-sm font-medium">{message}</p>
          {suggestion && (
            <p className="text-xs opacity-80 italic">{suggestion}</p>
          )}
        </div>
      </div>
    </div>
  )
}
