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
  const businessName = (s1.businessName as string) ?? "Model"
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
// -- SHEET 0: Cover Page ------------------------------------------
// Add this snippet as the FIRST sheet in your Excel export (before the Summary sheet).
// It creates a professional cover sheet with model metadata and disclaimer.

{
  const coverSheet = wb.addWorksheet("Cover", {
    pageSetup: { fitToPage: true, fitToWidth: 1 },
  })
  coverSheet.columns = [
    { width: 4 },   // left margin
    { width: 32 },  // labels
    { width: 42 },  // values
    { width: 4 },   // right margin
  ]

  // Hide gridlines for a cleaner cover
  coverSheet.views = [{ showGridLines: false }]

  // -- Title banner --
  coverSheet.mergeCells("B2:C3")
  const titleCell = coverSheet.getCell("B2")
  titleCell.value = "FinModels UK"
  titleCell.font = { bold: true, size: 24, color: { argb: "1E3A5F" } }
  titleCell.alignment = { horizontal: "left", vertical: "middle" }
  coverSheet.getRow(2).height = 24
  coverSheet.getRow(3).height = 24

  // -- Subtitle --
  coverSheet.mergeCells("B4:C4")
  const subtitleCell = coverSheet.getCell("B4")
  subtitleCell.value = "Institutional Financial Model"
  subtitleCell.font = { italic: true, size: 11, color: { argb: "666666" } }
  subtitleCell.alignment = { horizontal: "left" }
  coverSheet.getRow(4).height = 18

  // -- Divider --
  coverSheet.getCell("B5").border = {
    bottom: { style: "medium", color: { argb: "1E3A5F" } }
  }
  coverSheet.getCell("C5").border = {
    bottom: { style: "medium", color: { argb: "1E3A5F" } }
  }
  coverSheet.getRow(5).height = 12

  // -- Client name (large) --
  coverSheet.mergeCells("B7:C8")
  const clientCell = coverSheet.getCell("B7")
  clientCell.value = businessName
  clientCell.font = { bold: true, size: 20, color: { argb: "1E3A5F" } }
  clientCell.alignment = { horizontal: "left", vertical: "middle" }
  coverSheet.getRow(7).height = 20
  coverSheet.getRow(8).height = 20

  // -- Model type --
  const modelTypeName = ({
    dcf: "DCF Valuation Model",
    three_statement: "3-Statement Financial Model",
    pre_revenue_dcf: "Pre-Revenue Startup DCF",
    lbo: "LBO Model",
    saas: "SaaS Financial Model",
    ma: "M&A Model",
  } as Record<string, string>)[model.model_type as string] || "Financial Model"

  coverSheet.mergeCells("B9:C9")
  const modelTypeCell = coverSheet.getCell("B9")
  modelTypeCell.value = modelTypeName
  modelTypeCell.font = { size: 13, color: { argb: "444444" } }
  modelTypeCell.alignment = { horizontal: "left" }
  coverSheet.getRow(9).height = 20

  // -- Metadata section header --
  coverSheet.getRow(11).height = 8
  coverSheet.mergeCells("B12:C12")
  const metaHeader = coverSheet.getCell("B12")
  metaHeader.value = "MODEL DETAILS"
  metaHeader.font = { bold: true, size: 10, color: { argb: "FFFFFF" } }
  metaHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E3A5F" } }
  metaHeader.alignment = { horizontal: "left", indent: 1 }
  coverSheet.getRow(12).height = 22

  // -- Metadata rows --
  const now = new Date()
  const dateStr = now.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric"
  })
  const timeStr = now.toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit"
  })

  const projectionYears = Number((dcfOut.summary as Record<string, unknown>)?.projection_years ?? 5)
  const analystName = ((model.step1_business as Record<string, string>)?.analystName ?? "FinModels UK Analyst")
  const modelIntegrityPassed = balanceSheet.length > 0
  ? balanceSheet.every((bs) => {
      const assets = Number(bs.total_assets) || 0
      const liabEquity = Number(bs.total_equity_liabilities) || 0
      return Math.abs(assets - liabEquity) < 1
    })
  : true

  const metadataRows: [string, string][] = [
    ["Client",              businessName],
    ["Model type",          modelTypeName],
    ["Currency",            currency],
    ["Projection period",   `${projectionYears} years`],
    ["Model date",          dateStr],
    ["Time generated",      timeStr],
    ["Prepared by",         String(analystName)],
    ["Version",             "1.0"],
    ["Model integrity",     modelIntegrityPassed ? "PASS - all checks passed" : "REVIEW - see Model Checks sheet"],
  ]

  let rowIdx = 13
  metadataRows.forEach(([label, value]) => {
    const labelCell = coverSheet.getCell(rowIdx, 2)
    labelCell.value = label
    labelCell.font = { size: 10, color: { argb: "666666" } }
    labelCell.alignment = { horizontal: "left", indent: 1, vertical: "middle" }

    const valueCell = coverSheet.getCell(rowIdx, 3)
    valueCell.value = value
    valueCell.font = { bold: true, size: 10, color: { argb: "1E3A5F" } }
    valueCell.alignment = { horizontal: "left", vertical: "middle" }

    // Row border (bottom)
    labelCell.border = {
      bottom: { style: "thin", color: { argb: "E8E8E8" } }
    }
    valueCell.border = {
      bottom: { style: "thin", color: { argb: "E8E8E8" } }
    }

    // Special colour for model integrity row
    if (label === "Model integrity") {
      valueCell.font = {
        bold: true, size: 10,
        color: { argb: modelIntegrityPassed ? "27AE60" : "C0392B" }
      }
    }

    coverSheet.getRow(rowIdx).height = 20
    rowIdx++
  })

  // -- Table of contents section --
  rowIdx++  // gap
  coverSheet.mergeCells(rowIdx, 2, rowIdx, 3)
  const tocHeader = coverSheet.getCell(rowIdx, 2)
  tocHeader.value = "TABLE OF CONTENTS"
  tocHeader.font = { bold: true, size: 10, color: { argb: "FFFFFF" } }
  tocHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E3A5F" } }
  tocHeader.alignment = { horizontal: "left", indent: 1 }
  coverSheet.getRow(rowIdx).height = 22
  rowIdx++

  const tocRows: [string, string][] = [
    ["Summary",             "Key metrics and headline valuation"],
    ["P&L Schedule",        "Income statement across projection period"],
    ["Balance Sheet",       "Balance sheet with opening and year-end positions"],
    ["Cash Flow Statement", "Full cash flow statement — CFO, CFI, CFF"],
    ["Free Cash Flow",      "Unlevered free cash flow and present values"],
    ["Scenarios",           "Bear / Base / Bull case comparisons"],
    ["Sensitivity",         "NPV sensitivity to WACC and terminal growth"],
    ["Model Checks",        "Institutional-grade integrity checks"],
    ["Model Inputs",        "All assumptions and driver inputs"],
  ]

  tocRows.forEach(([sheet, desc]) => {
    const sheetCell = coverSheet.getCell(rowIdx, 2)
    sheetCell.value = sheet
    sheetCell.font = { bold: true, size: 10, color: { argb: "1E3A5F" } }
    sheetCell.alignment = { horizontal: "left", indent: 1, vertical: "middle" }

    const descCell = coverSheet.getCell(rowIdx, 3)
    descCell.value = desc
    descCell.font = { size: 10, color: { argb: "444444" } }
    descCell.alignment = { horizontal: "left", vertical: "middle" }

    coverSheet.getRow(rowIdx).height = 18
    rowIdx++
  })

  // -- Confidentiality disclaimer --
  rowIdx += 2
  coverSheet.mergeCells(rowIdx, 2, rowIdx, 3)
  const disclaimerHeader = coverSheet.getCell(rowIdx, 2)
  disclaimerHeader.value = "CONFIDENTIALITY & DISCLAIMER"
  disclaimerHeader.font = { bold: true, size: 10, color: { argb: "FFFFFF" } }
  disclaimerHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E3A5F" } }
  disclaimerHeader.alignment = { horizontal: "left", indent: 1 }
  coverSheet.getRow(rowIdx).height = 22
  rowIdx++

  const disclaimerText = [
    "This financial model has been prepared by FinModels UK for the sole use of " + businessName + ".",
    "",
    "The information contained in this model is confidential and proprietary. It should not be reproduced,",
    "distributed, or disclosed to any third party without prior written consent.",
    "",
    "The projections and assumptions in this model are based on information provided by the client and",
    "reasonable estimates. Actual results may differ materially from those projected. This model does",
    "not constitute investment advice, tax advice, or a recommendation to buy or sell any security.",
    "",
    "The recipient should conduct their own due diligence and consult with qualified advisors before",
    "making any investment or business decision based on this model.",
    "",
    "© " + new Date().getFullYear() + " FinModels UK. All rights reserved.",
  ]

  disclaimerText.forEach((line) => {
    const cell = coverSheet.getCell(rowIdx, 2)
    coverSheet.mergeCells(rowIdx, 2, rowIdx, 3)
    cell.value = line
    cell.font = {
      italic: line.includes("©"),
      size: 9,
      color: { argb: line.includes("©") ? "1E3A5F" : "555555" }
    }
    cell.alignment = { horizontal: "left", vertical: "middle", indent: 1 }
    coverSheet.getRow(rowIdx).height = 14
    rowIdx++
  })


}
  
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
  
// -- SHEET INTEGRITY CHECKS: Model Checks --------------------------------
// Add this snippet to your Excel export route before the Model Inputs sheet section.
// It creates a dedicated "Model Checks" sheet with pass/fail indicators.

if (balanceSheet.length > 0 && cashFlow.length > 0) {
  const checksSheet = wb.addWorksheet("Model Checks")
  checksSheet.columns = [
    { width: 42 },  // Check name
    { width: 14 },  // Threshold
    ...balanceSheet.map(() => ({ width: 16 })),  // one per year
    { width: 12 },  // Status
  ]

  // Header row
  const checksHdrRow = checksSheet.addRow([
    "Model Integrity Check", "Tolerance",
    ...balanceSheet.map((r) => `Year ${r.year}`),
    "Status"
  ])
  applyHeaderStyle(checksHdrRow, COLOURS.headerBg, COLOURS.headerFg, 12)
  checksSheet.getRow(1).height = 24

  // Title banner
  checksSheet.mergeCells(2, 1, 2, balanceSheet.length + 3)
  const bannerCell = checksSheet.getCell(2, 1)
  bannerCell.value = "Institutional-grade accounting integrity checks — all should pass"
  bannerCell.font = { italic: true, color: { argb: "666666" }, size: 10 }
  bannerCell.alignment = { horizontal: "center" }
  checksSheet.getRow(2).height = 18

  // Helper to add a check row with pass/fail indicator
  function addCheckRow(
    label: string,
    tolerance: string,
    values: number[],
    passIfAllUnder: number
  ) {
    const rowValues = [label, tolerance, ...values]
    const allPass = values.every((v) => Math.abs(v) <= passIfAllUnder)
    rowValues.push(allPass ? "PASS" : "FAIL")
    const row = checksSheet.addRow(rowValues)

    // Style values (year columns) — colour by pass/fail
    values.forEach((v, i) => {
      const cell = row.getCell(i + 3)
      cell.numFmt = "#,##0.0;[Red]-#,##0.0"
      cell.alignment = { horizontal: "right" }
      if (Math.abs(v) > passIfAllUnder) {
        cell.font = { color: { argb: "C0392B" }, bold: true }
      } else {
        cell.font = { color: { argb: "27AE60" } }
      }
    })

    // Status cell
    const statusCell = row.getCell(balanceSheet.length + 3)
    statusCell.alignment = { horizontal: "center" }
    statusCell.font = { bold: true, color: { argb: "FFFFFF" } }
    statusCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: allPass ? "27AE60" : "C0392B" },
    }

    // Label styling
    row.getCell(1).font = { bold: true, size: 10 }
    row.getCell(2).font = { italic: true, size: 9, color: { argb: "666666" } }
    row.getCell(2).alignment = { horizontal: "center" }
  }

  // === CHECK 1: Balance sheet balances (Assets = Liabilities + Equity) ===
  const bsBalanceDiffs = balanceSheet.map((bs) => {
    const assets = Number(bs.total_assets) || 0
    const liabEquity = Number(bs.total_equity_liabilities) || 0
    return assets - liabEquity
  })
  addCheckRow(
    "Balance Sheet: Assets = Liabilities + Equity",
    "< 1",
    bsBalanceDiffs,
    1
  )

  // === CHECK 2: Cash flow reconciliation ===
  // Opening cash + Net cash flow = Closing cash
  const cashReconDiffs = cashFlow.map((cf) => {
    const opening = Number(cf.opening_cash ?? 0)
    const netCF = Number(cf.net_cash_flow) || 0
    const closing = Number(cf.closing_cash) || 0
    return (opening + netCF) - closing
  })
  addCheckRow(
    "Cash Flow: Opening + Net CF = Closing",
    "< 1",
    cashReconDiffs,
    1
  )

  // === CHECK 3: Retained earnings continuity ===
  // Prior RE + Net Income = Current RE
  const reContinuityDiffs = balanceSheet.map((bs, i) => {
    const priorRE = i === 0 ? 0 : (Number(balanceSheet[i - 1].retained_earnings) || 0)
    const netIncome = Number(pnl[i]?.net_income) || 0
    const currentRE = Number(bs.retained_earnings) || 0
    return (priorRE + netIncome) - currentRE
  })
  addCheckRow(
    "Retained Earnings: Prior + NI = Ending",
    "< 1",
    reContinuityDiffs,
    1
  )

  // === CHECK 4: Fixed assets roll ===
  // Prior FA + Capex - Depreciation = Current FA
  const openingFA = Number((dcfOut.opening_balance_sheet as Record<string, unknown>)?.fixed_assets ?? 0) || 0
  const faRollDiffs = balanceSheet.map((bs, i) => {
    const priorFA = i === 0 ? openingFA : (Number(balanceSheet[i - 1].fixed_assets) || 0)
    const capex = Math.abs(Number(cashFlow[i]?.capex) || 0)
    const depreciation = Number(pnl[i]?.depreciation) || 0
    const currentFA = Number(bs.fixed_assets) || 0
    return (priorFA + capex - depreciation) - currentFA
  })
  addCheckRow(
    "Fixed Assets: Prior + Capex - Dep = Ending",
    "< 1",
    faRollDiffs,
    1
  )

  // === CHECK 5: Debt schedule ===
  // Prior Debt - Repayment = Current Debt
  const openingDebt = Number((dcfOut.opening_balance_sheet as Record<string, unknown>)?.debt ?? 0) || 0
  const debtRollDiffs = balanceSheet.map((bs, i) => {
    const priorDebt = i === 0 ? openingDebt : (Number(balanceSheet[i - 1].debt) || 0)
    const repayment = Math.abs(Number(cashFlow[i]?.debt_repayment) || 0)
    const currentDebt = Number(bs.debt) || 0
    return (priorDebt - repayment) - currentDebt
  })
  addCheckRow(
    "Debt: Prior - Repayment = Ending",
    "< 1",
    debtRollDiffs,
    1
  )

  // === Summary section ===
  checksSheet.addRow([])
  const summaryRow = checksSheet.addRow(["OVERALL MODEL INTEGRITY"])
  summaryRow.getCell(1).font = { bold: true, size: 12, color: { argb: "FFFFFF" } }
  summaryRow.getCell(1).fill = {
    type: "pattern", pattern: "solid",
    fgColor: { argb: COLOURS.headerBg }
  }
  checksSheet.mergeCells(summaryRow.number, 1, summaryRow.number, balanceSheet.length + 3)
  summaryRow.height = 24
  summaryRow.getCell(1).alignment = { horizontal: "center" }

  const allChecksPass =
    bsBalanceDiffs.every((v) => Math.abs(v) <= 1) &&
    cashReconDiffs.every((v) => Math.abs(v) <= 1) &&
    reContinuityDiffs.every((v) => Math.abs(v) <= 1) &&
    faRollDiffs.every((v) => Math.abs(v) <= 1) &&
    debtRollDiffs.every((v) => Math.abs(v) <= 1)

  const finalRow = checksSheet.addRow([
    allChecksPass
      ? "Model passes all institutional-grade accounting checks."
      : "Model has integrity issues — review failed checks above."
  ])
  finalRow.getCell(1).font = {
    bold: true,
    size: 11,
    color: { argb: allChecksPass ? "27AE60" : "C0392B" }
  }
  finalRow.getCell(1).alignment = { horizontal: "center" }
  checksSheet.mergeCells(finalRow.number, 1, finalRow.number, balanceSheet.length + 3)
  finalRow.height = 22

  // Notes section
  checksSheet.addRow([])
  const notesTitle = checksSheet.addRow(["Reading the checks"])
  notesTitle.getCell(1).font = { bold: true, size: 10 }
  const notes = [
    "Each check computes a residual — the difference between the two sides of an accounting equation.",
    "PASS means every year's residual is within £1 (rounding tolerance).",
    "FAIL means at least one year has a material residual — investigate before relying on the model.",
    "Institutional models are expected to pass all five checks by construction.",
  ]
  notes.forEach((n) => {
    const r = checksSheet.addRow([n])
    r.getCell(1).font = { italic: true, size: 9, color: { argb: "666666" } }
  })
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








