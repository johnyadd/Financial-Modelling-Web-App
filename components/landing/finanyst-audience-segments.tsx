"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RocketIcon, BriefcaseIcon, TrendingUpIcon, ArrowRightIcon } from "lucide-react"

const AUDIENCES = [
  {
    icon: <RocketIcon className="w-5 h-5" />,
    tag: "For founders",
    title: "Raising investment or debt",
    description:
      "Investors expect institutional-grade models. Build one with AI-guided intelligence in minutes — without hiring a consultant.",
    features: [
      "Pre-revenue startup DCF",
      "3-statement models for existing revenue",
      "SaaS unit economics & cohort analysis",
      "Auditor-ready Excel for due diligence",
    ],
    cta: "Start free",
    ctaRoute: "/auth/signup",
  },
  {
    icon: <TrendingUpIcon className="w-5 h-5" />,
    tag: "For finance teams",
    title: "Internal FP&A & forecasting",
    description:
      "Replace fragile Excel workbooks with a single source of truth. Change one assumption, see the impact everywhere.",
    features: [
      "Rolling forecast models",
      "Scenario planning (bear/base/bull)",
      "Cash flow forecasting",
      "Budget vs actuals tracking",
    ],
    cta: "Start free",
    ctaRoute: "/auth/signup",
  },
  {
    icon: <BriefcaseIcon className="w-5 h-5" />,
    tag: "For advisors",
    title: "Accounting firms & fractional CFOs",
    description:
      "Deliver institutional models under your firm's brand. Serve more clients with AI-powered efficiency.",
    features: [
      "White-label branded Excel exports",
      "Custom logo, colours, and disclaimer",
      "Vendor portal for client management",
      "Unlimited client models",
    ],
    cta: "See vendor pricing",
    ctaRoute: "/pricing",
    highlight: true,
  },
]

export function FinanystAudienceSegments() {
  const router = useRouter()

  return (
    <section className="border-t border-border/60 py-24">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">Who it&apos;s for</p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.1] mb-4 max-w-3xl mx-auto">
            One platform. <span className="italic text-primary">Three journeys</span>.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you&apos;re raising money, running FP&A, or advising clients — Finanyst adapts to your workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AUDIENCES.map((audience, i) => (
            <div
              key={i}
              className={`rounded-2xl border ${audience.highlight ? 'border-primary/40 shadow-lg shadow-primary/5' : 'border-border/60'} bg-card p-8 flex flex-col relative transition-shadow hover:shadow-md`}
            >
              {audience.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  Vendor Pro
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  {audience.icon}
                </div>
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                  {audience.tag}
                </span>
              </div>

              <h3 className="font-display text-2xl text-foreground mb-3 leading-tight">{audience.title}</h3>

              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {audience.description}
              </p>

              <ul className="space-y-2 text-sm text-foreground mb-8 flex-grow">
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
