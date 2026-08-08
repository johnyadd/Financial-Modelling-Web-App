"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MemoViewer } from "@/components/memo/memo-viewer"
import type { InvestorMemo } from "@/lib/memo/types"
import { ArrowLeftIcon, LoaderIcon, AlertTriangleIcon, RefreshCwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GenerateResponse {
  memo?: InvestorMemo
  audience?: string
  error?: string
  detail?: string
  rawText?: string
}

interface MemoPageProps {
  params: Promise<{ modelId: string }>
}

export default function MemoPage({ params }: MemoPageProps) {
  const router = useRouter()
  const { modelId } = use(params)

  const [memo, setMemo] = useState<InvestorMemo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState<string | undefined>()

  async function loadMemo() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/memo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ modelId, audience: "investor" }),
      })
      const data: GenerateResponse = await res.json()

      if (!res.ok) {
        const errMsg = data.error ?? "Failed to generate memo"
        const details = data.detail ? ` — ${data.detail}` : ""
        setError(errMsg + details)
        return
      }

      if (data.memo) {
        setMemo(data.memo)
        // Extract business name from snapshot if available
        // (memo doesn't have direct businessName, snapshot has sector info)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMemo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <LoaderIcon className="w-10 h-10 animate-spin text-primary mx-auto" />
          <div className="space-y-1">
            <p className="text-lg font-medium">Generating investor memo...</p>
            <p className="text-sm text-muted-foreground">
              Analyzing model, comparing to UK benchmarks, drafting sections. Takes 10-30 seconds.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Link href={`/models/${modelId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to model
        </Link>

        <div className="rounded-lg border border-red-500/30 bg-red-50 dark:bg-red-950/20 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
              Failed to generate memo
            </h2>
          </div>
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={loadMemo} className="gap-2">
              <RefreshCwIcon className="w-4 h-4" />
              Try again
            </Button>
            <Button size="sm" variant="outline" onClick={() => router.push(`/models/${modelId}`)}>
              Back to model
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (!memo) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 pt-6">
        <Link
          href={`/models/${modelId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to model
        </Link>
      </div>

      <MemoViewer
        memo={memo}
        businessName={businessName}
        actions={
          <Button size="sm" variant="outline" onClick={loadMemo} className="gap-2">
            <RefreshCwIcon className="w-4 h-4" />
            Regenerate
          </Button>
        }
      />
    </div>
  )
}
