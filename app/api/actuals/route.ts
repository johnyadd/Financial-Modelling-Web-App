import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

/** Ownership goes through profiles — model_inputs.user_id references profiles.id. */
async function resolveOwner(modelInputId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorised", status: 401 as const }

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("auth_user_id", user.id).single()
  if (!profile) return { error: "Profile not found", status: 404 as const }

  const { data: model } = await supabase
    .from("model_inputs").select("id, user_id").eq("id", modelInputId).single()
  if (!model) return { error: "Model not found", status: 404 as const }
  if (model.user_id && model.user_id !== profile.id) {
    return { error: "Not authorized to access this model", status: 403 as const }
  }
  return { profileId: profile.id as string }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { modelInputId, periodLabel, periodType, planYear, periodsElapsed, incomeStatement } = body

    if (!modelInputId || !periodLabel) {
      return NextResponse.json({ error: "modelInputId and periodLabel are required" }, { status: 400 })
    }

    const owner = await resolveOwner(modelInputId)
    if ("error" in owner) {
      return NextResponse.json({ error: owner.error }, { status: owner.status })
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from("actual_periods")
      .upsert({
        model_input_id:   modelInputId,
        user_id:          owner.profileId,
        period_label:     periodLabel,
        period_type:      periodType ?? "month",
        plan_year:        planYear ?? 1,
        periods_elapsed:  periodsElapsed ?? 1,
        income_statement: incomeStatement ?? {},
        source:           "manual",
        updated_at:       new Date().toISOString(),
      }, { onConflict: "model_input_id,period_label" })
      .select("id, period_label")
      .single()

    if (error) {
      console.error("Actual period save error:", error.message)
      return NextResponse.json({ error: "Failed to save period", detail: error.message }, { status: 500 })
    }

    // New actuals make any cached board pack stale — the same invalidation the
    // engine trigger does for memos when it writes new output.
    await adminClient.from("memos")
      .delete().eq("model_input_id", modelInputId).eq("audience", "board")

    return NextResponse.json({ success: true, period: data })
  } catch (error) {
    console.error("Actuals POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const modelInputId = request.nextUrl.searchParams.get("modelInputId")
    if (!modelInputId) {
      return NextResponse.json({ error: "modelInputId required" }, { status: 400 })
    }

    const owner = await resolveOwner(modelInputId)
    if ("error" in owner) {
      return NextResponse.json({ error: owner.error }, { status: owner.status })
    }

    const adminClient = createAdminClient()
    const { data } = await adminClient
      .from("actual_periods")
      .select("id, period_label, period_type, plan_year, periods_elapsed, income_statement")
      .eq("model_input_id", modelInputId)
      .order("period_label", { ascending: true })

    return NextResponse.json({ periods: data ?? [] })
  } catch (error) {
    console.error("Actuals GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { modelInputId, periodLabel } = await request.json()
    if (!modelInputId || !periodLabel) {
      return NextResponse.json({ error: "modelInputId and periodLabel are required" }, { status: 400 })
    }

    const owner = await resolveOwner(modelInputId)
    if ("error" in owner) {
      return NextResponse.json({ error: owner.error }, { status: owner.status })
    }

    const adminClient = createAdminClient()
    await adminClient.from("actual_periods")
      .delete().eq("model_input_id", modelInputId).eq("period_label", periodLabel)
    await adminClient.from("memos")
      .delete().eq("model_input_id", modelInputId).eq("audience", "board")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Actuals DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
