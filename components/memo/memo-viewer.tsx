"use client"

import type { InvestorMemo } from "@/lib/memo/types"
import {
  FileTextIcon,
  BuildingIcon,
  TrendingUpIcon,
  BarChart2Icon,
  SlidersIcon,
  AlertTriangleIcon,
  BanknoteIcon,
  ScaleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
} from "lucide-react"

interface MemoViewerProps {
  memo: InvestorMemo
  businessName?: string
  actions?: React.ReactNode
  /** Optional DOM id — used by parent to grab element for PDF export */
  id?: string
}

/**
 * Renders an InvestorMemo as a styled, readable document.
 * Fixed max-w-3xl reading column, brand-consistent typography.
 * Actions (regenerate, PDF, copy) render at the top via `actions` prop.
 */
export function MemoViewer({ memo, businessName, actions, id }: MemoViewerProps) {
  return (
    <article id={id} className="max-w-3xl mx-auto px-6 py-8 space-y-10 bg-background">

      {/* Header */}
      <header className="space-y-4 pb-6 border-b border-border">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground font-medium">
            <FileTextIcon className="w-3.5 h-3.5" />
            <span>Investor Memo</span>
          </div>
          {actions}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-foreground leading-tight">
          {businessName ?? "Financial Model Analysis"}
        </h1>
        <p className="text-xs text-muted-foreground">
          Generated {new Date(memo.generatedAt).toLocaleDateString("en-GB", {
            day: "numeric", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}
        </p>
      </header>

      {/* Executive Summary */}
      <Section icon={<FileTextIcon className="w-4 h-4" />} title="Executive Summary">
        <p className="text-base leading-relaxed">{memo.executiveSummary.businessOneLiner}</p>
        <p className="text-base leading-relaxed">{memo.executiveSummary.financialPunchline}</p>
        {memo.executiveSummary.ask && (
          <p className="text-base leading-relaxed font-medium">{memo.executiveSummary.ask}</p>
        )}
      </Section>

      {/* Business Snapshot */}
      <Section icon={<BuildingIcon className="w-4 h-4" />} title="Business Snapshot">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <SnapshotRow label="Sector" value={memo.businessSnapshot.sector} />
          <SnapshotRow label="Sub-sector" value={memo.businessSnapshot.subSector} />
          <SnapshotRow label="Stage" value={memo.businessSnapshot.stage} />
          <SnapshotRow label="Location" value={memo.businessSnapshot.location} />
          <SnapshotRow label="Model type" value={memo.businessSnapshot.modelArchetype} span={2} />
        </dl>
        <p className="text-sm leading-relaxed mt-4 text-muted-foreground">
          {memo.businessSnapshot.currentState}
        </p>
      </Section>

      {/* Financial Highlights */}
      <Section icon={<TrendingUpIcon className="w-4 h-4" />} title="Financial Highlights">
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 sm:px-4 font-medium text-muted-foreground">Metric</th>
                <th className="text-right py-2 px-3 sm:px-4 font-medium text-muted-foreground">Year 1</th>
                <th className="text-right py-2 px-3 sm:px-4 font-medium text-muted-foreground">Year 2</th>
                <th className="text-right py-2 px-3 sm:px-4 font-medium text-muted-foreground">Year 3</th>
              </tr>
            </thead>
            <tbody>
              {memo.financialHighlights.metricsTable.map((row, i) => (
                <tr key={i} className="border-b border-border/50 last:border-b-0">
                  <td className="py-2 px-3 sm:px-4 font-medium">{row.metric}</td>
                  <td className="py-2 px-3 sm:px-4 text-right font-mono">{row.y1}</td>
                  <td className="py-2 px-3 sm:px-4 text-right font-mono">{row.y2}</td>
                  <td className="py-2 px-3 sm:px-4 text-right font-mono">{row.y3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm leading-relaxed mt-4">{memo.financialHighlights.narrative}</p>
      </Section>

      {/* Benchmark Comparison */}
      {memo.benchmarkComparison && memo.benchmarkComparison.length > 0 && (
        <Section icon={<BarChart2Icon className="w-4 h-4" />} title="Benchmark Comparison">
          <div className="space-y-3">
            {memo.benchmarkComparison.map((row, i) => (
              <div key={i} className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-medium">{row.metric}</p>
                  <DeltaBadge delta={row.delta} />
                </div>
                  {row.source && (
                    <p className="text-[10px] text-muted-foreground italic">Source: {row.source}</p>
                  )}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">This model: </span>
                    <span className="font-mono">{row.thisModel}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Benchmark: </span>
                    <span>{row.benchmark}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Key Assumptions */}
      <Section icon={<SlidersIcon className="w-4 h-4" />} title="Key Assumptions">
        <div className="space-y-4">
          {memo.assumptions.keyAssumptions.map((a, i) => (
            <div key={i} className="border-l-2 border-primary/40 pl-4 space-y-1.5">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <p className="text-sm font-semibold">{a.assumption}</p>
                <p className="text-sm font-mono text-primary">{a.value}</p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{a.rationale}</p>
              <p className="text-xs leading-relaxed text-muted-foreground italic">
                {a.benchmarkContext}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Sensitivity */}
      <Section icon={<ScaleIcon className="w-4 h-4" />} title="Sensitivity Analysis">
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Top sensitivities
          </h4>
          {memo.sensitivity.topSensitivities.map((s, i) => (
            <div key={i} className="text-sm">
              <p className="font-medium">{s.variable}</p>
              <p className="text-muted-foreground leading-relaxed">{s.impact}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <RangeCard label="Bear case" value={memo.sensitivity.revenueRange.bear} tone="bear" />
          <RangeCard label="Base case" value={memo.sensitivity.revenueRange.base} tone="base" />
          <RangeCard label="Bull case" value={memo.sensitivity.revenueRange.bull} tone="bull" />
        </div>
      </Section>

        {/* Scenario Comparison - present only when cases were computed */}
        {memo.scenarioComparison && memo.scenarioComparison.cases.length > 0 && (
          <Section icon={<ScaleIcon className="w-4 h-4" />} title="Scenario Comparison">
            <p className="text-sm leading-relaxed mb-5">
              {memo.scenarioComparison.narrative}
            </p>
            <div className="space-y-3">
              {memo.scenarioComparison.cases.map((c, i) => (
                <div key={i} className="rounded-lg border border-border p-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="text-sm font-mono">{c.equityValue}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="uppercase tracking-wide">Changed: </span>
                    {c.inputsChanged}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {c.keyMovement}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

      {/* Risks */}
      <Section icon={<AlertTriangleIcon className="w-4 h-4" />} title="Risks & Mitigations">
        <div className="space-y-4">
          {memo.risks.map((r, i) => (
            <div key={i} className="rounded-lg border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10 p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">Risk {i + 1}: {r.risk}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Mitigation: </span>
                {r.mitigation}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Capital Ask (conditional) */}
      {memo.capitalAsk && (
        <Section icon={<BanknoteIcon className="w-4 h-4" />} title="Capital Ask">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-xs text-muted-foreground mb-1">Round size</p>
              <p className="text-xl font-semibold font-mono">{memo.capitalAsk.roundSize}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">Runway</p>
              <p className="text-xl font-semibold">{memo.capitalAsk.runway}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Use of funds
            </p>
            <ul className="space-y-1">
              {memo.capitalAsk.useOfFunds.map((use, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>{use}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm mt-4">
            <span className="text-muted-foreground">Next milestone: </span>
            <span className="font-medium">{memo.capitalAsk.nextMilestone}</span>
          </p>
        </Section>
      )}

      {/* Footer */}
      <footer className="pt-6 border-t border-border text-xs text-muted-foreground italic space-y-1">
        <p>
          Generated by Finanyst — driver-based revenue model, balance sheet integrity checks passed, AI-suggested assumptions with sources.
        </p>
        <p>
          This memo is analytical, not advisory. It should not be construed as investment advice or a recommendation to buy or sell any security.
        </p>
      </footer>
    </article>
  )
}

// -- Sub-components --------------------------------------------------------

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function SnapshotRow({ label, value, span = 1 }: { label: string; value: string; span?: 1 | 2 }) {
  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}

function DeltaBadge({ delta }: { delta: string }) {
  const isAbove = delta.toLowerCase().includes("above") || delta.toLowerCase().includes("higher")
  const isBelow = delta.toLowerCase().includes("below") || delta.toLowerCase().includes("lower")
  const isInRange = delta.toLowerCase().includes("in range") || delta.toLowerCase().includes("in-range")

  const cls = isInRange
    ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900"
    : isAbove
    ? "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900"
    : isBelow
    ? "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900"
    : "text-muted-foreground bg-muted border-border"

  const Icon = isInRange ? MinusIcon : isAbove ? ArrowUpIcon : isBelow ? ArrowDownIcon : MinusIcon

  return (
    <span className={"inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border " + cls}>
      <Icon className="w-3 h-3" />
      {delta}
    </span>
  )
}

function RangeCard({ label, value, tone }: { label: string; value: string; tone: "bear" | "base" | "bull" }) {
  const cls = tone === "base"
    ? "border-primary/30 bg-primary/5"
    : tone === "bear"
    ? "border-red-500/20 bg-red-50/40 dark:bg-red-950/10"
    : "border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/10"

  return (
    <div className={"rounded-lg border p-3 " + cls}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-medium">
        {label}
      </p>
      <p className="text-xs leading-relaxed">{value}</p>
    </div>
  )
}
