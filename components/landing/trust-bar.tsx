import { CheckCircle2Icon, ShieldCheckIcon, ZapIcon, GlobeIcon, SparklesIcon } from "lucide-react"

const TRUST_ITEMS = [
  {
    icon: <CheckCircle2Icon className="w-4 h-4 text-emerald-500" />,
    label: "5 institutional checks",
    detail: "Balance sheet identity, cash flow reconciliation, retained earnings continuity",
  },
  {
    icon: <ZapIcon className="w-4 h-4 text-blue-500" />,
    label: "AI-assisted defaults",
    detail: "Intelligent benchmarks per industry and stage",
  },
  {
    icon: <ShieldCheckIcon className="w-4 h-4 text-purple-500" />,
    label: "Auditor-ready output",
    detail: "9-sheet Excel with cover page, disclaimer, integrity report",
  },
  {
    icon: <GlobeIcon className="w-4 h-4 text-orange-500" />,
    label: "Global-ready",
    detail: "GBP, USD, EUR. UK expertise, worldwide access",
  },
  {
    icon: <SparklesIcon className="w-4 h-4 text-primary" />,
    label: "White-label ready",
    detail: "Vendor branding for accounting firms and CFOs",
  },
]

export function TrustBar() {
  return (
    <section className="border-b border-border bg-muted/30 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground text-center mb-6">
          Why teams choose FinModels UK
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {TRUST_ITEMS.map((item, i) => (
            <div key={i} className="text-center px-2">
              <div className="flex justify-center mb-2">{item.icon}</div>
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

