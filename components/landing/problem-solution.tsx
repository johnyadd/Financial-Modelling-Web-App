import { XIcon, CheckIcon, ClockIcon, AlertTriangleIcon, DollarSignIcon } from "lucide-react"

export function ProblemSolution() {
  return (
    <section className="border-b border-border py-16">
      <div className="max-w-5xl mx-auto px-6">

        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">The problem</p>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Financial modelling is broken.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Whether you're pitching investors, running FP&A, or advising clients — you're stuck between three bad options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <ClockIcon className="w-4 h-4 text-red-500" />
              <p className="font-semibold text-foreground">Slow & Excel-heavy</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Building a proper 3-statement model from scratch takes 20-40 hours. Every assumption changes means rebuilding half the workbook.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangleIcon className="w-4 h-4 text-amber-500" />
              <p className="font-semibold text-foreground">Prone to errors</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Balance sheets don't balance. Formulas break when you insert a row. Investors and auditors catch discrepancies you missed.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <DollarSignIcon className="w-4 h-4 text-orange-500" />
              <p className="font-semibold text-foreground">Expensive alternatives</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Consultancy fees for a proper deal model: £5,000-£20,000. Enterprise FP&A software (Anaplan, Vena): £50k+ annually.
            </p>
          </div>

        </div>

        {/* Solution */}
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-wider text-primary mb-2">Our approach</p>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Institutional quality, without the wait or the cost.
          </h2>
        </div>

        <div className="rounded-2xl border-2 border-primary bg-card p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div>
              <p className="text-sm text-muted-foreground mb-4">Traditional workflow</p>
              <ul className="space-y-2">
                <li className="flex gap-2 text-sm text-muted-foreground line-through">
                  <XIcon className="w-4 h-4 flex-shrink-0 mt-0.5" /> Blank Excel spreadsheet
                </li>
                <li className="flex gap-2 text-sm text-muted-foreground line-through">
                  <XIcon className="w-4 h-4 flex-shrink-0 mt-0.5" /> 20-40 hours of manual work
                </li>
                <li className="flex gap-2 text-sm text-muted-foreground line-through">
                  <XIcon className="w-4 h-4 flex-shrink-0 mt-0.5" /> Guess at benchmarks
                </li>
                <li className="flex gap-2 text-sm text-muted-foreground line-through">
                  <XIcon className="w-4 h-4 flex-shrink-0 mt-0.5" /> Hope it balances
                </li>
                <li className="flex gap-2 text-sm text-muted-foreground line-through">
                  <XIcon className="w-4 h-4 flex-shrink-0 mt-0.5" /> Send to accountant to check
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-primary mb-4">FinModels UK workflow</p>
              <ul className="space-y-2">
                <li className="flex gap-2 text-sm text-foreground">
                  <CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> Answer 4 quick questions
                </li>
                <li className="flex gap-2 text-sm text-foreground">
                  <CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> Or upload existing financials
                </li>
                <li className="flex gap-2 text-sm text-foreground">
                  <CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> AI suggests benchmarks per industry
                </li>
                <li className="flex gap-2 text-sm text-foreground">
                  <CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> Balance sheet balances by construction
                </li>
                <li className="flex gap-2 text-sm text-foreground">
                  <CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> Auditor-ready Excel in minutes
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
