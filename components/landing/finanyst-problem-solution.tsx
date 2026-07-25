import { XIcon, CheckIcon, ClockIcon, AlertTriangleIcon, DollarSignIcon } from "lucide-react"

export function FinanystProblemSolution() {
  return (
    <section className="border-t border-border/60 py-24">
      <div className="max-w-5xl mx-auto px-6">

        {/* Section intro */}
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">The problem</p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.1] mb-4 max-w-3xl mx-auto">
            Financial modelling is <span className="italic text-primary">stuck</span> in 2015.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Founders and finance teams deserve better than blank spreadsheets and static templates.
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">

          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                <ClockIcon className="w-4 h-4" />
              </div>
              <p className="font-semibold text-foreground">Excel is slow</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Building a proper 3-statement model takes 20-40 hours. Change one assumption and half the workbook breaks.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                <AlertTriangleIcon className="w-4 h-4" />
              </div>
              <p className="font-semibold text-foreground">Templates are dumb</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Static benchmarks don&apos;t know your industry, stage, or geography. You still guess at the numbers.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                <DollarSignIcon className="w-4 h-4" />
              </div>
              <p className="font-semibold text-foreground">Consultants cost thousands</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A proper deal model runs £5,000-£20,000. Enterprise FP&A software runs £50k+ annually.
            </p>
          </div>

        </div>

        {/* Solution intro */}
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-primary mb-3 font-medium">The Finanyst approach</p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.1] mb-4 max-w-3xl mx-auto">
            AI that <span className="italic text-primary">reasons</span>. Excel that ties.
          </h2>
        </div>

        {/* Solution comparison */}
        <div className="rounded-2xl border-2 border-primary/30 bg-card p-8 md:p-10 shadow-lg shadow-primary/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-medium">Traditional workflow</p>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <XIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground/60" />
                  <span className="line-through">Start with blank spreadsheet</span>
                </li>
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <XIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground/60" />
                  <span className="line-through">Copy assumptions from Google</span>
                </li>
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <XIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground/60" />
                  <span className="line-through">Hope the balance sheet balances</span>
                </li>
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <XIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground/60" />
                  <span className="line-through">Manual formatting for hours</span>
                </li>
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <XIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground/60" />
                  <span className="line-through">Send to accountant for review</span>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-primary mb-4 font-semibold">The Finanyst workflow</p>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-foreground">
                  <CheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                  <span>Answer 4 questions about your business</span>
                </li>
                <li className="flex gap-3 text-sm text-foreground">
                  <CheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                  <span>AI suggests contextual assumptions with reasoning</span>
                </li>
                <li className="flex gap-3 text-sm text-foreground">
                  <CheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                  <span>Balance sheet balances by construction</span>
                </li>
                <li className="flex gap-3 text-sm text-foreground">
                  <CheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                  <span>Institutional Excel export in one click</span>
                </li>
                <li className="flex gap-3 text-sm text-foreground">
                  <CheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                  <span>Ships with 5 integrity checks pre-passed</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
