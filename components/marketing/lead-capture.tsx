"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoaderIcon, ArrowRightIcon, CheckIcon } from "lucide-react"

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

interface LeadCaptureProps {
  /** Where this capture sits, stored on the row for attribution. */
  source?: string
}

/**
 * Low-commitment ask for people who have just read the demo memo and are
 * interested but not ready to create an account. Delivers the benchmark
 * reference immediately on submit - no sending infrastructure needed, so
 * deliverability and domain authentication stay off the critical path.
 */
export function LeadCapture({ source = "demo" }: LeadCaptureProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (!EMAIL.test(email)) {
      setError("Enter a valid email address.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: insertError } = await supabase
        .from("leads")
        .insert({ email: email.trim().toLowerCase(), source })
      // A duplicate is not a failure from the visitor point of view -
      // they asked for the document, so give them the document.
      if (insertError && !insertError.message.includes("duplicate")) {
        throw new Error(insertError.message)
      }
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-6">
        <p className="text-sm flex items-center gap-2">
          <CheckIcon className="w-4 h-4 text-emerald-600" />
          Noted. You will hear from me when a benchmark changes.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-base font-semibold">
          Tell me when these change
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Beauhurst publishes annually. ONS revises. When a range here moves, or
          an adjustment changes, I will tell you what changed and why.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
          placeholder="you@firm.co.uk"
          className="sm:max-w-xs"
          aria-label="Email address"
        />
        <Button onClick={handleSubmit} disabled={saving} className="gap-2">
          {saving ? (
            <><LoaderIcon className="w-4 h-4 animate-spin" />Opening...</>
          ) : (
            <>Notify me<ArrowRightIcon className="w-4 h-4" /></>
          )}
        </Button>
      </div>

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <CheckIcon className="w-3.5 h-3.5" />
        No account needed. Unsubscribe any time.
      </p>
    </div>
  )
}
