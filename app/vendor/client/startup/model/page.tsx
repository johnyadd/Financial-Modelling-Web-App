"use client"

import { useRouter } from "next/navigation"
import { useVendorStore } from "@/store/vendor-store"
import { ArrowLeftIcon, LayoutTemplateIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function VendorStartupModelPage() {
  const router = useRouter()
  const { clientData } = useVendorStore()

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button
          onClick={() => router.push("/vendor/client/startup")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to client details
        </button>

        {clientData.clientBusinessName && (
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="outline" className="text-orange-600 border-orange-300 dark:text-orange-400">
              Vendor · Startup client
            </Badge>
            <span className="text-sm font-medium text-foreground">
              {clientData.clientBusinessName}
            </span>
            {clientData.industry && (
              <span className="text-xs text-muted-foreground">
                · {clientData.industry} · {clientData.subSector}
              </span>
            )}
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Select model template</h1>
          <p className="text-muted-foreground text-sm">
            As an expert, choose the model that best fits your client's situation.
            You will have full control over all assumptions.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-8 text-center">
          <LayoutTemplateIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">
            Template-first model selection
          </p>
          <p className="text-sm text-muted-foreground">
            The full template-first questionnaire with expert-level assumption inputs
            is coming in the next build step.
          </p>
        </div>
      </div>
    </main>
  )
}
