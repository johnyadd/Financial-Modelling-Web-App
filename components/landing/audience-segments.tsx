"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  RocketIcon, BriefcaseIcon, TrendingUpIcon, ArrowRightIcon,
} from "lucide-react"

const AUDIENCES = [
  {
    icon: <RocketIcon className="w-6 h-6 text-blue-600" />,
    badge: "For founders",
    title: "Raising investment or a loan",
    description: "Investors and banks expect institutional-grade models. Build one in minutes without hiring a consultant.",
    features: [
      "Pre-revenue startup DCF",
      "3-statement model for existing revenue",
      "SaaS metrics and unit economics",
      "Auditor-ready Excel for due diligence",
    ],
    cta: "Start free",
    ctaRoute: "/auth/signup",
    color: "border-blue-200",
  },
  {
    icon: <TrendingUpIcon className="w-6 h-6 text-emerald-600" />,
    badge: "For finance teams",
    title: "Internal FP&A and forecasting",
    description: "Replace fragile Excel workbooks with a single source of truth. Change one assumption, see the impact everywhere.",
    features: [
      "Rolling forecast models",
      "Scenario planning (bear/base/bull)",
      "Cash flow forecasting",
      "Budget vs actuals tracking",
    ],
    cta: "Start free",
    ctaRoute: "/auth/signup",
    color: "border-emerald-200",
  },
  {
    icon: <BriefcaseIcon className="w-6 h-6 text-orange-600" />,
    badge: "For advisors",
    title: "Accounting firms & fractional CFOs",
    description: "Deliver institutional-grade models under your firm's brand. Manage all your client models in one place.",
    features: [
      "White-label branded Excel exports",
      "Custom logo, colours, and disclaimer",
      "Vendor portal for client management",
      "Unlimited client models",
    ],
    cta: "See vendor pricing",
    ctaRoute: "/pricing",
    color: "border-orange-200",
    highlight: true,
  },
]

export function AudienceSegments() {
  const router = useRouter()

  return (
    <section className="border-b border-border py-16">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3">Who it's for</Badge>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            One platform. Three ways to use it.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AUDIENCES.map((audience, i) => (
            <div
              key={i}
              className={`rounded-2xl border-2 ${audience.color} bg-card p-6 flex flex-col relative`}
            >
              {audience.highlight && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Vendor Pro
                </Badge>
              )}

              <div className="flex items-center gap-3 mb-3">
                {audience.icon}
                <Badge variant="outline" className="text-xs">{audience.badge}</Badge>
              </div>

              <h3 className="text-lg font-bold text-foreground mb-2">{audience.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 min-h-[60px]">
                {audience.description}
              </p>

              <ul className="space-y-1.5 text-sm text-foreground mb-6 flex-grow">
                {audience.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => router.push(audience.ctaRoute)}
                variant={audience.highlight ? "default" : "outline"}
                className="w-full gap-2"
              >
                {audience.cta}
                <ArrowRightIcon className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
