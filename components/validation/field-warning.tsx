"use client"

import { AlertTriangleIcon, InfoIcon, AlertCircleIcon } from "lucide-react"
import type { FieldWarning as Warning } from "@/lib/validation/types"

interface FieldWarningProps {
  warning: Warning | null | undefined
}

/**
 * Renders a field-level validation warning below an input.
 * Returns null when no warning to render (component is safe to always mount).
 *
 * Severity styling:
 * - error   → red     (definite input error, e.g., negative percentage)
 * - warning → amber   (probable input error, e.g., below-minimum-wage salary)
 * - info    → blue    (edge but not wrong, e.g., aggressive but plausible ratio)
 */
export function FieldWarning({ warning }: FieldWarningProps) {
  if (!warning) return null

  const { severity, message, suggestion } = warning

  const Icon =
    severity === "error"
      ? AlertCircleIcon
      : severity === "warning"
        ? AlertTriangleIcon
        : InfoIcon

  const cls =
    severity === "error"
      ? "text-red-700 dark:text-red-400"
      : severity === "warning"
        ? "text-amber-700 dark:text-amber-400"
        : "text-blue-700 dark:text-blue-400"

  return (
    <div className={"flex items-start gap-1.5 text-xs mt-1.5 " + cls}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
      <div className="space-y-0.5 leading-relaxed">
        <p>{message}</p>
        {suggestion && <p className="italic opacity-80">{suggestion}</p>}
      </div>
    </div>
  )
}
