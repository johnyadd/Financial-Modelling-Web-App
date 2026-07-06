"use client"

import { useRouter } from "next/navigation"
import {
  BriefcaseIcon,
  ArrowLeftIcon,
  RocketIcon,
  BuildingIcon,
  ArrowRightIcon,
  CheckIcon,
  UsersIcon,
  LayoutTemplateIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const MODEL_TEMPLATES = [
  { label: "Pre-revenue DCF", tags: ["Startup", "Valuation"] },
  { label: "3-Statement Model", tags: ["P&L", "Balance Sheet", "CFS"] },
  { label: "DCF Valuation", tags: ["Valuation", "WACC"] },
  { label: "LBO Model", tags: ["Private Equity", "Debt"] },
  { label: "SaaS Model", tags: ["MRR", "Unit Economics"] },
  { label: "M&A Model", tags: ["Synergies", "Accretion"] },
]

const CLIENT_PATHS = [
  {
    key: "startup_client",
    icon: <RocketIcon className="w-5 h-5" />,
    title: "My client is a startup",
    description:
      "Your client is pre-revenue or early-stage. You will specify their business details and select the most appropriate model template.",
    features: [
      "Full business info and sector inputs",
      "Detailed revenue and cost assumptions",
      "Funding, runway and exit modelling",
      "Benchmark guidance with override control",
    ],
    href: "/vendor/client/startup",
    accent: "purple" as const,
  },
  {
    key: "existing_client",
    icon: <BuildingIcon className="w-5 h-5" />,
    title: "My client is an existing business",
    description:
      "Your client has trading history. Upload or manually enter their financial statements and build projections from real data.",
    features: [
      "Upload client financial statements",
      "AI extraction with expert review",
      "Historical to forward projections",
      "3-statement, DCF and scenario models",
    ],
    href: "/vendor/client/existing",
    accent: "teal" as const,
  },
]

const ACCENT = {
  purple: {
    border: "hover:border-violet-400",
    icon: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    check: "text-violet-500",
    cta: "bg-violet-600 text-white hover:bg-violet-700",
  },
  teal: {
    border: "hover:border-emerald-400",
    icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    check: "text-emerald-500",
    cta: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
}

export default function VendorPortalPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* back */}
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to home
        </button>

        {/* header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center flex-shrink-0">
            <BriefcaseIcon className="w-6 h-6 text-orange-700 dark:text-orange-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-orange-600 border-orange-300 dark:text-orange-400 dark:border-orange-800">
                Financial professional
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">
              Vendor portal
            </h1>
            <p className="text-muted-foreground text-sm">
              Build financial models for your clients. Choose your client type,
              select the right template, and enter full assumptions with expert-level control.
            </p>
          </div>
        </div>

        {/* how it works */}
        <div className="rounded-xl border border-border bg-muted/20 p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <LayoutTemplateIcon className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium text-foreground">How the vendor workflow works</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { step: "1", label: "Select client type", sub: "Startup or existing business" },
              { step: "2", label: "Choose model template", sub: "DCF, LBO, 3-stmt and more" },
              { step: "3", label: "Enter assumptions", sub: "Full control, no restrictions" },
              { step: "4", label: "Generate & deliver", sub: "Export Excel, PDF or share" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* available model templates */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <LayoutTemplateIcon className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Available model templates</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {MODEL_TEMPLATES.map((t) => (
              <div
                key={t.label}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2"
              >
                <span className="text-sm font-medium text-foreground">{t.label}</span>
                <div className="flex gap-1">
                  {t.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* client type selection */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <UsersIcon className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Select your client type to begin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CLIENT_PATHS.map((path) => {
              const s = ACCENT[path.accent]
              return (
                <button
                  key={path.key}
                  onClick={() => router.push(path.href)}
                  className={cn(
                    "group text-left rounded-2xl border-2 border-border p-6 transition-all duration-200",
                    "hover:shadow-md hover:-translate-y-0.5",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    s.border
                  )}
                >
                  <div className={cn(
                    "inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4",
                    s.icon
                  )}>
                    {path.icon}
                  </div>

                  <h3 className="text-base font-semibold text-foreground mb-1.5">
                    {path.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {path.description}
                  </p>

                  <ul className="space-y-1.5 mb-5">
                    {path.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckIcon className={cn("w-4 h-4 flex-shrink-0 mt-0.5", s.check)} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className={cn(
                    "inline-flex items-center gap-2 text-sm font-medium rounded-lg px-4 py-2 transition-colors",
                    s.cta
                  )}>
                    Start client model
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* manage existing clients */}
        <div className="mt-8 rounded-xl border border-border bg-muted/20 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <UsersIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Manage existing clients</p>
              <p className="text-xs text-muted-foreground">
                View saved models, update assumptions, and re-export for existing clients
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/vendor/clients")}>
            My clients
          </Button>
        </div>

      </div>
    </main>
  )
}
