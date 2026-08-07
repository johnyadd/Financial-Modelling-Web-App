"use client"

// Memo Generator v1 - Dev-only test page for /api/memo/generate
// Route: /memo-test
// Purpose: fast iteration on the LLM prompt without needing a styled UI.
// Once the prompt output is solid, we build the real memo viewer.

import { useState } from "react"

interface GenerateResponse {
  memo?: unknown
  audience?: string
  generatedAt?: string
  error?: string
  detail?: string
  rawText?: string
}

export default function MemoTestPage() {
  const [modelId, setModelId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [elapsedMs, setElapsedMs] = useState<number | null>(null)
  const [responseSize, setResponseSize] = useState<number | null>(null)
  const [copyStatus, setCopyStatus] = useState<string>("")

  async function handleGenerate() {
    if (!modelId.trim()) {
      setError("Enter a modelId")
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    setElapsedMs(null)
    setResponseSize(null)
    setCopyStatus("")

    const start = Date.now()
    try {
      const res = await fetch("/api/memo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ modelId: modelId.trim(), audience: "investor" }),
      })

      const data: GenerateResponse = await res.json()
      setElapsedMs(Date.now() - start)
      setResponseSize(JSON.stringify(data).length)
      setResult(data)

      if (!res.ok) {
        const errMsg = `${res.status}: ${data.error ?? "Unknown error"}`
        const details = data.detail ? ` — ${data.detail}` : ""
        setError(errMsg + details)
      }
    } catch (err) {
      setElapsedMs(Date.now() - start)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleCopyJson() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2))
      setCopyStatus("Copied ✓")
      setTimeout(() => setCopyStatus(""), 2000)
    } catch {
      setCopyStatus("Copy failed")
    }
  }

  const plain = "w-full px-3 py-2 rounded-md border border-border bg-background text-sm"

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Memo Generator — Test Page</h1>
        <p className="text-sm text-muted-foreground">
          Dev-only. Paste a model ID from your Supabase <code className="text-xs px-1 py-0.5 rounded bg-muted">model_inputs</code> table, hit generate, review the raw memo JSON. Iterate on the prompt in <code className="text-xs px-1 py-0.5 rounded bg-muted">lib/memo/prompts/investor.ts</code>.
        </p>
      </div>

      <details className="rounded-md border border-border bg-muted/30 p-3">
        <summary className="text-sm font-medium cursor-pointer">
          How to find a modelId
        </summary>
        <div className="mt-2 text-xs text-muted-foreground space-y-1">
          <p>1. Log into Supabase Studio for your project (project id: <code>uqgeyffiqbnnxgzzxhwo</code>)</p>
          <p>2. Open the <code>model_inputs</code> table</p>
          <p>3. Copy the <code>id</code> value from any row you own (a UUID like <code>550e8400-e29b-41d4-a716-446655440000</code>)</p>
          <p>4. That row must also have a corresponding <code>model_outputs</code> row (i.e. the model was actually computed, not just started)</p>
        </div>
      </details>

      <div className="space-y-3">
        <label htmlFor="modelId" className="block text-sm font-medium">
          Model ID
        </label>
        <input
          id="modelId"
          type="text"
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
          placeholder="UUID from model_inputs.id"
          className={plain + " font-mono"}
          disabled={loading}
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !modelId.trim()}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {loading ? "Generating memo (Claude call, ~10-30s)..." : "Generate memo"}
          </button>
          {result && (
            <button
              type="button"
              onClick={handleCopyJson}
              className="px-3 py-2 rounded-md border border-border text-sm hover:bg-muted transition-colors"
            >
              {copyStatus || "Copy JSON"}
            </button>
          )}
        </div>
      </div>

      {(elapsedMs !== null || responseSize !== null) && (
        <div className="flex gap-4 text-xs text-muted-foreground border-t border-border pt-3">
          {elapsedMs !== null && (
            <span>Elapsed: <strong className="text-foreground">{(elapsedMs / 1000).toFixed(2)}s</strong></span>
          )}
          {responseSize !== null && (
            <span>Response size: <strong className="text-foreground">{responseSize.toLocaleString()} chars</strong></span>
          )}
          {result?.memo != null && (
            <span className="text-emerald-600">✓ Memo parsed successfully</span>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-50 dark:bg-red-950/20 p-4">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Error</p>
          <p className="text-xs text-red-600 dark:text-red-300 font-mono break-all">{error}</p>
          {result?.rawText && (
            <details className="mt-3">
              <summary className="text-xs font-medium cursor-pointer text-red-700 dark:text-red-400">
                Raw LLM output (for prompt debugging)
              </summary>
              <pre className="mt-2 p-3 rounded bg-red-100 dark:bg-red-950/40 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto">
                {result.rawText}
              </pre>
            </details>
          )}
        </div>
      )}

      {result && !error && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Response</h2>
          <pre className="p-4 rounded-md border border-border bg-muted/30 text-xs font-mono overflow-x-auto max-h-[70vh] overflow-y-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
