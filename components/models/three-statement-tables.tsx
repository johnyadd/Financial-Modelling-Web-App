"use client"

import { cn } from "@/lib/utils"
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
} from "recharts"

function fmt(val: unknown, currency = "GBP"): string {
  const n = parseFloat(String(val))
  if (isNaN(n)) return "—"
  if (Math.abs(n) >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(2)}m`
  if (Math.abs(n) >= 1_000) return `${currency} ${(n / 1_000).toFixed(1)}k`
  return `${currency} ${n.toFixed(0)}`
}

function CustomTooltip({ active, payload, label, currency = "GBP" }: {
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
          <span>{fmt(p.value, currency)}</span>
        </p>
      ))}
    </div>
  )
}

export function BalanceSheetTable({ balanceSheet, currency }: { balanceSheet: Record<string, unknown>[]; currency: string }) {
  const sections = [
    {
      id: "assets", label: "Assets",
      rows: [
        { key: "cash",               label: "Cash & equivalents" },
        { key: "accounts_receivable", label: "Accounts receivable" },
        { key: "fixed_assets",        label: "Fixed assets (net)" },
        { key: "total_assets",        label: "Total assets", bold: true },
      ]
    },
    {
      id: "liabilities", label: "Liabilities",
      rows: [
        { key: "accounts_payable",  label: "Accounts payable" },
        { key: "debt",              label: "Debt" },
        { key: "total_liabilities", label: "Total liabilities", bold: true },
      ]
    },
    {
      id: "equity", label: "Equity",
      rows: [
        { key: "equity",                   label: "Equity" },
        { key: "retained_earnings",        label: "Retained earnings" },
        { key: "total_equity_liabilities", label: "Total liabilities + equity", bold: true },
      ]
    },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 text-muted-foreground font-medium">Balance Sheet</th>
            {balanceSheet.map((row) => (
              <th key={String(row.year)} className="text-right py-2 text-muted-foreground font-medium px-2">Year {String(row.year)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <>
              <tr key={section.id} className="bg-muted/30">
                <td colSpan={balanceSheet.length + 1} className="py-1.5 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {section.label}
                </td>
              </tr>
              {section.rows.map(({ key, label, bold }) => (
                <tr key={key} className={cn("border-b border-border/40", bold ? "bg-muted/20" : "")}>
                  <td className={cn("py-2 pl-4", bold ? "font-semibold text-foreground" : "text-muted-foreground")}>{label}</td>
                  {balanceSheet.map((row) => (
                    <td key={String(row.year)} className={cn(
                      "text-right py-2 px-2 tabular-nums",
                      bold ? "font-semibold text-foreground" : "text-foreground",
                      parseFloat(String(row[key])) < 0 ? "text-red-600 dark:text-red-400" : ""
                    )}>
                      {fmt(row[key], currency)}
                    </td>
                  ))}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CashFlowTable({ cashFlow, currency }: { cashFlow: Record<string, unknown>[]; currency: string }) {
  const sections = [
    {
      id: "ops", label: "Operating Activities",
      rows: [
        { key: "net_income",   label: "Net income" },
        { key: "depreciation", label: "Add: Depreciation" },
        { key: "wc_change",    label: "Working capital change" },
        { key: "cfo",          label: "Cash from operations (CFO)", bold: true },
      ]
    },
    {
      id: "inv", label: "Investing Activities",
      rows: [
        { key: "capex", label: "Capital expenditure" },
        { key: "cfi",   label: "Cash from investing (CFI)", bold: true },
      ]
    },
    {
      id: "fin", label: "Financing Activities",
      rows: [
        { key: "debt_repayment", label: "Debt repayment" },
        { key: "cff",            label: "Cash from financing (CFF)", bold: true },
      ]
    },
    {
      id: "net", label: "Net Position",
      rows: [
        { key: "net_cash_flow", label: "Net cash flow",       bold: true },
        { key: "closing_cash",  label: "Closing cash balance", bold: true },
      ]
    },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 text-muted-foreground font-medium">Cash Flow Statement</th>
            {cashFlow.map((row) => (
              <th key={String(row.year)} className="text-right py-2 text-muted-foreground font-medium px-2">Year {String(row.year)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <>
              <tr key={section.id} className="bg-muted/30">
                <td colSpan={cashFlow.length + 1} className="py-1.5 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {section.label}
                </td>
              </tr>
              {section.rows.map(({ key, label, bold }) => (
                <tr key={key} className={cn("border-b border-border/40", bold ? "bg-muted/20" : "")}>
                  <td className={cn("py-2 pl-4", bold ? "font-semibold text-foreground" : "text-muted-foreground")}>{label}</td>
                  {cashFlow.map((row) => (
                    <td key={String(row.year)} className={cn(
                      "text-right py-2 px-2 tabular-nums",
                      bold ? "font-semibold text-foreground" : "text-foreground",
                      parseFloat(String(row[key])) < 0 ? "text-red-600 dark:text-red-400" : ""
                    )}>
                      {fmt(row[key], currency)}
                    </td>
                  ))}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function BalanceSheetChart({ balanceSheet, currency }: { balanceSheet: Record<string, unknown>[]; currency: string }) {
  const data = balanceSheet.map((row) => ({
    year:          `Year ${row.year}`,
    "Assets":      Number(row.total_assets ?? 0),
    "Liabilities": Number(row.total_liabilities ?? 0),
    "Equity":      Number(row.equity ?? 0),
  }))

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">Assets, Liabilities and Equity by year ({currency})</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => fmt(v, currency)} tick={{ fontSize: 10 }} width={80} />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Assets"       fill="#2E86AB" radius={[3,3,0,0]} />
          <Bar dataKey="Liabilities"  fill="#E74C3C" radius={[3,3,0,0]} />
          <Bar dataKey="Equity"       fill="#27AE60" radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CashFlowChart({ cashFlow, currency }: { cashFlow: Record<string, unknown>[]; currency: string }) {
  const data = cashFlow.map((row) => ({
    year:           `Year ${row.year}`,
    "CFO":          Number(row.cfo ?? 0),
    "CFI":          Number(row.cfi ?? 0),
    "CFF":          Number(row.cff ?? 0),
    "Closing Cash": Number(row.closing_cash ?? 0),
  }))

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">Cash flows by activity and closing cash balance ({currency})</p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => fmt(v, currency)} tick={{ fontSize: 10 }} width={80} />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1.5} />
          <Line type="monotone" dataKey="CFO"          stroke="#2E86AB" strokeWidth={2.5} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="CFI"          stroke="#E74C3C" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} />
          <Line type="monotone" dataKey="CFF"          stroke="#F18F01" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Closing Cash" stroke="#27AE60" strokeWidth={3} dot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
