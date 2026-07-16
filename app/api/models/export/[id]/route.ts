import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import ExcelJS from "exceljs"

// â”€â”€ Colour palette â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const COLOURS = {
  headerBg:    "1E3A5F",   // dark navy
  headerFg:    "FFFFFF",   // white
  subHeaderBg: "2E86AB",   // mid blue
  subHeaderFg: "FFFFFF",
  accentBg:    "E8F4FD",   // light blue
  negativeFg:  "C0392B",   // red for negatives
  positiveFg:  "27AE60",   // green for positives
  borderClr:   "BDC3C7",   // light grey border
  summaryBg:   "F8F9FA",   // off-white
  boldFg:      "1E3A5F",   // navy for bold rows
}

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function currencyFmt(currency: string) {
  return `"${currency} "#,##0;[Red]"${currency} "-#,##0`
}

function pctFmt() {
  return '0.0"%"'
}

function applyHeaderStyle(
  row: ExcelJS.Row,
  bgColor: string,
  fgColor: string,
  fontSize = 11
) {
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } }
    cell.font = { bold: true, color: { argb: fgColor }, size: fontSize }
    cell.alignment = { vertical: "middle", horizontal: "center" }
    cell.border = {
      bottom: { style: "thin", color: { argb: COLOURS.borderClr } },
    }
  })
  row.height = 20
}

function applyDataRowStyle(
  row: ExcelJS.Row,
  isBold = false,
  bgColor?: string
) {
  row.eachCell((cell) => {
    if (bgColor) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } }
    }
    cell.font = {
      bold: isBold,
      color: { argb: isBold ? COLOURS.boldFg : "000000" },
      size: 10,
    }
    cell.border = {
      bottom: { style: "hair", color: { argb: COLOURS.borderClr } },
    }
  })
  row.height = 18
}

function addSectionTitle(sheet: ExcelJS.Worksheet, title: string, colCount: number) {
  const row = sheet.addRow([title])
  sheet.mergeCells(row.number, 1, row.number, colCount)
  row.getCell(1).fill = {
    type: "pattern", pattern: "solid",
    fgColor: { argb: COLOURS.subHeaderBg },
  }
  row.getCell(1).font = { bold: true, color: { argb: COLOURS.subHeaderFg }, size: 11 }
  row.getCell(1).alignment = { vertical: "middle", horizontal: "left", indent: 1 }
  row.height = 22
  return row
}

// â”€â”€ Main export function â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function buildWorkbook(
  model: Record<string, unknown>,
  output: Record<string, unknown>,
  currency: string,
): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook()
  wb.creator = "FinModels UK"
  wb.created = new Date()

  const s1 = model.step1_business as Record<string, unknown>
  const dcfOut = (Object.keys(output.dcf_output ?? {}).length > 0 ? output.dcf_output : output.three_statement ?? {}) as Record<string, unknown>
  const summary = (dcfOut.summary ?? output.summary_metrics ?? {}) as Record<string, unknown>
  const pnl = (dcfOut.pnl ?? dcfOut.income_statement ?? []) as Record<string, unknown>[]
  const fcfSchedule = (dcfOut.fcf_schedule ?? []) as number[]
  const balanceSheet = (dcfOut.balance_sheet ?? []) as Record<string, unknown>[]
  const cashFlow = (dcfOut.cash_flow ?? []) as Record<string, unknown>[]
  const pvFcfs = (dcfOut.pv_fcfs ?? []) as number[]
  const scenarios = (dcfOut.scenarios ?? {}) as Record<string, Record<string, unknown>>
  const sensitivity = (dcfOut.sensitivity ?? null) as Record<string, unknown> | null
  const years = pnl.map((r) => `Year ${r.year}`)
  const cFmt = currencyFmt(currency)

  // â”€â”€ SHEET 1: Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const summarySheet = wb.addWorksheet("Summary", {
    pageSetup: { fitToPage: true, fitToWidth: 1 },
  })
  summarySheet.columns = [
    { width: 32 },
    { width: 22 },
  ]

  // Title block
  summarySheet.mergeCells("A1:B1")
  const titleCell = summarySheet.getCell("A1")
  titleCell.value = "FinModels UK â€” Financial Model Summary"
  titleCell.font = { bold: true, size: 14, color: { argb: COLOURS.headerFg } }
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOURS.headerBg } }
  titleCell.alignment = { vertical: "middle", horizontal: "center" }
  summarySheet.getRow(1).height = 30

  // Business info
  summarySheet.addRow([])
  addSectionTitle(summarySheet, "Business Information", 2)
  const infoRows = [
    ["Business name",   s1.businessName],
    ["Industry",        s1.industry],
    ["Sub-sector",      s1.subSector],
    ["Business stage",  s1.businessStage],
    ["Country",         s1.country],
    ["Currency",        s1.currency],
    ["Model type",      model.model_type],
    ["Generated",       new Date().toLocaleDateString("en-GB")],
  ]
  infoRows.forEach(([label, value]) => {
    const row = summarySheet.addRow([label, value])
    applyDataRowStyle(row, false, COLOURS.summaryBg)
    row.getCell(1).font = { bold: true, size: 10, color: { argb: COLOURS.boldFg } }
  })

  // Key metrics
  summarySheet.addRow([])
  addSectionTitle(summarySheet, "Key Financial Metrics", 2)
  const metricRows: [string, unknown, string?][] = [
    ["Enterprise Value",    summary.enterprise_value, cFmt],
    ["Equity Value",        summary.equity_value,     cFmt],
    ["IRR",                 summary.irr != null ? Number(summary.irr) / 100 : null, "0.0%"],
    ["Terminal Value",      summary.terminal_value,   cFmt],
    ["PV Terminal Value",   summary.pv_terminal,      cFmt],
    ["Exit Valuation",      summary.exit_valuation,   cFmt],
    ["Exit Multiple",       summary.exit_multiple,    '0.0"x"'],
    ["Discount Rate (WACC)", summary.discount_rate != null ? Number(summary.discount_rate) / 100 : null, "0.0%"],
    ["Terminal Growth Rate", summary.terminal_growth != null ? Number(summary.terminal_growth) / 100 : null, "0.0%"],
    ["Runway (months)",     summary.runway_months,    "0.0"],
    ["Year 1 Revenue",      summary.year1_revenue,    cFmt],
    ["Final Year Revenue",  summary.final_year_revenue, cFmt],
    ["Final EBITDA Margin", summary.final_ebitda_margin != null ? Number(summary.final_ebitda_margin) / 100 : null, "0.0%"],
  ]

  metricRows.forEach(([label, value, fmt]) => {
    if (value == null) return
    const row = summarySheet.addRow([label, value])
    if (fmt) row.getCell(2).numFmt = fmt
    row.getCell(2).alignment = { horizontal: "right" }
    const isBold = label === "Enterprise Value" || label === "Equity Value" || label === "IRR"
    applyDataRowStyle(row, isBold)
    if (isBold) {
      row.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOURS.accentBg } }
    }
  })

  // â”€â”€ SHEET 2: P&L â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (pnl.length > 0) {
    const plSheet = wb.addWorksheet("P&L Schedule")
    plSheet.columns = [
      { width: 28 },
      ...years.map(() => ({ width: 18 })),
    ]

    // Header
    const plHeaderRow = plSheet.addRow(["P&L Schedule (Â£)", ...years])
    applyHeaderStyle(plHeaderRow, COLOURS.headerBg, COLOURS.headerFg, 12)
    plHeaderRow.getCell(1).alignment = { horizontal: "left", indent: 1 }

    const plRows: { key: string; label: string; bold?: boolean; pct?: boolean }[] = [
      { key: "revenue",       label: "Revenue",           bold: true },
      { key: "cogs",          label: "Cost of Revenue" },
      { key: "gross_profit",  label: "Gross Profit",      bold: true },
      { key: "salaries",      label: "Salaries & Benefits" },
      { key: "marketing",     label: "Sales & Marketing" },
      { key: "rd",            label: "Research & Development" },
      { key: "fixed_opex",    label: "General & Admin" },
      { key: "total_costs",   label: "Total Operating Costs", bold: true },
      { key: "ebitda",        label: "EBITDA",            bold: true },
      { key: "ebitda_margin", label: "EBITDA Margin %",   pct: true },
      { key: "depreciation",  label: "Depreciation" },
      { key: "ebit",          label: "EBIT",              bold: true },
      { key: "interest_expense", label: "Interest Expense" },
      { key: "tax",           label: "Corporation Tax" },
      { key: "net_income",    label: "Net Income",        bold: true },
      { key: "net_margin",    label: "Net Margin %",      pct: true },
    ]

    plRows.forEach(({ key, label, bold, pct: isPct }) => {
      const values = pnl.map((r) => r[key] ?? null)
      if (values.every((v) => v == null)) return

      const row = plSheet.addRow([label, ...values])
      applyDataRowStyle(row, bold)

      values.forEach((val, i) => {
        const cell = row.getCell(i + 2)
        if (val == null) return
        if (isPct) {
          cell.numFmt = '0.0"%"'
        } else {
          cell.numFmt = cFmt
          if (Number(val) < 0) {
            cell.font = { ...cell.font, color: { argb: COLOURS.negativeFg } }
          }
        }
        cell.alignment = { horizontal: "right" }
      })

      if (bold) {
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOURS.accentBg } }
        })
      }
    })
  }

  // â”€â”€ SHEET 3: Cash Flow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (fcfSchedule.length > 0) {
    const cfSheet = wb.addWorksheet("Free Cash Flow")
    cfSheet.columns = [
      { width: 28 },
      ...fcfSchedule.map(() => ({ width: 18 })),
    ]

    const cfHeaderRow = cfSheet.addRow(["Cash Flow Schedule", ...years.slice(0, fcfSchedule.length)])
    applyHeaderStyle(cfHeaderRow, COLOURS.headerBg, COLOURS.headerFg, 12)

    const cfData = [
      { label: "Free Cash Flow (UFCF)", values: fcfSchedule, bold: true },
      { label: "PV of Free Cash Flow",  values: pvFcfs,      bold: false },
    ]

    cfData.forEach(({ label, values, bold }) => {
      const row = cfSheet.addRow([label, ...values])
      applyDataRowStyle(row, bold, bold ? COLOURS.accentBg : undefined)
      values.forEach((val, i) => {
        const cell = row.getCell(i + 2)
        cell.numFmt = cFmt
        cell.alignment = { horizontal: "right" }
        if (val < 0) cell.font = { ...cell.font, color: { argb: COLOURS.negativeFg } }
      })
    })

    // Cumulative FCF
    cfSheet.addRow([])
    const cumulFCF: number[] = []
    fcfSchedule.forEach((v, i) => cumulFCF.push((cumulFCF[i - 1] ?? 0) + v))
    const cumulRow = cfSheet.addRow(["Cumulative FCF", ...cumulFCF])
    applyDataRowStyle(cumulRow, true)
    cumulFCF.forEach((val, i) => {
      const cell = cumulRow.getCell(i + 2)
      cell.numFmt = cFmt
      cell.alignment = { horizontal: "right" }
      if (val < 0) cell.font = { ...cell.font, color: { argb: COLOURS.negativeFg } }
    })
  }

  
  // -- SHEET 3b: Balance Sheet
  if (balanceSheet.length > 0) {
    const bsSheet = wb.addWorksheet("Balance Sheet")
    bsSheet.columns = [{ width: 32 }, ...balanceSheet.map(() => ({ width: 18 }))]
    const bsHdr = bsSheet.addRow(["Balance Sheet", ...balanceSheet.map((r) => `Year ${r.year}`)])
    applyHeaderStyle(bsHdr, COLOURS.headerBg, COLOURS.headerFg, 12)
    const bsRows = [
      { key: "cash",                  label: "Cash & Equivalents" },
      { key: "accounts_receivable",   label: "Accounts Receivable" },
      { key: "fixed_assets",          label: "Fixed Assets (net)" },
      { key: "total_assets",          label: "Total Assets", bold: true },
      { key: "accounts_payable",      label: "Accounts Payable" },
      { key: "debt",                  label: "Debt" },
      { key: "total_liabilities",     label: "Total Liabilities", bold: true },
      { key: "equity",                label: "Equity" },
      { key: "retained_earnings",     label: "Retained Earnings" },
      { key: "total_equity_liabilities", label: "Total Liabilities + Equity", bold: true },
    ]
    bsRows.forEach(({ key, label, bold }) => {
      const row = bsSheet.addRow([label, ...balanceSheet.map((r) => r[key] ?? null)])
      applyDataRowStyle(row, bold ?? false)
      balanceSheet.forEach((_, i) => {
        const cell = row.getCell(i + 2)
        cell.numFmt = cFmt
        cell.alignment = { horizontal: "right" }
      })
      if (bold) row.eachCell((c) => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOURS.accentBg } } })
    })
  }

  // -- SHEET 3c: Cash Flow Statement
  if (cashFlow.length > 0) {
    const cfStmtSheet = wb.addWorksheet("Cash Flow Statement")
    cfStmtSheet.columns = [{ width: 36 }, ...cashFlow.map(() => ({ width: 18 }))]
    const cfStmtHdr = cfStmtSheet.addRow(["Cash Flow Statement", ...cashFlow.map((r) => `Year ${r.year}`)])
    applyHeaderStyle(cfStmtHdr, COLOURS.headerBg, COLOURS.headerFg, 12)
    const cfRows = [
      { key: "net_income",     label: "Net Income" },
      { key: "depreciation",   label: "Add: Depreciation" },
      { key: "wc_change",      label: "Working Capital Change" },
      { key: "cfo",            label: "Cash from Operations (CFO)", bold: true },
      { key: "capex",          label: "Capital Expenditure" },
      { key: "cfi",            label: "Cash from Investing (CFI)", bold: true },
      { key: "debt_repayment", label: "Debt Repayment" },
      { key: "cff",            label: "Cash from Financing (CFF)", bold: true },
      { key: "net_cash_flow",  label: "Net Cash Flow", bold: true },
      { key: "closing_cash",   label: "Closing Cash Balance", bold: true },
    ]
    cfRows.forEach(({ key, label, bold }) => {
      const row = cfStmtSheet.addRow([label, ...cashFlow.map((r) => r[key] ?? null)])
      applyDataRowStyle(row, bold ?? false)
      cashFlow.forEach((_, i) => {
        const cell = row.getCell(i + 2)
        cell.numFmt = cFmt
        cell.alignment = { horizontal: "right" }
      })
      if (bold) row.eachCell((c) => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOURS.accentBg } } })
    })
  }
// â”€â”€ SHEET 4: Scenarios â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (Object.keys(scenarios).length > 0) {
    const scenSheet = wb.addWorksheet("Scenario Analysis")
    scenSheet.columns = [{ width: 28 }, { width: 22 }, { width: 22 }, { width: 22 }]

    const scenHeaderRow = scenSheet.addRow(["Scenario Analysis", "Bear Case", "Base Case", "Bull Case"])
    applyHeaderStyle(scenHeaderRow, COLOURS.headerBg, COLOURS.headerFg, 12)
    scenHeaderRow.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0392B" } }
    scenHeaderRow.getCell(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOURS.subHeaderBg } }
    scenHeaderRow.getCell(4).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "27AE60" } }

    const scenMetrics: { key: string; label: string; fmt: string }[] = [
      { key: "enterprise_value", label: "Enterprise Value", fmt: cFmt },
      { key: "equity_value",     label: "Equity Value",     fmt: cFmt },
      { key: "year1_revenue",    label: "Year 1 Revenue",   fmt: cFmt },
      { key: "final_fcf",        label: "Final Year FCF",   fmt: cFmt },
      { key: "irr",              label: "IRR",               fmt: "0.0%" },
      { key: "moic",             label: "MOIC",              fmt: '0.00"x"' },
    ]

    scenMetrics.forEach(({ key, label, fmt }) => {
      const bear = scenarios.bear?.[key]
      const base = scenarios.base?.[key]
      const bull = scenarios.bull?.[key]
      if (bear == null && base == null && bull == null) return

      const row = scenSheet.addRow([label, bear ?? "â€”", base ?? "â€”", bull ?? "â€”"])
      applyDataRowStyle(row, key === "enterprise_value")
      ;[2, 3, 4].forEach((col) => {
        const cell = row.getCell(col)
        cell.numFmt = fmt
        cell.alignment = { horizontal: "right" }
      })
    })
  }

  // â”€â”€ SHEET 5: Sensitivity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (sensitivity) {
    const sensSheet = wb.addWorksheet("Sensitivity Analysis")
    const drs  = sensitivity.discount_rates as number[]
    const tgrs = sensitivity.terminal_growth_rates as number[]
    const matrix = sensitivity.npv_matrix as number[][]
    const baseNpv = sensitivity.base_npv as number

    sensSheet.columns = [
      { width: 22 },
      ...tgrs.map(() => ({ width: 18 })),
    ]

    // Title
    sensSheet.addRow(["Enterprise Value Sensitivity Analysis â€” Discount Rate vs Terminal Growth Rate"])
    sensSheet.mergeCells(1, 1, 1, tgrs.length + 1)
    const titleRow = sensSheet.getRow(1)
    applyHeaderStyle(titleRow, COLOURS.headerBg, COLOURS.headerFg, 12)
    titleRow.height = 26

    sensSheet.addRow([])

    // Header row with TGR values
    const tgrRow = sensSheet.addRow(["DR \\ TGR â†’", ...tgrs.map((t) => `${t}%`)])
    applyHeaderStyle(tgrRow, COLOURS.subHeaderBg, COLOURS.subHeaderFg)
    tgrRow.getCell(1).value = "Discount Rate â†“ \\ Terminal Growth â†’"

    // Data rows
    drs.forEach((dr, i) => {
      const row = sensSheet.addRow([`${dr}%`, ...matrix[i]])
      row.getCell(1).font = { bold: true, size: 10, color: { argb: COLOURS.boldFg } }
      row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOURS.accentBg } }
      row.height = 18

      matrix[i].forEach((val, j) => {
        const cell = row.getCell(j + 2)
        cell.numFmt = cFmt
        cell.alignment = { horizontal: "right" }

        const isBase = Math.abs(val - baseNpv) < 1
        if (isBase) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3CD" } }
          cell.font = { bold: true, size: 10, color: { argb: "856404" } }
        } else if (val < 0) {
          cell.font = { size: 10, color: { argb: COLOURS.negativeFg } }
        } else {
          cell.font = { size: 10, color: { argb: COLOURS.positiveFg } }
        }

        cell.border = {
          top:    { style: "hair", color: { argb: COLOURS.borderClr } },
          left:   { style: "hair", color: { argb: COLOURS.borderClr } },
          bottom: { style: "hair", color: { argb: COLOURS.borderClr } },
          right:  { style: "hair", color: { argb: COLOURS.borderClr } },
        }
      })
    })

    // Legend
    sensSheet.addRow([])
    const legendRow = sensSheet.addRow(["â˜… Yellow = Base case"])
    legendRow.getCell(1).font = { italic: true, size: 9, color: { argb: "856404" } }
  }

  // â”€â”€ SHEET 6: Inputs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const inputSheet = wb.addWorksheet("Model Inputs")
  inputSheet.columns = [{ width: 30 }, { width: 28 }]

  const inputHeaderRow = inputSheet.addRow(["Model Inputs", "Value"])
  applyHeaderStyle(inputHeaderRow, COLOURS.headerBg, COLOURS.headerFg, 12)

  const s2 = model.step2_revenue as Record<string, unknown>
  const s3 = model.step3_costs  as Record<string, unknown>
  const s4 = model.step4_funding as Record<string, unknown>

  const inputSections = [
    {
      title: "Business Information",
      rows: [
        ["Business name",   s1.businessName],
        ["Industry",        s1.industry],
        ["Sub-sector",      s1.subSector],
        ["Business stage",  s1.businessStage],
        ["Country",         s1.country],
        ["Currency",        s1.currency],
      ],
    },
    {
      title: "Revenue Assumptions",
      rows: [
        ["Revenue model",     s2.revenueModel],
        ["Projection period", s2.projectionYears],
        ["Year 1 revenue",    s2.year1Revenue],
        ["Year 2 revenue",    s2.year2Revenue],
        ["Year 3 revenue",    s2.year3Revenue],
        ["Y1 growth %",       s2.revenueGrowthY1],
        ["Y2 growth %",       s2.revenueGrowthY2],
        ["Y3 growth %",       s2.revenueGrowthY3],
        ["Annual churn %",    s2.churnRate],
      ],
    },
    {
      title: "Cost Structure",
      rows: [
        ["Gross margin %",    s3.grossMargin],
        ["COGS %",            s3.cogsPercent],
        ["Total payroll",     s3.salariesTotal],
        ["Marketing %",       s3.marketingBudgetPct],
        ["R&D %",             s3.rdBudgetPct],
        ["Cloud infra (mo)",  s3.cloudInfraMonthly],
        ["Office rent (mo)",  s3.officeRentMonthly],
        ["EBITDA margin Y1",  s3.ebitdaMarginY1],
        ["EBITDA margin Y3",  s3.ebitdaMarginY3],
        ["CAPEX Year 1",      s3.capexY1],
        ["Depreciation %",    s3.depreciationRate],
      ],
    },
    {
      title: "Funding & Exit",
      rows: [
        ["Funding stage",       s4.fundingStage],
        ["Total raised",        s4.totalFundingRaised],
        ["Current cash",        s4.currentCash],
        ["Monthly burn rate",   s4.monthlyBurnRate],
        ["Runway (months)",     s4.runwayMonths],
        ["Target raise",        s4.targetRaiseAmount],
        ["Discount rate %",     s4.discountRate],
        ["Terminal growth %",   s4.terminalGrowthRate],
        ["Exit horizon",        s4.exitHorizonYears],
        ["Target exit multiple", s4.targetExitMultiple],
      ],
    },
  ]

  inputSections.forEach(({ title, rows }) => {
    inputSheet.addRow([])
    addSectionTitle(inputSheet, title, 2)
    rows.forEach(([label, value]) => {
      if (value == null || value === "") return
      const row = inputSheet.addRow([label, value])
      applyDataRowStyle(row)
      row.getCell(1).font = { bold: true, size: 10 }
    })
  })

  return wb
}

// â”€â”€ API Route â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    // Fetch model input
    const { data: model, error: modelError } = await supabase
      .from("model_inputs")
      .select("*")
      .eq("id", id)
      .single()

    if (modelError || !model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    // Fetch model output
    const { data: output } = await supabase
      .from("model_outputs")
      .select("*")
      .eq("model_input_id", id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!output) {
      return NextResponse.json({ error: "No model output found. Generate the model first." }, { status: 404 })
    }

    const currency = (model.step1_business as Record<string, string>).currency ?? "GBP"
    const businessName = (model.step1_business as Record<string, string>).businessName ?? "Model"

    // Build workbook
    const wb = await buildWorkbook(model, output, currency)

    // Write to buffer
    const buffer = await wb.xlsx.writeBuffer()

    const fileName = `${businessName.replace(/[^a-zA-Z0-9]/g, "_")}_FinModel.xlsx`

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.byteLength.toString(),
      },
    })

  } catch (error) {
    console.error("Excel export error:", error)
    return NextResponse.json({ error: "Export failed", detail: String(error) }, { status: 500 })
  }
}




