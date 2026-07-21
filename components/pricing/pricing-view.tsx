"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  CheckIcon, LoaderIcon, SparklesIcon, BriefcaseIcon,
  BuildingIcon, StarIcon,
} from "lucide-react"

interface PricingViewProps {
  isLoggedIn: boolean
  currentTier: string
}

const TIER_DATA = [
  {
    key: "free",
    name: "Free",
    price: 0,
    priceLabel: "£0",
    period: "forever",
    description: "Try the platform, view models in-app",
    icon: <SparklesIcon className="w-5 h-5 text-muted-foreground" />,
    features: [
      "1 model",
      "View all results in-app",
      "Charts, metrics, 3-statements",
      "Institutional integrity checks",
    ],
    excluded: [
      "No Excel export",
      "No vendor portal",
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    key: "founder",
    name: "Founder",
    price: 29,
    priceLabel: "£29",
    period: "per month",
    description: "Founders and finance teams building models",
    icon: <StarIcon className="w-5 h-5 text-blue-600" />,
    features: [
      "Unlimited models",
      "Full Excel export (9 sheets)",
      "All model types (DCF, 3-stmt, LBO, SaaS)",
      "Cover page and disclaimer",
      "Institutional integrity checks",
      "Priority email support",
    ],
    excluded: [],
    cta: "Upgrade to Founder",
    highlight: false,
  },
  {
    key: "vendor_pro",
    name: "Vendor Pro",
    price: 99,
    priceLabel: "£99",
    period: "per month",
    description: "Accounting firms and consultants serving clients",
    icon: <BriefcaseIcon className="w-5 h-5 text-orange-600" />,
    features: [
      "Everything in Founder",
      "Vendor portal for client models",
      "White-label branded exports",
      "Custom logo and colours",
      "Custom disclaimer text",
      "Unlimited client models",
    ],
    excluded: [],
    cta: "Upgrade to Vendor Pro",
    highlight: true,
    badge: "Most popular for firms",
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: null,
    priceLabel: "Custom",
    period: "contact us",
    description: "Larger firms with team seats and custom needs",
    icon: <BuildingIcon className="w-5 h-5 text-purple-600" />,
    features: [
      "Everything in Vendor Pro",
      "Team seats",
      "Custom domain",
      "Priority phone support",
      "Custom integrations",
      "SLA and dedicated CSM",
    ],
    excluded: [],
    cta: "Contact us",
    highlight: false,
  },
]

export function PricingView({ isLoggedIn, currentTier }: PricingViewProps) {
  const router = useRouter()
  const [loadingTier, setLoadingTier] = useState<string | null>(null)

  async function handleUpgrade(tier: string) {
    if (!isLoggedIn) {
      router.push(`/auth/signup?redirectTo=/pricing`)
      return
    }

    if (tier === "free") {
      router.push("/dashboard")
      return
    }

    if (tier === "enterprise") {
      window.location.href = "mailto:hello@finmodels.co.uk?subject=Enterprise%20Enquiry"
      return
    }

    setLoadingTier(tier)
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
        setLoadingTier(null)
      }
    } catch (err) {
      alert("Something went wrong. Please try again.")
      setLoadingTier(null)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">

        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3">Simple pricing</Badge>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Institutional models. Founder pricing.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Build professional financial models in minutes, not weeks. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {TIER_DATA.map((tier) => {
            const isCurrent = tier.key === currentTier
            const isLoading = loadingTier === tier.key
            return (
              <div
                key={tier.key}
                className={cn(
                  "rounded-2xl border p-6 flex flex-col relative",
                  tier.highlight
                    ? "border-primary shadow-lg bg-card"
                    : "border-border bg-card"
                )}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">{tier.badge}</Badge>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  {tier.icon}
                  <h3 className="font-semibold text-lg text-foreground">{tier.name}</h3>
                </div>

                <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                  {tier.description}
                </p>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">{tier.priceLabel}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{tier.period}</p>
                </div>

                <Button
                  onClick={() => handleUpgrade(tier.key)}
                  disabled={isCurrent || isLoading}
                  variant={tier.highlight ? "default" : "outline"}
                  className="w-full mb-6 gap-2"
                >
                  {isLoading ? (
                    <><LoaderIcon className="w-4 h-4 animate-spin" />Loading...</>
                  ) : isCurrent ? (
                    "Current plan"
                  ) : (
                    tier.cta
                  )}
                </Button>

                <ul className="space-y-2 text-sm text-foreground">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            All plans include: Institutional integrity checks · Multi-currency · GDPR compliant
          </p>
          <p className="text-xs text-muted-foreground">
            Prices in GBP. VAT added where applicable. Cancel anytime.
          </p>
        </div>

      </div>
    </main>
  )
}
