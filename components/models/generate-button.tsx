"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LoaderIcon, SparklesIcon, RefreshCwIcon } from "lucide-react"

interface GenerateButtonProps {
  modelInputId: string
  status: string
}

export function GenerateButton({ modelInputId, status }: GenerateButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isComplete = status === "complete"

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/engine/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelInputId }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error ?? "Engine calculation failed")
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleGenerate}
        disabled={loading}
        size="sm"
        variant={isComplete ? "outline" : "default"}
        className="gap-2"
      >
        {loading ? (
          <><LoaderIcon className="w-4 h-4 animate-spin" />Calculating...</>
        ) : isComplete ? (
          <><RefreshCwIcon className="w-4 h-4" />Regenerate model</>
        ) : (
          <><SparklesIcon className="w-4 h-4" />Generate financial model</>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
