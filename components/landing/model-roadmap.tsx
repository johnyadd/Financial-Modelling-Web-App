import { CheckCircle2Icon, ClockIcon, RocketIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const AVAILABLE_NOW = [
  "DCF Valuation",
  "3-Statement Model",
  "LBO Model",
  "SaaS Financial Model",
  "Pre-Revenue Startup DCF",
  "M&A Model",
]

const COMING_SOON = [
  "Comparable Company Analysis",
  "Rolling Forecast Model",
  "13-Week Cash Flow",
  "Cap Table Model",
  "Unit Economics Model",
  "Accretion/Dilution Model",
  "Working Capital Model",
  "Debt Schedule Model",
]

const ROADMAP = [
  "Precedent Transactions",
  "IPO Model",
  "Project Finance Model",
  "Real Estate Development",
  "Renewable Energy Model",
  "Sensitivity Analysis Grid",
  "Sum-of-the-Parts",
  "Cohort Analysis",
]

export function ModelRoadmap() {
  return (
    <section className="border-b border-border bg-muted/30 py-16">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3">Growing platform</Badge>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            One platform. Every model your business needs.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start with the models available today. Get access to new model types automatically as we launch them — no upgrade fee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Available */}
          <div className="rounded-2xl border-2 border-emerald-200 bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2Icon className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="font-semibold text-foreground">Available now</p>
                <p className="text-xs text-muted-foreground">Use today</p>
              </div>
            </div>
            <ul className="space-y-1.5">
              {AVAILABLE_NOW.map((m) => (
                <li key={m} className="text-sm text-foreground flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          </div>

          {/* Coming Soon */}
          <div className="rounded-2xl border-2 border-blue-200 bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-semibold text-foreground">Coming soon</p>
                <p className="text-xs text-muted-foreground">Next 3 months</p>
              </div>
            </div>
            <ul className="space-y-1.5">
              {COMING_SOON.map((m) => (
                <li key={m} className="text-sm text-foreground flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          </div>

          {/* Roadmap */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <RocketIcon className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-semibold text-foreground">On the roadmap</p>
                <p className="text-xs text-muted-foreground">2026</p>
              </div>
            </div>
            <ul className="space-y-1.5">
              {ROADMAP.map((m) => (
                <li key={m} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-500 flex-shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            20+ additional models planned. Vote on the next one to build in your dashboard.
          </p>
        </div>

      </div>
    </section>
  )
}
