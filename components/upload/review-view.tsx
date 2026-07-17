"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  CheckCircle2Icon,
  ClockIcon,
  AlertCircleIcon,
  LoaderIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  RefreshCwIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  PencilIcon,
  SparklesIcon,
} from "lucide-react"

interface Statement {
  id: string
  file_name: string
  file_type: string
  statement_type: string
  parse_status: string
  extracted_data: Record<string, unknown> | null
  extraction_notes: string | null
}

interface ReviewViewProps {
  modelInput: Record<string, unknown>
  statements: Statement[]
}

interface EditableField {
  label: string
  key: string
  value: string
  section: string
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending:    { label: "Pending",    cls: "text-muted-foreground border-border",          icon: <ClockIcon className="w-3 h-3" /> },
    processing: { label: "Extracting", cls: "text-blue-600 border-blue-300",                icon: <LoaderIcon className="w-3 h-3 animate-spin" /> },
    complete:   { label: "Extracted",  cls: "text-emerald-600 border-emerald-300",          icon: <CheckCircle2Icon className="w-3 h-3" /> },
    failed:     { label: "Failed",     cls: "text-red-600 border-red-300",                  icon: <AlertCircleIcon className="w-3 h-3" /> },
    needs_review: { label: "Review",   cls: "text-amber-600 border-amber-300",              icon: <PencilIcon className="w-3 h-3" /> },
  }
  const c = config[status as keyof typeof config] ?? config.pending
  return (
    <Badge variant="outline" className={cn("text-xs gap-1", c.cls)}>
      {c.icon}{c.label}
    </Badge>
  )
}

function ExtractedDataCard({ statement }: { statement: Statement }) {
  const data = statement.extracted_data as Record<string, Record<string, unknown[]>> | null
  if (!data) return null

  const is = data.income_statement ?? {}
  const years = ((data.years as unknown) as string[]) ?? []

  const metrics = [
    { label: "Revenue",     values: is.revenue },
    { label: "Gross profit", values: is.gross_profit },
    { label: "EBITDA",      values: is.ebitda },
    { label: "Net profit",  values: is.net_profit },
  ].filter((m) => m.values?.length)

  if (metrics.length === 0) return (
    <p className="text-xs text-muted-foreground italic">No income statement data extracted</p>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-1.5 text-muted-foreground font-medium">Metric</th>
            {years.map((y) => (
              <th key={y} className="text-right py-1.5 px-2 text-muted-foreground font-medium">{y}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map(({ label, values }) => (
            <tr key={label} className="border-b border-border/40">
              <td className="py-1.5 text-foreground font-medium">{label}</td>
              {(values as unknown[]).map((v, i) => (
                <td key={i} className={cn("text-right py-1.5 px-2 tabular-nums", Number(v) < 0 ? "text-red-600" : "text-foreground")}>
                  {v != null ? Number(v).toLocaleString() : "â€”"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.notes && (
        <p className="text-xs text-muted-foreground mt-2 italic">{String(data.notes)}</p>
      )}
    </div>
  )
}

export function ReviewView({ modelInput, statements }: ReviewViewProps) {
  const router = useRouter()
  const [isPolling, setIsPolling] = useState(false)
  const [currentStatements, setCurrentStatements] = useState(statements)
  const [isApproving, setIsApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const modelInputId = modelInput.id as string
  const s1 = (modelInput.step1_business ?? {}) as Record<string, string>

  const allComplete = currentStatements.every(
    (s) => s.parse_status === "complete" || s.parse_status === "failed"
  )
  const hasComplete = currentStatements.some((s) => s.parse_status === "complete")
  const isProcessing = currentStatements.some((s) => s.parse_status === "processing" || s.parse_status === "pending")

  // Poll for extraction status while processing
  useEffect(() => {
    if (!isProcessing || isPolling) return

    const poll = async () => {
      setIsPolling(true)
      try {
        const res = await fetch(`/api/upload/status?modelInputId=${modelInputId}`)
        const data = await res.json()
        if (data.statements) {
          setCurrentStatements(data.statements)
        }
      } catch {
        // silently continue polling
      } finally {
        setIsPolling(false)
      }
    }

    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [isProcessing, modelInputId, isPolling])

  async function handleApprove() {
    setIsApproving(true)
    setError(null)

    try {
      // Mark statements as approved
      const res = await fetch("/api/upload/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelInputId }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? "Approval failed")

      // Redirect to the model detail page for further editing before generation
      router.push(`/upload/model/${modelInputId}`)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsApproving(false)
    }
  }

  async function handleRetryExtraction() {
    await fetch("/api/extract/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelInputId }),
    })
    // Reset failed statements to pending
    setCurrentStatements((prev) =>
      prev.map((s) => s.parse_status === "failed" ? { ...s, parse_status: "pending" } : s)
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <button
          onClick={() => router.push("/upload")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />Back to upload
        </button>

        {/* header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Review extracted data
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Our AI has extracted financial figures from your uploaded documents.
            Review the data below, correct any errors, then approve to continue.
          </p>
        </div>

        {/* extraction status banner */}
        {isProcessing && (
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 px-4 py-3 mb-6 flex items-center gap-3">
            <LoaderIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Extracting financial data...
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Our AI is reading your documents. This takes 15â€“30 seconds per file.
              </p>
            </div>
          </div>
        )}

        {allComplete && hasComplete && (
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 px-4 py-3 mb-6 flex items-center gap-3">
            <CheckCircle2Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Extraction complete â€” review the figures below and approve to continue
            </p>
          </div>
        )}

        {/* file cards */}
        <div className="space-y-4 mb-8">
          {currentStatements.map((statement) => (
            <div key={statement.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  {statement.file_type === "application/pdf"
                    ? <FileTextIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    : <FileSpreadsheetIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className="font-medium text-sm text-foreground">{statement.file_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {statement.statement_type.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                <StatusBadge status={statement.parse_status} />
              </div>

              {statement.parse_status === "complete" && statement.extracted_data && (
                <ExtractedDataCard statement={statement} />
              )}

              {statement.parse_status === "failed" && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-red-700 dark:text-red-300">
                  Extraction failed: {statement.extraction_notes ?? "Unknown error"}
                </div>
              )}

              {(statement.parse_status === "pending" || statement.parse_status === "processing") && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <LoaderIcon className="w-3 h-3 animate-spin" />
                  {statement.parse_status === "processing" ? "Extracting data..." : "Waiting to process..."}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* extracted summary */}
        {hasComplete && s1.businessName && (
          <>
            <Separator className="mb-6" />
            <div className="rounded-xl border border-border bg-card p-5 mb-6">
              <p className="text-sm font-semibold text-foreground mb-3">
                Auto-detected business details
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {s1.businessName && (
                  <div>
                    <p className="text-xs text-muted-foreground">Business name</p>
                    <p className="font-medium">{s1.businessName}</p>
                  </div>
                )}
                {s1.currency && (
                  <div>
                    <p className="text-xs text-muted-foreground">Currency</p>
                    <p className="font-medium">{s1.currency}</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                You can edit all extracted figures and business details on the next screen.
              </p>
            </div>
          </>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300 mb-4">
            {error}
          </div>
        )}

        {/* actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {currentStatements.some((s) => s.parse_status === "failed") && (
              <Button variant="outline" size="sm" className="gap-2" onClick={handleRetryExtraction}>
                <RefreshCwIcon className="w-4 h-4" />Retry failed
              </Button>
            )}
          </div>

          <Button
            onClick={handleApprove}
            disabled={!hasComplete || isProcessing || isApproving}
            className="gap-2"
          >
            {isApproving ? (
              <><LoaderIcon className="w-4 h-4 animate-spin" />Approving...</>
            ) : (
              <>Approve & continue<ArrowRightIcon className="w-4 h-4" /></>
            )}
          </Button>
        </div>

      </div>
    </main>
  )
}

