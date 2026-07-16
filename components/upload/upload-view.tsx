"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  UploadIcon, FileTextIcon, FileSpreadsheetIcon,
  XIcon, CheckCircle2Icon, LoaderIcon,
  ArrowRightIcon, AlertCircleIcon, BuildingIcon,
} from "lucide-react"

interface UploadViewProps {
  profile: { id: string; full_name: string | null; currency: string | null } | null
}
type FileStatus = "pending" | "uploading" | "uploaded" | "error"
interface UploadFile {
  file: File; status: FileStatus; error?: string; storagePath?: string; statementType: string
}

const STATEMENT_TYPES = ["Income Statement","Balance Sheet","Cash Flow Statement","Management Accounts","Audited Accounts","Trial Balance","Other"]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function guessType(name: string): string {
  const l = name.toLowerCase()
  if (l.includes("income") || l.includes("p&l") || l.includes("pnl")) return "Income Statement"
  if (l.includes("balance")) return "Balance Sheet"
  if (l.includes("cash")) return "Cash Flow Statement"
  return "Management Accounts"
}

export function UploadView({ profile }: UploadViewProps) {
  const router = useRouter()
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function addFiles(newFiles: File[]) {
    const valid = newFiles.filter((f) =>
      ["application/pdf","application/vnd.ms-excel",
       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","text/csv"]
      .includes(f.type) && f.size <= 20 * 1024 * 1024
    )
    setFiles((prev) => [...prev, ...valid.map((f) => ({ file: f, status: "pending" as FileStatus, statementType: guessType(f.name) }))])
  }

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); addFiles(Array.from(e.dataTransfer.files)) }, [])
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files ?? []))
    e.target.value = ""
  }

  async function handleSubmit() {
    if (!files.length) return
    setIsSubmitting(true)
    setSubmitError(null)
    const supabase = createClient()
    const updated = [...files]

    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: "uploading" }
      setFiles([...updated])
      try {
        const ext = updated[i].file.name.split(".").pop()
        const { data: { user: authUser } } = await supabase.auth.getUser()
        const path = `${authUser?.id ?? "anon"}/${Date.now()}_${i}.${ext}`
        const { error } = await supabase.storage.from("financial-statements").upload(path, updated[i].file)
        if (error) throw new Error(`Storage error: ${error.message} | status: ${JSON.stringify(error)}`)
        updated[i] = { ...updated[i], status: "uploaded", storagePath: path }
      } catch (err) {
        updated[i] = { ...updated[i], status: "error", error: err instanceof Error ? err.message : "Failed" }
      }
      setFiles([...updated])
    }

    const success = updated.filter((f) => f.status === "uploaded")
    if (!success.length) { setSubmitError("No files uploaded"); setIsSubmitting(false); return }

    try {
      const res = await fetch("/api/upload/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: success.map((f) => ({ fileName: f.file.name, fileType: f.file.type, fileSizeBytes: f.file.size, storagePath: f.storagePath, statementType: f.statementType })) }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      await fetch("/api/extract/trigger", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ modelInputId: result.modelInputId }) })
      router.push(`/upload/review/${result.modelInputId}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <BuildingIcon className="w-5 h-5 text-emerald-600" />
            <Badge variant="outline" className="text-emerald-600 border-emerald-300">Existing business</Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Upload your financial statements</h1>
          <p className="text-sm text-muted-foreground">Upload PDF, Excel or CSV files. Our AI extracts the figures for your review before building the model.</p>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-4 mb-6">
          <p className="text-sm font-medium mb-2">Accepted formats: PDF, Excel (.xlsx/.xls), CSV · Max 20MB per file</p>
          <p className="text-xs text-muted-foreground">Upload income statements, balance sheets, cash flow statements or management accounts.</p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn("rounded-2xl border-2 border-dashed p-8 text-center transition-all mb-6", isDragging ? "border-primary bg-primary/5" : "border-border")}
        >
          <UploadIcon className={cn("w-8 h-8 mx-auto mb-3", isDragging ? "text-primary" : "text-muted-foreground")} />
          <p className="text-sm font-medium text-foreground mb-1">{isDragging ? "Drop files here" : "Drag & drop files here"}</p>
          <p className="text-xs text-muted-foreground mb-4">or use the file picker below</p>
        </div>

        <div className="flex justify-center mb-6">
          <input
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls,.csv"
            onChange={handleChange}
            style={{ display: "block", padding: "8px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "14px", cursor: "pointer" }}
          />
        </div>

        {files.length > 0 && (
          <div className="space-y-3 mb-6">
            {files.map((f, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
                {f.file.type === "application/pdf" ? <FileTextIcon className="w-5 h-5 text-red-500 flex-shrink-0" /> : <FileSpreadsheetIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(f.file.size)}</p>
                  <select value={f.statementType} onChange={(e) => setFiles((prev) => prev.map((x, j) => j === i ? { ...x, statementType: e.target.value } : x))}
                    className="mt-2 text-xs rounded-md border border-border bg-background px-2 py-1">
                    {STATEMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  {f.status === "uploading" && <LoaderIcon className="w-4 h-4 text-primary animate-spin" />}
                  {f.status === "uploaded" && <CheckCircle2Icon className="w-4 h-4 text-emerald-500" />}
                  {f.status === "error" && <AlertCircleIcon className="w-4 h-4 text-red-500" />}
                  <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}><XIcon className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {submitError && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">{submitError}</div>}

        {files.length > 0 && (
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setFiles([])} disabled={isSubmitting}>Clear all</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <><LoaderIcon className="w-4 h-4 animate-spin" />Processing...</> : <>Upload & extract data<ArrowRightIcon className="w-4 h-4" /></>}
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
