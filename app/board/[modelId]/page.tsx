"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BoardPackView } from "@/components/memo/board-pack-view"
import type { BoardPack } from "@/lib/memo/types"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, LoaderIcon, AlertTriangleIcon, RefreshCwIcon } from "lucide-react"

interface BoardPageProps {
  params: Promise<{ modelId: string }>
}

export default function BoardPage({ params }: BoardPageProps) {
  const router = useRouter()
  const { modelId } = use(params)

  const [pack, setPack] = useState<BoardPack | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState<string | undefined>()

  async function loadPack(force = false) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/memo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ modelId, audience: "board", force }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError((data.error ?? "Failed to generate board pack") + (data.detail ? " " + data.detail : ""))
        return
      }
      if (data.memo) {
        setPack(data.memo as BoardPack)
        const bn = (data as { businessName?: string | null }).businessName
        if (bn) setBusinessName(bn)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPack()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <LoaderIcon className="w-10 h-10 animate-spin text-primary mx-auto" />
          <div className="space-y-1">
            <p className="text-lg font-medium">Preparing board pack...</p>
            <p className="text-sm text-muted-foreground">
              Reading the model, comparing to plan, drafting the sections. Takes 30-60 seconds.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Link href={"/models/" + modelId} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon className="w-4 h-4" />Back to model
        </Link>
        <div className="rounded-lg border border-red-500/30 bg-red-50 dark:bg-red-950/20 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">Failed to prepare board pack</h2>
          </div>
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          <Button size="sm" onClick={() => loadPack(true)} className="gap-2">
            <RefreshCwIcon className="w-4 h-4" />Try again
          </Button>
        </div>
      </div>
    )
  }

  if (!pack) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 pt-6">
        <Link href={"/models/" + modelId} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon className="w-4 h-4" />Back to model
        </Link>
      </div>
      <BoardPackView
        pack={pack}
        businessName={businessName}
        actions={
          <Button size="sm" variant="outline" onClick={() => loadPack(true)} className="gap-2">
            <RefreshCwIcon className="w-4 h-4" />Regenerate
          </Button>
        }
      />
    </div>
  )
}
