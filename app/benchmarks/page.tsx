import Link from "next/link"
import { BENCHMARK_RANGES } from "@/lib/benchmarks/ranges"
import { BENCHMARK_CITATIONS } from "@/lib/benchmarks/citations"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon, ExternalLinkIcon } from "lucide-react"

export const metadata = {
  title: "UK Seed to Series A benchmark reference | Finanyst",
  description:
    "Sixteen UK startup benchmarks with named sources, vintages and confidence tiers - Beauhurst, ONS, British Business Bank, Bank of England, and the adjustments applied to non-UK data.",
}

const TIER_STYLE: Record<string, string> = {
  high:   "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
  low:    "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400",
}

export default function BenchmarksPage() {
  const rows = Object.entries(BENCHMARK_RANGES)
    .map(([key, range]) => ({ key, range, citation: BENCHMARK_CITATIONS[key] }))
    .filter((r) => r.citation)

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-3 pb-6 border-b border-border">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            Reference
          </p>
          <h1 className="text-2xl font-semibold">
            UK Seed to Series A benchmark reference
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every benchmark Finanyst measures a model against, with the source it comes
            from. Where no UK-specific dataset exists we say so, name the non-UK source,
            and state the adjustment applied.
          </p>
        </header>

        <div className="space-y-4">
          {rows.map(({ key, range, citation }) => (
            <div key={key} className="rounded-lg border border-border p-4 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium">{range}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${TIER_STYLE[citation.confidenceTier]}`}>
                  {citation.confidenceTier}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {citation.source} {citation.vintage} · {citation.geography}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {citation.methodology}
              </p>
              {citation.reasoning && (
                <p className="text-xs italic text-muted-foreground leading-relaxed">
                  UK adjustment: {citation.reasoning}
                </p>
              )}
              {citation.url && (
                <a href={citation.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  View source<ExternalLinkIcon className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            See these applied to a real model.
          </p>
          <Button asChild className="gap-2">
            <Link href="/demo">Read a sample memo<ArrowRightIcon className="w-4 h-4" /></Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
