import { CheckCircle2Icon, ShieldCheckIcon, ZapIcon, GlobeIcon, SparklesIcon, LayersIcon } from "lucide-react"
const TRUST_ITEMS = [
  {
    icon: <CheckCircle2Icon className="w-5 h-5" />,
    label: "Institutional integrity",
    detail: "5 balance sheet checks. Every model, by construction.",
  },
  {
    icon: <ZapIcon className="w-5 h-5" />,
    label: "AI-powered defaults",
    detail: "Contextual suggestions across 32 assumption fields.",
  },
  {
    icon: <LayersIcon className="w-5 h-5" />,
    label: "27 business sub-types",
    detail: "Sector-specific revenue drivers, not generic industry templates.",
  },
  {
    icon: <ShieldCheckIcon className="w-5 h-5" />,
    label: "Auditor-ready",
    detail: "9-sheet Excel with cover page, disclaimer, and integrity report.",
  },
  {
    icon: <GlobeIcon className="w-5 h-5" />,
    label: "Global-ready",
    detail: "GBP, USD, EUR. UK expertise, worldwide access.",
  },
  {
    icon: <SparklesIcon className="w-5 h-5" />,
    label: "White-label",
    detail: "Custom branding for accounting firms and CFOs.",
  },
]
export function FinanystTrustBar() {
  return (
    <section className="relative border-y border-border/60 py-14 bg-muted/20">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-10 font-medium">
          Why teams are switching to Finanyst
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {TRUST_ITEMS.map((item, i) => (
            <div key={i} className="text-center">
              <div className="flex justify-center mb-3 text-primary">{item.icon}</div>
              <p className="text-sm font-semibold text-foreground mb-1">{item.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
