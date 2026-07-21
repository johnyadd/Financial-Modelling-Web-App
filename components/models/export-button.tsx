"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DownloadIcon, LockIcon, XIcon, LoaderIcon, StarIcon, BriefcaseIcon,
  CheckIcon, SparklesIcon,
} from "lucide-react"

interface ExportButtonProps {
  modelId: string
  canExport: boolean
  currentTier: string
}

export function ExportButton({ modelId, canExport, currentTier }: ExportButtonProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null)

  function handleExportClick() {
    if (canExport) {
      window.open(`/api/models/export/${modelId}`, "_blank")
    } else {
      setShowModal(true)
    }
  }

  async function handleUpgrade(tier: string) {
    setUpgradingTier(tier)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tier }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || "Failed to start checkout")
        setUpgradingTier(null)
      }
    } catch (err) {
      alert("Something went wrong. Please try again.")
      setUpgradingTier(null)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleExportClick}
      >
        {canExport ? (
          <><DownloadIcon className="w-4 h-4" />Export Excel</>
        ) : (
          <><LockIcon className="w-4 h-4" />Export Excel</>
        )}
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div
            className="bg-card rounded-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <LockIcon className="w-4 h-4 text-amber-500" />
                  <Badge variant="outline" className="text-amber-600 border-amber-300">Upgrade required</Badge>
                </div>
                <h2 className="text-xl font-bold text-foreground">Excel export requires a paid plan</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Get institutional-grade Excel exports with all 9 sheets, cover page, and integrity checks.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-md hover:bg-muted"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Founder tier */}
              <div className="rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-2">
                  <StarIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-foreground">Founder</h3>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-foreground">£29</span>
                  <span className="text-sm text-muted-foreground"> /month</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  For founders and finance teams building models
                </p>
                <ul className="space-y-1.5 text-xs text-foreground mb-4">
                  <li className="flex gap-1.5"><CheckIcon className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />Unlimited models</li>
                  <li className="flex gap-1.5"><CheckIcon className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />Full Excel export (9 sheets)</li>
                  <li className="flex gap-1.5"><CheckIcon className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />Cover page & integrity checks</li>
                  <li className="flex gap-1.5"><CheckIcon className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />All model types</li>
                </ul>
                <Button
                  onClick={() => handleUpgrade("founder")}
                  disabled={upgradingTier !== null}
                  className="w-full gap-2"
                  size="sm"
                >
                  {upgradingTier === "founder" ? (
                    <><LoaderIcon className="w-3 h-3 animate-spin" />Loading...</>
                  ) : (
                    <>Upgrade to Founder</>
                  )}
                </Button>
              </div>

              {/* Vendor Pro tier */}
              <div className="rounded-xl border-2 border-primary p-5 relative">
                <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground">Popular for firms</Badge>
                <div className="flex items-center gap-2 mb-2">
                  <BriefcaseIcon className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-foreground">Vendor Pro</h3>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-foreground">£99</span>
                  <span className="text-sm text-muted-foreground"> /month</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  For accounting firms and consultants
                </p>
                <ul className="space-y-1.5 text-xs text-foreground mb-4">
                  <li className="flex gap-1.5"><CheckIcon className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />Everything in Founder</li>
                  <li className="flex gap-1.5"><CheckIcon className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />Vendor portal</li>
                  <li className="flex gap-1.5"><CheckIcon className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />White-label exports</li>
                  <li className="flex gap-1.5"><CheckIcon className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />Custom logo & colours</li>
                </ul>
                <Button
                  onClick={() => handleUpgrade("vendor_pro")}
                  disabled={upgradingTier !== null}
                  className="w-full gap-2"
                  size="sm"
                >
                  {upgradingTier === "vendor_pro" ? (
                    <><LoaderIcon className="w-3 h-3 animate-spin" />Loading...</>
                  ) : (
                    <>Upgrade to Vendor Pro</>
                  )}
                </Button>
              </div>

            </div>

            <div className="p-6 pt-2 text-center">
              <button
                onClick={() => router.push("/pricing")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                See all plans and features →
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
