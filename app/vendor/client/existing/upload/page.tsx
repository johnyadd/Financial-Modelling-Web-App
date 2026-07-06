"use client"

import { useRouter } from "next/navigation"
import { useVendorStore } from "@/store/vendor-store"
import { ArrowLeftIcon, UploadIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function VendorExistingUploadPage() {
  const router = useRouter()
  const { clientData } = useVendorStore()

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button
          onClick={() => router.push("/vendor/client/existing")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to client details
        </button>

        {clientData.clientBusinessName && (
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="outline" className="text-orange-600 border-orange-300 dark:text-orange-400">
              Vendor · Existing business client
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
          <h1 className="text-2xl font-bold mb-1">Upload client statements</h1>
          <p className="text-muted-foreground text-sm">
            Upload your client's financial statements. Our AI will extract the
            key financials for your review before building the model.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-8 text-center">
          <UploadIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">
            Statement upload and AI extraction
          </p>
          <p className="text-sm text-muted-foreground">
            The upload flow with AI parsing and expert review
            is coming in the next build step.
          </p>
        </div>
      </div>
    </main>
  )
}
