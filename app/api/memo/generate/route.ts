import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Anthropic from "@anthropic-ai/sdk"
import { buildInvestorMemoPrompt } from "@/lib/memo/prompts/investor"
import { diffInputs, diffOutputs, formatBridgeForPrompt } from "@/lib/scenarios/bridge"
import { SCENARIO_LABELS } from "@/lib/scenarios/types"
import type { ScenarioSet } from "@/lib/scenarios/types"
import type { InvestorMemo, MemoGenerateRequest } from "@/lib/memo/types"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const body = await request.json() as MemoGenerateRequest
    const { modelId, audience = "investor" } = body
    if (!modelId) {
      return NextResponse.json({ error: "modelId is required" }, { status: 400 })
    }
    if (audience !== "investor") {
      return NextResponse.json(
        {
          error: `Audience ${audience} not yet supported`,
          detail: "v1 supports investor only. founder and advisor are planned for v2 and v3.",
        },
        { status: 400 }
      )
    }

    // Loaded before auth so a public model can be served with no session.
    // RLS permits reading your own models or any model flagged is_public.
    const { data: model, error: modelError } = await supabase
      .from("model_inputs")
      .select("*")
      .eq("id", modelId)
      .single()
    if (modelError || !model) {
      return NextResponse.json(
        { error: "Model not found", detail: modelError?.message },
        { status: 404 }
      )
    }

    // Auth applies only to models that are not public. The demo reads a public
    // model with no session; without this it cannot regenerate its own memo and
    // stays broken until someone signed in visits the memo URL by hand.
    const isPublic = model.is_public === true
    if (!isPublic) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
      }
      // model_inputs.user_id references profiles.id, not auth.users.id.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .single()
      if (profileError || !profile) {
        return NextResponse.json(
          { error: "Profile not found", detail: profileError?.message },
          { status: 404 }
        )
      }
      if (model.user_id && model.user_id !== profile.id) {
        return NextResponse.json(
          { error: "Not authorized to access this model" },
          { status: 403 }
        )
      }
    }

    // Writes go through the admin client: ownership is settled above, and an
    // anonymous demo visitor has no session for RLS to match on.
    const adminClient = createAdminClient()

    // -- Read-first: serve the stored memo unless regeneration was requested --
    const force = (body as { force?: boolean }).force === true
    if (!force) {
      const { data: storedMemo } = await supabase
        .from("memos")
        .select("content, updated_at")
        .eq("model_input_id", modelId)
        .eq("audience", audience)
        .maybeSingle()
      if (storedMemo?.content) {
        return NextResponse.json({
          memo: storedMemo.content,
          audience,
          cached: true,
          generatedAt: storedMemo.updated_at,
        })
      }
    }

    // -- Load model output -------------------------------------------------
    const { data: output } = await supabase
      .from("model_outputs")
      .select("*")
      .eq("model_input_id", modelId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!output) {
      return NextResponse.json(
        {
          error: "No model output found",
          detail: "Generate the model output first (via the export or compute step) before generating a memo.",
        },
        { status: 404 }
      )
    }

    // -- Extract input state (mirrors export/[id]/route.ts) ----------------
    const step1 = (model.step1_business ?? {}) as Record<string, unknown>
    const step2 = (model.step2_revenue ?? {}) as Record<string, unknown>
    const step3 = (model.step3_costs ?? {}) as Record<string, unknown>
    const step4 = (model.step4_funding ?? {}) as Record<string, unknown>
    const modelType = (model.model_type as string) ?? "dcf"

    // -- Extract output state (mirrors export/[id]/route.ts) ---------------
    const dcfOut = (
      Object.keys(output.dcf_output ?? {}).length > 0
        ? output.dcf_output
        : output.three_statement ?? {}
    ) as Record<string, unknown>

    const summary = (dcfOut.summary ?? output.summary_metrics ?? {}) as Record<string, unknown>
    const pnl = (dcfOut.pnl ?? dcfOut.income_statement ?? []) as Record<string, unknown>[]
    const balanceSheet = (dcfOut.balance_sheet ?? []) as Record<string, unknown>[]
    const cashFlow = (dcfOut.cash_flow ?? []) as Record<string, unknown>[]
    const scenarios = (dcfOut.scenarios ?? null) as Record<string, Record<string, unknown>> | null
    const sensitivity = (dcfOut.sensitivity ?? null) as Record<string, unknown> | null

    // -- Build prompt ------------------------------------------------------
    // Bridge text per computed case, or null when no scenarios are defined.
    let scenarioBridge: string | null = null
    const scenarioSet = (model.scenarios ?? {}) as ScenarioSet
    const scenarioOuts = output.scenario_outputs as Record<string, { summary?: Record<string, unknown> }> | null
    if (scenarioOuts) {
      const blocks: string[] = []
      for (const c of ["upside", "downside"] as const) {
        const caseOut = scenarioOuts[c]
        if (!caseOut) continue
        const inputDeltas = diffInputs({ step2, step3, step4 }, scenarioSet[c])
        const outputDeltas = diffOutputs(summary, caseOut.summary ?? {})
        blocks.push(formatBridgeForPrompt(SCENARIO_LABELS[c], inputDeltas, outputDeltas))
      }
      if (blocks.length > 0) scenarioBridge = blocks.join("\n\n")
    }

    const prompt = buildInvestorMemoPrompt({
      scenarioBridge,
      step1, step2, step3, step4,
      modelType,
      summary, pnl, balanceSheet, cashFlow, scenarios, sensitivity,
    })

    // -- Call Claude (matches ai-suggest model + pattern) ------------------
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    // -- Parse response ----------------------------------------------------
    try {
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim()
      const memoData = JSON.parse(cleanText) as Omit<InvestorMemo, "generatedAt" | "modelId">

      const memo: InvestorMemo = {
        ...memoData,
        generatedAt: new Date().toISOString(),
        modelId,
      }

      // -- Persist so subsequent views are instant and cost nothing --------
      const { error: saveError } = await adminClient
        .from("memos")
        .upsert(
          {
            model_input_id: modelId,
            user_id:        model.user_id,
            audience,
            content:        memo,
            updated_at:     new Date().toISOString(),
          },
          { onConflict: "model_input_id,audience" }
        )
      if (saveError) {
        // Non-fatal: the memo is still returned, it just won't be cached.
        console.error("Memo save error:", saveError.message)
      }

      return NextResponse.json({
        memo,
        audience: "investor",
        businessName: (model.step1_business as Record<string, unknown>)?.businessName ?? null,
        cached: false,
        generatedAt: memo.generatedAt,
      })
    } catch (parseError) {
      // Return the raw text for debugging - critical while iterating on the prompt
      console.error("Memo parse error:", parseError, "Raw text preview:", text.substring(0, 500))
      return NextResponse.json(
        {
          error: "Failed to parse memo JSON from LLM response",
          detail: parseError instanceof Error ? parseError.message : String(parseError),
          rawText: text.substring(0, 2000),
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Memo generate error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate memo",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
