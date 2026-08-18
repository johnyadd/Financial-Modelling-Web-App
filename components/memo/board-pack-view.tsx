"use client"

import type { BoardPack } from "@/lib/memo/types"
import {
  FileTextIcon, TrendingUpIcon, BanknoteIcon,
  AlertTriangleIcon, CheckSquareIcon, InfoIcon,
} from "lucide-react"

interface BoardPackViewProps {
  pack: BoardPack
  businessName?: string
  actions?: React.ReactNode
  id?: string
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="text-primary">{icon}</div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  )
}

/** Ahead is green, Behind amber, anything else neutral. */
function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase()
  const cls = s.includes("ahead")
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
    : s.includes("behind")
      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
      : "bg-muted text-muted-foreground"
  return <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}>{status}</span>
}

export function BoardPackView({ pack, businessName, actions, id }: BoardPackViewProps) {
  return (
    <article id={id} className="max-w-3xl mx-auto px-6 py-8 space-y-10 bg-background">
      <header className="space-y-4 pb-6 border-b border-border">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground font-medium">
            <FileTextIcon className="w-3.5 h-3.5" />
            <span>Board Pack</span>
          </div>
          {actions}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{businessName ?? "Board Pack"}</h1>
          <p className="text-sm text-muted-foreground">{pack.periodLabel}</p>
        </div>

        {pack.planOnly && (
          <div className="rounded-md border border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/10 px-4 py-2.5 flex items-start gap-2">
            <InfoIcon className="w-4 h-4 text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
              No actuals have been entered, so this pack reports the plan only.
              Add a reporting period to see performance against it.
            </p>
          </div>
        )}
      </header>

      <p className="text-base leading-relaxed">{pack.headline}</p>

      {pack.performance.rows.length > 0 && (
        <Section icon={<TrendingUpIcon className="w-4 h-4" />} title="Performance against plan">
          <p className="text-sm leading-relaxed mb-4">{pack.performance.narrative}</p>
          <div className="space-y-3">
            {pack.performance.rows.map((r, i) => (
              <div key={i} className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-medium">{r.metric}</p>
                  <StatusPill status={r.status} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Actual: </span><span className="font-mono">{r.actual}</span></div>
                  <div><span className="text-muted-foreground">Plan: </span><span className="font-mono">{r.plan}</span></div>
                  <div><span className="text-muted-foreground">Variance: </span><span className="font-mono">{r.variance}</span></div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{r.commentary}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section icon={<BanknoteIcon className="w-4 h-4" />} title="Cash position">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">Closing cash</p>
            <p className="text-xl font-bold">{pack.cashPosition.closingCash}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">Runway</p>
            <p className="text-xl font-bold">{pack.cashPosition.runway}</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed">{pack.cashPosition.narrative}</p>
      </Section>

      {pack.watchItems.length > 0 && (
        <Section icon={<AlertTriangleIcon className="w-4 h-4" />} title="Watch items">
          <div className="space-y-3">
            {pack.watchItems.map((w, i) => (
              <div key={i} className="rounded-lg border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10 p-4 space-y-1">
                <p className="text-sm font-semibold">{w.item}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{w.detail}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {pack.decisions.length > 0 && (
        <Section icon={<CheckSquareIcon className="w-4 h-4" />} title="For board decision">
          <div className="space-y-3">
            {pack.decisions.map((d, i) => (
              <div key={i} className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
                <p className="text-sm font-semibold">{d.decision}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{d.context}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <span className="uppercase tracking-wide">If deferred: </span>{d.ifDeferred}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <footer className="pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Prepared from the financial model. Figures are projections unless a reporting
          period is stated. Not a substitute for management accounts or professional advice.
        </p>
      </footer>
    </article>
  )
}
