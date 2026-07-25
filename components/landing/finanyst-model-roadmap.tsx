import { CheckCircle2Icon, ClockIcon, RocketIcon } from "lucide-react"

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

export function FinanystModelRoadmap() {
  return (
    <section className="border-t border-border/60 py-24 bg-muted/20">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">Growing platform</p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.1] mb-4 max-w-3xl mx-auto">
            One platform. <span className="italic text-primary">Every model</span> your business needs.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start with what&apos;s available today. Get new model types automatically as we ship them — no upgrade fee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Available now */}
          <div className="rounded-2xl border-2 border-primary/30 bg-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <CheckCircle2Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Available now</p>
                <p className="text-xs text-muted-foreground">Ready to use today</p>
              </div>
            </div>
            <ul className="space-y-2">
              {AVAILABLE_NOW.map((m) => (
                <li key={m} className="text-sm text-foreground flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          </div>

          {/* Coming soon */}
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <ClockIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Coming soon</p>
                <p className="text-xs text-muted-foreground">Next 3 months</p>
              </div>
            </div>
            <ul className="space-y-2">
              {COMING_SOON.map((m) => (
                <li key={m} className="text-sm text-foreground flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          </div>

          {/* On roadmap */}
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                <RocketIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">On the roadmap</p>
                <p className="text-xs text-muted-foreground">2026</p>
              </div>
            </div>
            <ul className="space-y-2">
              {ROADMAP.map((m) => (
                <li key={m} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-purple-500 flex-shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="text-center mt-10">
          <p className="text-sm text-muted-foreground">
            20+ additional models planned. Vote on what we build next from your dashboard.
          </p>
        </div>

      </div>
    </section>
  )
}
