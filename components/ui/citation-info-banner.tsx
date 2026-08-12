"use client"

import { useEffect, useState } from "react"
import { BookOpenIcon, XIcon } from "lucide-react"

const DISMISS_KEY = "citation-banner-dismissed"

export function CitationInfoBanner() {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem(DISMISS_KEY) === "true"
      setDismissed(isDismissed)
    } catch {
      setDismissed(false)
    }
  }, [])

  function handleDismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, "true")
    } catch {
      // Non-fatal
    }
  }

  if (dismissed) return null

  return (
    <div className="rounded-md border border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/10 px-4 py-2.5 mb-4">
      <div className="flex items-center gap-3">
        <BookOpenIcon className="w-4 h-4 text-blue-700 dark:text-blue-400 flex-shrink-0" />
        <div className="flex-1 text-sm">
          <span className="font-medium text-blue-900 dark:text-blue-200">
            AI suggestions cite public sources with confidence tiers.
          </span>{" "}
          <span className="text-blue-700 dark:text-blue-400">
            Click any suggestion for source detail.
          </span>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded p-1 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors flex-shrink-0"
          aria-label="Dismiss banner"
        >
          <XIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}