import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { computeRevenue } from "@/lib/revenue-compute"
import { applyScenarioOverrides } from "@/lib/scenarios/types"
import type { ScenarioSet, ScenarioCase } from "@/lib/scenarios/types"

const ENGINE_URL = process.env.PYTHON_ENGINE_URL ?? "http://localhost:8000"
const ENGINE_KEY = process.env.ENGINE_SECRET_KEY ?? ""

function cleanNulls(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    cleaned[key] = value === "" || value === undefined ? null : value
  }
  return cleaned
}

interface StepData {
  step2: Record<string, unknown>
  step3: Record<string, unknown>
  step4: Record<string, unknown>
}

/** One engine call. Throws on a non-OK response so Promise.all fails fast. */
async function runEngine(
  modelInput: Record<string, unknown>,
  steps: StepData
): Promise<Record<string, unknown>> {
  // Driver-based models compile revenue client-side at submit, so the engine
  // only ever sees year1/2/3Revenue. Without re-deriving here, a scenario
  // overriding churn or acquisition would silently return identical revenue.
  let step2 = steps.step2
  if (step2.revenueEntryMode === "driverBased") {
    const computed = computeRevenue(
      step2.businessTypeSub as Parameters<typeof computeRevenue>[0],
      step2 as Parameters<typeof computeRevenue>[1]
    )
    if (computed) {
      step2 = {
        ...step2,
        year1Revenue: String(Math.round(computed.year1)),
        year2Revenue: String(Math.round(computed.year2)),
        year3Revenue: String(Math.round(computed.year3)),
      }
    }
  }

  const res = await fetch(`${ENGINE_URL}/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Engine-Key": ENGINE_KEY },
    body: JSON.stringify({
      model_input_id: modelInput.id,
      model_type:     modelInput.model_type,
      goal_id:        modelInput.goal_id,
      step1:          cleanNulls(modelInput.step1_business as Record<string, unknown>),
      step2:          step2,
      step3:          steps.step3,
      step4:          steps.step4,
    }),
  })
  if (!res.ok) throw new Error(await res.text())
  const json = await res.json()
  return json.output
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const { modelInputId } = await request.json()
    if (!modelInputId) {
      return NextResponse.json({ error: "modelInputId required" }, { status: 400 })
    }

    const { data: modelInput, error: fetchError } = await supabase
      .from("model_inputs").select("*").eq("id", modelInputId).single()
    if (fetchError || !modelInput) {
      return NextResponse.json({ error: "Model input not found" }, { status: 404 })
    }

    // Base is the model as stored. Upside and downside are sparse overrides on top.
    const base: StepData = {
      step2: cleanNulls(modelInput.step2_revenue),
      step3: cleanNulls(modelInput.step3_costs),
      step4: cleanNulls(modelInput.step4_funding),
    }

    const scenarios = (modelInput.scenarios ?? {}) as ScenarioSet
    const extraCases: ("upside" | "downside")[] = []
    if (scenarios.upside) extraCases.push("upside")
    if (scenarios.downside) extraCases.push("downside")

    let baseOutput: Record<string, unknown>
    let scenarioOutputs: Record<string, unknown> | null = null

    try {
      // Parallel: the engine is stateless, so three cases cost the same wall-clock as one.
      const results = await Promise.all([
        runEngine(modelInput, base),
        ...extraCases.map((c) =>
          runEngine(modelInput, applyScenarioOverrides(base, scenarios[c]))
        ),
      ])
      baseOutput = results[0]
      if (extraCases.length > 0) {
        scenarioOutputs = {}
        extraCases.forEach((c, i) => {
          ;(scenarioOutputs as Record<string, unknown>)[c] = results[i + 1]
        })
      }
    } catch (engineError) {
      console.error("Engine error:", engineError)
      return NextResponse.json(
        { error: "Engine calculation failed", detail: String(engineError) },
        { status: 500 }
      )
    }

    const adminClient = createAdminClient()

    const outputColumnMap: Record<string, string> = {
      pre_revenue_dcf: "dcf_output",
      dcf:             "dcf_output",
      three_statement: "three_statement",
      lbo:             "lbo_output",
      saas:            "saas_output",
      ma:              "ma_output",
    }
    const outputColumn = outputColumnMap[modelInput.model_type as string] ?? "dcf_output"

    const { data: output, error: outputError } = await adminClient
      .from("model_outputs")
      .insert({
        model_input_id:   modelInputId,
        user_id:          modelInput.user_id,
        model_type:       modelInput.model_type,
        status:           "complete",
        [outputColumn]:   baseOutput,
        summary_metrics:  baseOutput?.summary ?? {},
        scenario_outputs: scenarioOutputs,
        engine_version:   "1.0.0",
      })
      .select("id")
      .single()

    if (outputError) {
      console.error("Output save error:", JSON.stringify(outputError))
      return NextResponse.json(
        { error: "Failed to save output", detail: outputError.message },
        { status: 500 }
      )
    }

    await adminClient.from("model_inputs")
      .update({ status: "complete" }).eq("id", modelInputId)

    // New outputs invalidate any cached memo describing the old numbers.
    // Public models keep their memo: /demo only reads cache, so deleting here
    // leaves it showing "Demo unavailable" until someone regenerates by hand.
    if (modelInput.is_public !== true) {
      await adminClient.from("memos").delete().eq("model_input_id", modelInputId)
    }

    return NextResponse.json({
      success: true,
      modelOutputId: output.id,
      cases: ["base", ...extraCases],
    })
  } catch (error) {
    console.error("Trigger error:", error)
    return NextResponse.json(
      { error: "Internal server error", detail: String(error) },
      { status: 500 }
    )
  }
}
