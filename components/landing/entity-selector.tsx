"use client"

import { useRouter } from "next/navigation"
import {
  RocketIcon,
  BuildingIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  CheckIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const PATHS = [
  {
    key: "startup",
    icon: <RocketIcon className="w-6 h-6" />,
    eyebrow: "New venture",
    title: "I'm a startup founder",
    description:
      "You're building something new and need a financial model to validate your assumptions, plan your runway, or raise investment.",
    features: [
      "Goal-driven guided questionnaire",
      "Model auto-selected from your goal",
      "Pre-revenue & early-stage models",
      "Benchmark-guided assumptions",
      "Funding, runway & exit planning",
    ],
    cta: "Start the questionnaire",
    href: "/questionnaire",
    accent: "purple" as const,
  },
  {
    key: "existing",
    icon: <BuildingIcon className="w-6 h-6" />,
    eyebrow: "Established business",
    title: "I have an existing business",
    description:
      "You have trading history and want to model your financials, run scenarios, or produce investor-ready projections from real data.",
    features: [
      "Upload PDF, Excel or CSV statements",
      "AI-powered data extraction",
      "Review & confirm before modelling",
      "3-statement, DCF & scenario analysis",
      "Management and board reporting",
    ],
    cta: "Upload my financials",
    href: "/upload",
    accent: "teal" as const,
  },
  {
    key: "vendor",
    icon: <BriefcaseIcon className="w-6 h-6" />,
    eyebrow: "Financial professional",
    title: "I'm a financial analyst or consultant",
    description:
      "You're an expert building models for your clients — startups, SMEs or established businesses. Template-first approach with full assumption control.",
    features: [
      "Template-first model selection",
      "Build for startup or existing clients",
      "Full assumption inputs — no hand-holding",
      "White-label client portal",
      "Manage multiple clients in one place",
    ],
    cta: "Go to vendor portal",
    href: "/vendor",
    accent: "coral" as const,
  },
]

const ACCENT_STYLES = {
  purple: {
    iconBg: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    eyebrow: "text-violet-600 dark:text-violet-400",
    border: "hover:border-violet-400 dark:hover:border-violet-500",
    check: "text-violet-500 dark:text-violet-400",
    cta: "bg-violet-600 text-white hover:bg-violet-700",
  },
  teal: {
    iconBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    eyebrow: "text-emerald-600 dark:text-emerald-400",
    border: "hover:border-emerald-400 dark:hover:border-emerald-500",
    check: "text-emerald-500 dark:text-emerald-400",
    cta: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
  coral: {
    iconBg: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    eyebrow: "text-orange-600 dark:text-orange-400",
    border: "hover:border-orange-400 dark:hover:border-orange-500",
    check: "text-orange-500 dark:text-orange-400",
    cta: "bg-orange-600 text-white hover:bg-orange-700",
  },
}

export function EntitySelector() {
  const router = useRouter()

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-2">
          Choose your path
        </p>
        <h2 className="text-2xl font-semibold text-foreground">
          Who are you building this model for?
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
          Each path is tailored to your role — guided for founders, AI-assisted
          for existing businesses, and template-first for financial professionals.
        </p>
      </div>

      {/* 3-column grid on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PATHS.map((path) => {
          const s = ACCENT_STYLES[path.accent]
          return (
            <button
              key={path.key}
              onClick={() => router.push(path.href)}
              className={cn(
                "group relative w-full text-left rounded-2xl border-2 border-border p-6 transition-all duration-200",
                "hover:shadow-lg hover:-translate-y-0.5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                s.border
              )}
            >
              {/* icon */}
              <div className={cn(
                "inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5",
                s.iconBg
              )}>
                {path.icon}
              </div>

              {/* eyebrow */}
              <p className={cn(
                "text-xs font-medium uppercase tracking-widest mb-1.5",
                s.eyebrow
              )}>
                {path.eyebrow}
              </p>

              {/* title */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {path.title}
              </h3>

              {/* description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {path.description}
              </p>

              {/* features */}
              <ul className="space-y-2 mb-6">
                {path.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckIcon className={cn("w-4 h-4 flex-shrink-0 mt-0.5", s.check)} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className={cn(
                "inline-flex items-center gap-2 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors",
                s.cta
              )}>
                {path.cta}
                <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
