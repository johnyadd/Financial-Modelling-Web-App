import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Anthropic from "@anthropic-ai/sdk"
import ExcelJS from "exceljs"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PROMPT = `You are a financial data extraction expert. Extract ALL financial figures from this document.

CRITICAL: if the document covers more than one company, return one object per company in
the entities array. NEVER combine or sum figures across companies.

Return ONLY valid JSON with this structure:
{
  "currency": "GBP",
  "entities": [
    {
      "company_name": null,
      "years": [],
      "income_statement": { "revenue": [], "cost_of_goods_sold": [], "gross_profit": [], "gross_margin_pct": [], "operating_expenses": [], "salaries": [], "ebitda": [], "depreciation_amortisation": [], "ebit": [], "interest_expense": [], "profit_before_tax": [], "tax": [], "net_profit": [], "net_margin_pct": [] },
      "balance_sheet": { "cash": [], "accounts_receivable": [], "inventory": [], "total_current_assets": [], "fixed_assets": [], "total_assets": [], "accounts_payable": [], "short_term_debt": [], "total_current_liabilities": [], "long_term_debt": [], "total_liabilities": [], "equity": [], "retained_earnings": [], "total_equity_liabilities": [] },
      "cash_flow": { "operating_cash_flow": [], "capex": [], "investing_cash_flow": [], "financing_cash_flow": [], "net_cash_flow": [], "closing_cash": [] },
      "debt_schedule": null,
      "saas_metrics": null,
      "valuation_inputs": null,
      "sector_hint": null
    }
  ],
  "data_coverage": [],
  "notes": ""
}

OPTIONAL SECTIONS - populate only when the document actually contains them, otherwise leave null:
- debt_schedule: { "tranches": [ { "name": "", "principal": 0, "interest_rate_pct": 0, "maturity_year": "", "amortisation": "" } ] }
- saas_metrics: { "arr": [], "customers": [], "arpu": [], "monthly_churn_pct": [], "cac": [], "ltv": [] }
- valuation_inputs: { "shares_outstanding": [], "share_price": null, "tax_rate_pct": null, "market_cap": null }
- sector_hint: your best read of the industry, e.g. "Technology - SaaS", "Retail", "Manufacturing"

DATA COVERAGE: list which model types this document can genuinely support, from:
["three_statement", "dcf", "lbo", "ma", "saas"]
Include a type only if the required inputs are present. LBO needs a debt schedule.
SaaS needs customer or recurring-revenue metrics. M&A needs two or more entities.
Do not list a type you cannot support - it is more useful to say what is missing.

All monetary values in thousands. Return ONLY the JSON.`

async function fromText(text: string) {
  const r = await anthropic.messages.create({ model: "claude-sonnet-4-6", max_tokens: 16000, messages: [{ role: "user", content: `${PROMPT}\n\nDocument:\n${text}` }] })
  return JSON.parse((r.content[0] as { text: string }).text.replace(/```json|```/g, "").trim())
}

async function fromPdf(b64: string) {
  const r = await anthropic.messages.create({ model: "claude-sonnet-4-6", max_tokens: 16000, messages: [{ role: "user", content: [{ type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } }, { type: "text", text: PROMPT }] }] })
  return JSON.parse((r.content[0] as { text: string }).text.replace(/```json|```/g, "").trim())
}

async function xlsxToText(buf: ArrayBuffer): Promise<string> {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(Buffer.from(buf) as any)
  let text = ""
  wb.eachSheet((sheet) => {
    text += `\n\n=== ${sheet.name} ===\n`
    sheet.eachRow((row) => {
      const vals: string[] = []
      row.eachCell({ includeEmpty: false }, (cell) => {
        const v = cell.value
        if (v == null) vals.push("")
        else if (typeof v === "object" && "richText" in v) vals.push((v as { richText: {text:string}[] }).richText.map(r=>r.text).join(""))
        else if (typeof v === "object" && "result" in v) vals.push(String((v as {result:unknown}).result ?? ""))
        else vals.push(String(v))
      })
      if (vals.some(v=>v.trim())) text += vals.join("\t") + "\n"
    })
  })
  return text
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

    const { modelInputId } = await request.json()
    const adminClient = createAdminClient()

    const { data: statements } = await adminClient.from("uploaded_statements").select("*").eq("model_input_id", modelInputId).in("parse_status", ["pending", "failed"])
    if (!statements?.length) return NextResponse.json({ error: "Nothing to process" }, { status: 404 })

    await adminClient.from("uploaded_statements").update({ parse_status: "processing" }).eq("model_input_id", modelInputId)

    const extracted: Record<string, unknown>[] = []

    for (const s of statements) {
      try {
        const { data: fd } = await adminClient.storage.from("financial-statements").download(s.storage_path)
        if (!fd) throw new Error("Download failed")
        const buf = await fd.arrayBuffer()
        const name = s.file_name.toLowerCase()
        const type = s.file_type ?? ""
        let data: Record<string, unknown>
        if (type.includes("pdf") || name.endsWith(".pdf")) {
          data = await fromPdf(Buffer.from(buf).toString("base64"))
        } else if (type.includes("sheet") || type.includes("excel") || name.endsWith(".xlsx") || name.endsWith(".xls")) {
          data = await fromText(await xlsxToText(buf))
        } else {
          data = await fromText(Buffer.from(buf).toString("utf-8"))
        }
        extracted.push(data)
        await adminClient.from("uploaded_statements").update({ parse_status: "complete", extracted_data: data, extraction_model: "claude-sonnet-4-6", parsed_at: new Date().toISOString() }).eq("id", s.id)
      } catch (err) {
        await adminClient.from("uploaded_statements").update({ parse_status: "failed", extraction_notes: String(err) }).eq("id", s.id)
      }
    }

    if (extracted.length > 0) {
      // Gather entities across EVERY uploaded file. The old code read extracted[0]
      // only, so second and subsequent files were parsed, stored and then discarded.
      type Ent = Record<string, Record<string, unknown[]>> & { company_name?: string; sector_hint?: string; years?: string[] }
      const allEntities: Ent[] = []
      const coverage = new Set<string>()
      let currency = "GBP"
      for (const doc of extracted) {
        const d = doc as Record<string, unknown>
        if (typeof d.currency === "string") currency = d.currency
        for (const c of ((d.data_coverage as string[]) ?? [])) coverage.add(c)
        for (const e of ((d.entities as Ent[]) ?? [])) allEntities.push(e)
      }

      // NEVER combine entities. Map the first; the review step lets the user switch.
      const p = allEntities[0] ?? ({} as Ent)
      const is = p.income_statement ?? {}; const bs = p.balance_sheet ?? {}; const cf = p.cash_flow ?? {}
      const years = p.years ?? []; const li = Math.max(years.length - 1, 0)
      const last = (a: unknown[]) => typeof a?.[li] === "number" ? a[li] as number : 0
      const gr = (a: unknown[]) => {
        if (!a || a.length < 2) return 0
        const pv = Number(a[a.length - 2]); const cv = Number(a[a.length - 1])
        if (!pv) return 0
        // Cap at 100%: a one-off historical spike should not become a forecast.
        return Math.max(Math.min(((cv - pv) / Math.abs(pv)) * 100, 100), -50)
      }

      const rev = (is.revenue as number[]) ?? []; const cogs = (is.cost_of_goods_sold as number[]) ?? []
      const ebitda = (is.ebitda as number[]) ?? []

      // Project forward from the last actual. The old code set all three years to
      // the same historical figure while also writing non-zero growth rates, so the
      // revenues and the growth assumptions contradicted each other.
      const g1 = gr(rev); const g2 = g1 * 0.9; const g3 = g1 * 0.8
      const base = last(rev)
      const y1 = Math.round(base * (1 + g1 / 100))
      const y2 = Math.round(y1 * (1 + g2 / 100))
      const y3 = Math.round(y2 * (1 + g3 / 100))

      // Model type follows what the document can actually support.
      const modelType = coverage.has("three_statement") ? "three_statement"
        : (Array.from(coverage)[0] ?? "three_statement")

      await adminClient.from("model_inputs").update({
        name: p.company_name ? `${p.company_name} \u2014 3-Statement Model` : null,
        step1_business: { businessName: p.company_name ?? "", currency, industry: p.sector_hint ?? "", subSector: "", businessStage: "Established (Profitable)", country: "United Kingdom" },
        step2_revenue:  { modelType, projectionYears: "5 years", revenueModel: "Product Sales", revenueEntryMode: "topLine", year1Revenue: y1, year2Revenue: y2, year3Revenue: y3, revenueGrowthY1: Math.round(g1 * 10) / 10, revenueGrowthY2: Math.round(g2 * 10) / 10, revenueGrowthY3: Math.round(g3 * 10) / 10 },
        step3_costs:    { grossMargin: base > 0 ? Math.round((base - last(cogs)) / base * 1000) / 10 : 70, cogsPercent: base > 0 ? Math.round(last(cogs) / base * 1000) / 10 : 30, salariesTotal: Math.round(last((is.salaries as number[]) ?? (is.operating_expenses as number[]) ?? []) * ((is.salaries as number[])?.length ? 1 : 0.6)), ebitdaMarginY1: base > 0 ? Math.round(last(ebitda) / base * 1000) / 10 : 0, capexY1: Math.abs(last((cf.capex as number[]) ?? [])), depreciationPct: 25 },
        step4_funding:  { fundingStage: "Established (Profitable)", currentCash: last((bs.cash as number[]) ?? []), totalFundingRaised: 0, discountRate: 15, terminalGrowthRate: 2.5, exitHorizonYears: "5 years", targetExitMultiple: 5 },
        status: "draft",
      }).eq("id", modelInputId)
    }

    return NextResponse.json({ success: true, extracted: extracted.length })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error", detail: String(error) }, { status: 500 })
  }
}



