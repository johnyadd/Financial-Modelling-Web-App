import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const ENGINE_URL = process.env.PYTHON_ENGINE_URL ?? "http://localhost:8000"
const ENGINE_KEY = process.env.ENGINE_SECRET_KEY ?? ""

function cleanNulls(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === "" || value === undefined) {
      cleaned[key] = null
    } else {
      cleaned[key] = value
    }
  }
  return cleaned
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
      .from("model_inputs")
      .select("*")
      .eq("id", modelInputId)
      .single()

    if (fetchError || !modelInput) {
      return NextResponse.json({ error: "Model input not found" }, { status: 404 })
    }

    const engineResponse = await fetch(`${ENGINE_URL}/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Engine-Key": ENGINE_KEY,
      },
      body: JSON.stringify({
        model_input_id: modelInput.id,
        model_type:     modelInput.model_type,
        goal_id:        modelInput.goal_id,
        step1:          cleanNulls(modelInput.step1_business),
        step2:          cleanNulls(modelInput.step2_revenue),
        step3:          cleanNulls(modelInput.step3_costs),
        step4:          cleanNulls(modelInput.step4_funding),
      }),
    })

    if (!engineResponse.ok) {
      const engineError = await engineResponse.text()
      console.error("Engine error:", engineError)
      return NextResponse.json({ error: "Engine calculation failed", detail: engineError }, { status: 500 })
    }

    const engineResult = await engineResponse.json()

    const adminClient = createAdminClient()

    const outputColumn = {
      pre_revenue_dcf: "dcf_output",
      dcf:             "dcf_output",
      three_statement: "three_statement",
      lbo:             "lbo_output",
      saas:            "saas_output",
      ma:              "ma_output",
    }[modelInput.model_type] ?? "dcf_output"

    const { data: output, error: outputError } = await adminClient
      .from("model_outputs")
      .insert({
        model_input_id:  modelInputId,
        user_id:         modelInput.user_id,
        model_type:      modelInput.model_type,
        status:          "complete",
        [outputColumn]:  engineResult.output,
        summary_metrics: engineResult.output?.summary ?? {},
        engine_version:  "1.0.0",
      })
      .select("id")
      .single()

    if (outputError) {
      console.error("Output save error:", JSON.stringify(outputError))
      return NextResponse.json({ error: "Failed to save output", detail: outputError.message }, { status: 500 })
    }

    await adminClient
      .from("model_inputs")
      .update({ status: "complete" })
      .eq("id", modelInputId)

    return NextResponse.json({ success: true, modelOutputId: output.id })

  } catch (error) {
    console.error("Trigger error:", error)
    return NextResponse.json({ error: "Internal server error", detail: String(error) }, { status: 500 })
  }
}
