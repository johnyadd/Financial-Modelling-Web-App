import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Anthropic from "@anthropic-ai/sdk"
import ExcelJS from "exceljs"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PROMPT = `You are a financial data extraction expert. Extract ALL financial figures from this document.
Return ONLY valid JSON with this structure:
{
  "company_name": null, "currency": "GBP", "years": [],
  "income_statement": { "revenue": [], "cost_of_goods_sold": [], "gross_profit": [], "gross_margin_pct": [], "operating_expenses": [], "ebitda": [], "depreciation_amortisation": [], "ebit": [], "interest_expense": [], "profit_before_tax": [], "tax": [], "net_profit": [], "net_margin_pct": [] },
  "balance_sheet": { "cash": [], "accounts_receivable": [], "inventory": [], "total_current_assets": [], "fixed_assets": [], "total_assets": [], "accounts_payable": [], "short_term_debt": [], "total_current_liabilities": [], "long_term_debt": [], "total_liabilities": [], "equity": [], "retained_earnings": [], "total_equity_liabilities": [] },
  "cash_flow": { "operating_cash_flow": [], "capex": [], "investing_cash_flow": [], "financing_cash_flow": [], "net_cash_flow": [], "closing_cash": [] },
  "notes": ""
}
All monetary values in thousands. Return ONLY the JSON.`

async function fromText(text: string) {
  const r = await anthropic.messages.create({ model: "claude-sonnet-4-6", max_tokens: 4000, messages: [{ role: "user", content: `${PROMPT}\n\nDocument:\n${text}` }] })
  return JSON.parse((r.content[0] as { text: string }).text.replace(/```json|```/g, "").trim())
}

async function fromPdf(b64: string) {
  const r = await anthropic.messages.create({ model: "claude-sonnet-4-6", max_tokens: 4000, messages: [{ role: "user", content: [{ type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } }, { type: "text", text: PROMPT }] }] })
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
      const p = extracted[0] as Record<string, Record<string, unknown[]>>
      const is = p?.income_statement ?? {}; const bs = p?.balance_sheet ?? {}; const cf = p?.cash_flow ?? {}
      const years = (p?.years as string[]) ?? []; const li = Math.max((years.length ?? 1) - 1, 0)
      const last = (a: unknown[]) => typeof a?.[li] === "number" ? a[li] as number : 0
      const gr = (a: unknown[]) => { if (!a || a.length < 2) return 0; const pv = Number(a[a.length-2]); const cv = Number(a[a.length-1]); return pv === 0 ? 0 : ((cv-pv)/Math.abs(pv))*100 }
      const rev = is.revenue as number[] ?? []; const cogs = is.cost_of_goods_sold as number[] ?? []; const ebitda = is.ebitda as number[] ?? []
      await adminClient.from("model_inputs").update({
        step1_business: { businessName: p?.company_name ?? "", currency: p?.currency ?? "GBP", industry: "", subSector: "", businessStage: "Established (Profitable)", country: "United Kingdom" },
        step2_revenue:  { modelType: "three_statement", projectionYears: "5 years", revenueModel: "Product Sales", year1Revenue: last(rev), year2Revenue: last(rev), year3Revenue: last(rev), revenueGrowthY1: gr(rev), revenueGrowthY2: gr(rev), revenueGrowthY3: gr(rev)*0.8 },
        step3_costs:    { grossMargin: last(rev)>0?(last(rev)-last(cogs))/last(rev)*100:70, cogsPercent: last(rev)>0?last(cogs)/last(rev)*100:30, salariesTotal: last(is.operating_expenses as number[]??[])*0.6, ebitdaMarginY1: last(rev)>0?last(ebitda)/last(rev)*100:0, capexY1: Math.abs(last(cf.capex as number[]??[])), depreciationRate: 25 },
        step4_funding:  { fundingStage: "Established (Profitable)", currentCash: last(bs.cash as number[]??[]), totalFundingRaised: 0, discountRate: 15, terminalGrowthRate: 2.5, exitHorizonYears: "5 years", targetExitMultiple: 5 },
        status: "draft",
      }).eq("id", modelInputId)
    }

    return NextResponse.json({ success: true, extracted: extracted.length })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error", detail: String(error) }, { status: 500 })
  }
}


