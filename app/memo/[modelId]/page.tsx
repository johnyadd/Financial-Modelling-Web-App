"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MemoViewer } from "@/components/memo/memo-viewer"
import { memoToMarkdown } from "@/lib/memo/markdown"
import type { InvestorMemo } from "@/lib/memo/types"
import {
  ArrowLeftIcon,
  LoaderIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  CopyIcon,
  DownloadIcon,
  CheckIcon,
} from "lucide-react"
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

const MEMO_ELEMENT_ID = "memo-content"

export default function MemoPage({ params }: MemoPageProps) {
  const router = useRouter()
  const { modelId } = use(params)

  const [memo, setMemo] = useState<InvestorMemo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState<string | undefined>()
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle")
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

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

  // -- Action: Copy memo as markdown to clipboard --
  async function handleCopyMarkdown() {
    if (!memo) return
    try {
      const md = memoToMarkdown(memo, businessName)
      await navigator.clipboard.writeText(md)
      setCopyStatus("copied")
      setTimeout(() => setCopyStatus("idle"), 2000)
    } catch (err) {
      console.error("Copy failed:", err)
      setCopyStatus("failed")
      setTimeout(() => setCopyStatus("idle"), 2000)
    }
  }

  // -- Action: Download memo as PDF via html2canvas + jsPDF --
  async function handleDownloadPdf() {
    setPdfLoading(true)
    setPdfError(null)
    try {
      // Dynamic imports to avoid SSR issues with browser-only libs
      const [jsPDFModule, html2canvasModule] = await Promise.all([
        import("jspdf"),
        import("html2canvas-pro"),
      ])
      const jsPDF = jsPDFModule.jsPDF ?? (jsPDFModule as unknown as { default: typeof jsPDFModule.jsPDF }).default
      const html2canvas = html2canvasModule.default

      const element = document.getElementById(MEMO_ELEMENT_ID)
      if (!element) {
        throw new Error("Memo element not found in DOM")
      }

      // Screenshot the memo article
      const canvas = await html2canvas(element, {
        scale: 2, // 2x for retina-quality output
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      })

      const imgData = canvas.toDataURL("image/png")

      // A4 dimensions in mm
      const pdfWidth = 210
      const pdfHeight = 297
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Handle multi-page: slice the canvas across pages
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }

      const filename = `investor-memo-${modelId.substring(0, 8)}.pdf`
      pdf.save(filename)
    } catch (err) {
      console.error("PDF export failed:", err)
      setPdfError(err instanceof Error ? err.message : "PDF export failed")
      setTimeout(() => setPdfError(null), 4000)
    } finally {
      setPdfLoading(false)
    }
  }

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

        {/* PDF error toast */}
        {pdfError && (
          <div className="mt-4 rounded-md border border-red-500/30 bg-red-50 dark:bg-red-950/20 p-3 text-xs text-red-700 dark:text-red-300">
            PDF export failed: {pdfError}
          </div>
        )}
      </div>

      <MemoViewer
        memo={memo}
        businessName={businessName}
        id={MEMO_ELEMENT_ID}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyMarkdown}
              disabled={copyStatus === "copied"}
              className="gap-2"
            >
              {copyStatus === "copied" ? (
                <><CheckIcon className="w-4 h-4 text-emerald-600" />Copied</>
              ) : copyStatus === "failed" ? (
                <><CopyIcon className="w-4 h-4" />Copy failed</>
              ) : (
                <><CopyIcon className="w-4 h-4" />Copy</>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="gap-2"
            >
              {pdfLoading ? (
                <><LoaderIcon className="w-4 h-4 animate-spin" />Preparing...</>
              ) : (
                <><DownloadIcon className="w-4 h-4" />PDF</>
              )}
            </Button>
            <Button size="sm" variant="outline" onClick={loadMemo} className="gap-2">
              <RefreshCwIcon className="w-4 h-4" />
              Regenerate
            </Button>
          </div>
        }
      />
    </div>
  )
}
