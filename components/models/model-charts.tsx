"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LabelList,
} from "recharts"

// ── Helpers ───────────────────────────────────────────────────
function shortFmt(value: number, currency = "GBP"): string {
  if (Math.abs(value) >= 1_000_000)
    return `${currency} ${(value / 1_000_000).toFixed(1)}m`
  if (Math.abs(value) >= 1_000)
    return `${currency} ${(value / 1_000).toFixed(0)}k`
  return `${currency} ${value.toFixed(0)}`
}

const CHART_COLOURS = {
  revenue:    "#2E86AB",
  ebitda:     "#A23B72",
  grossProfit:"#F18F01",
  positive:   "#27AE60",
  negative:   "#C0392B",
  bear:       "#E74C3C",
  base:       "#2E86AB",
  bull:       "#27AE60",
  margin:     "#8E44AD",
  netIncome:  "#16A085",
}

// ── Custom tooltip ─────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
  label,
  currency = "GBP",
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
  currency?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="font-medium">{p.name}:</span>
          <span>{typeof p.value === "number" ? shortFmt(p.value, currency) : p.value}</span>
        </p>
      ))}
    </div>
  )
}

function PctTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="font-medium">{p.name}:</span>
          <span>{Number(p.value).toFixed(1)}%</span>
        </p>
      ))}
    </div>
  )
}

// ── Chart 1: Revenue & EBITDA Bar Chart ───────────────────────
interface RevenueChartProps {
  pnl: Record<string, unknown>[]
  currency: string
}

export function RevenueEbitdaChart({ pnl, currency }: RevenueChartProps) {
  const data = pnl.map((row) => ({
    year:        `Year ${row.year}`,
    Revenue:     Number(row.revenue ?? 0),
    "EBITDA":    Number(row.ebitda ?? 0),
    "Gross Profit": Number(row.gross_profit ?? 0),
  }))

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">
        Revenue, Gross Profit and EBITDA by year ({currency})
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis
            tickFormatter={(v) => shortFmt(v, currency)}
            tick={{ fontSize: 10 }}
            width={80}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1.5} />
          <Bar dataKey="Revenue"      fill={CHART_COLOURS.revenue}     radius={[3, 3, 0, 0]} />
          <Bar dataKey="Gross Profit" fill={CHART_COLOURS.grossProfit}  radius={[3, 3, 0, 0]} />
          <Bar dataKey="EBITDA"       fill={CHART_COLOURS.ebitda}       radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.EBITDA >= 0 ? CHART_COLOURS.ebitda : CHART_COLOURS.negative}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Chart 2: Margin Progression Line Chart ────────────────────
interface MarginChartProps {
  pnl: Record<string, unknown>[]
}

export function MarginProgressionChart({ pnl }: MarginChartProps) {
  const data = pnl.map((row) => ({
    year:           `Year ${row.year}`,
    "Gross Margin": Number(row.gross_margin_pct ?? (
      row.gross_profit && row.revenue
        ? (Number(row.gross_profit) / Number(row.revenue)) * 100
        : 0
    )),
    "EBITDA Margin": Number(row.ebitda_margin ?? 0),
    "Net Margin":    Number(row.net_margin ?? (
      row.net_income && row.revenue
        ? (Number(row.net_income) / Number(row.revenue)) * 100
        : 0
    )),
  }))

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">
        Margin progression over projection period (%)
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            tick={{ fontSize: 10 }}
            width={50}
          />
          <Tooltip content={<PctTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1.5} />
          <Line
            type="monotone"
            dataKey="Gross Margin"
            stroke={CHART_COLOURS.grossProfit}
            strokeWidth={2.5}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="EBITDA Margin"
            stroke={CHART_COLOURS.ebitda}
            strokeWidth={2.5}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Net Margin"
            stroke={CHART_COLOURS.netIncome}
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Chart 3: FCF Waterfall ────────────────────────────────────
interface FCFChartProps {
  fcfSchedule: number[]
  currency: string
}

export function FCFChart({ fcfSchedule, currency }: FCFChartProps) {
  const data = fcfSchedule.map((val, i) => ({
    year:  `Year ${i + 1}`,
    FCF:   val,
    color: val >= 0 ? CHART_COLOURS.positive : CHART_COLOURS.negative,
  }))

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">
        Free Cash Flow by year — green = positive, red = negative ({currency})
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis
            tickFormatter={(v) => shortFmt(v, currency)}
            tick={{ fontSize: 10 }}
            width={80}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <ReferenceLine y={0} stroke="var(--border)" strokeWidth={2} />
          <Bar dataKey="FCF" radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
            <LabelList
              dataKey="FCF"
              position="top"
              formatter={(v: number) => shortFmt(v, currency)}
              style={{ fontSize: 9, fill: "var(--muted-foreground)" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Chart 4: Scenario Comparison ──────────────────────────────
interface ScenarioChartProps {
  scenarios: Record<string, Record<string, unknown>>
  currency: string
}

export function ScenarioChart({ scenarios, currency }: ScenarioChartProps) {
  const data = [
    {
      name:  "Enterprise Value",
      Bear:  Number(scenarios.bear?.enterprise_value ?? 0),
      Base:  Number(scenarios.base?.enterprise_value ?? 0),
      Bull:  Number(scenarios.bull?.enterprise_value ?? 0),
    },
    {
      name:  "Year 1 Revenue",
      Bear:  Number(scenarios.bear?.year1_revenue ?? 0),
      Base:  Number(scenarios.base?.year1_revenue ?? 0),
      Bull:  Number(scenarios.bull?.year1_revenue ?? 0),
    },
  ]

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">
        Bear / Base / Bull scenario comparison ({currency})
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => shortFmt(v, currency)}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11 }}
            width={110}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine x={0} stroke="var(--border)" />
          <Bar dataKey="Bear" fill={CHART_COLOURS.bear} radius={[0, 3, 3, 0]} />
          <Bar dataKey="Base" fill={CHART_COLOURS.base} radius={[0, 3, 3, 0]} />
          <Bar dataKey="Bull" fill={CHART_COLOURS.bull} radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Chart 5: Revenue Growth Line ──────────────────────────────
interface RevenueGrowthChartProps {
  pnl: Record<string, unknown>[]
  currency: string
}

export function RevenueGrowthChart({ pnl, currency }: RevenueGrowthChartProps) {
  const data = pnl.map((row, i) => {
    const prev = i > 0 ? Number(pnl[i - 1].revenue ?? 0) : null
    const curr = Number(row.revenue ?? 0)
    const growth = prev && prev > 0 ? ((curr - prev) / prev) * 100 : null
    return {
      year:     `Year ${row.year}`,
      Revenue:  curr,
      "YoY Growth %": growth,
    }
  })

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">
        Revenue trajectory and year-on-year growth rate
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis
            yAxisId="left"
            tickFormatter={(v) => shortFmt(v, currency)}
            tick={{ fontSize: 10 }}
            width={80}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v) => `${v?.toFixed(0)}%`}
            tick={{ fontSize: 10 }}
            width={45}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Revenue"
            stroke={CHART_COLOURS.revenue}
            strokeWidth={3}
            dot={{ r: 5, fill: CHART_COLOURS.revenue }}
            activeDot={{ r: 7 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="YoY Growth %"
            stroke={CHART_COLOURS.grossProfit}
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={{ r: 3 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
