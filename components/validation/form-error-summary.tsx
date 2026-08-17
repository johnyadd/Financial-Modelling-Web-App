"use client"

import { AlertTriangleIcon } from "lucide-react"
import type { FieldErrors } from "react-hook-form"

/**
 * Lists why a Next button did nothing.
 *
 * react-hook-form silently refuses to submit when validation fails, and on a long
 * step the offending field is often above the fold — so the button reads as broken.
 * formState.errors populates after a failed submit attempt, so this needs no
 * onInvalid callback; it just renders what is already there.
 */
export function FormErrorSummary({ errors }: { errors: FieldErrors }) {
  const entries = Object.entries(errors).filter(([, e]) => (e as { message?: string })?.message)
  if (entries.length === 0) return null

  return (
    <div className="rounded-lg border border-red-500/30 bg-red-50 dark:bg-red-950/20 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          {entries.length === 1
            ? "One field needs attention before you can continue"
            : `${entries.length} fields need attention before you can continue`}
        </p>
      </div>
      <ul className="text-xs text-red-600 dark:text-red-300 space-y-1 list-disc list-inside">
        {entries.map(([name, e]) => (
          <li key={name}>{String((e as { message?: string })?.message ?? name)}</li>
        ))}
      </ul>
    </div>
  )
}
