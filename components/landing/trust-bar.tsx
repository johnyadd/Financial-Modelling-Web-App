import { ShieldCheckIcon, ZapIcon, FileSpreadsheetIcon } from "lucide-react"

const TRUST_ITEMS = [
  {
    icon: <FileSpreadsheetIcon className="w-4 h-4" />,
    label: "6 model types",
    sub: "DCF · 3-statement · LBO · SaaS · M&A · Pre-revenue",
  },
  {
    icon: <ZapIcon className="w-4 h-4" />,
    label: "Generated in minutes",
    sub: "Not days of manual spreadsheet work",
  },
  {
    icon: <ShieldCheckIcon className="w-4 h-4" />,
    label: "UK-focused",
    sub: "GBP-native, Companies House ready",
  },
]

export function TrustBar() {
  return (
    <section className="border-t border-border bg-muted/30">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TRUST_ITEMS.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <div className="mt-0.5 text-primary flex-shrink-0">{item.icon}</div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
