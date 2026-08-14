import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserSubscription, canCreateAnotherModel } from "@/lib/subscription"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorised" },
        { status: 401 }
      )
    }

    // Get user's profile id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      entityType,
      source,
      modelType,
      goalId,
      step1,
      step2,
      step3,
      step4,
      benchmarkSnapshot,
      vendorClientId,
      name,
      modelInputId,
    } = body

    // Validate required fields
    if (!modelType || !step1 || !step2 || !step3 || !step4) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Enforce the model limit on creation only, never on edit
    const subscription = await getUserSubscription()
    if (subscription && subscription.tier === "free") {
      const canCreate = await canCreateAnotherModel(subscription)
      if (!canCreate) {
        return NextResponse.json(
          { error: "Model limit reached", detail: "Upgrade to create more models.", code: "MODEL_LIMIT" },
          { status: 403 }
        )
      }
    }

    // Insert into model_inputs
    // Update in place when editing an existing model
    if (modelInputId) {
      const { data: existing } = await supabase
        .from("model_inputs").select("user_id").eq("id", modelInputId).single()
      if (!existing || existing.user_id !== profile.id) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 })
      }
      const { data: updated, error: updateError } = await supabase
        .from("model_inputs")
        .update({
          model_type: modelType, goal_id: goalId ?? null,
          status: "inputs_complete",
          step1_business: step1, step2_revenue: step2,
          step3_costs: step3, step4_funding: step4,
          benchmark_snapshot: benchmarkSnapshot ?? {}, name: name ?? null,
        })
        .eq("id", modelInputId).select("id, status, created_at").single()
      if (updateError) {
        console.error("model_inputs update error:", updateError)
        return NextResponse.json({ error: "Failed to update model inputs" }, { status: 500 })
      }
      await supabase.from("memos").delete().eq("model_input_id", modelInputId)
      return NextResponse.json({
        success: true, modelInputId: updated.id,
        status: updated.status, createdAt: updated.created_at, updated: true,
      })
    }

    const { data: modelInput, error: insertError } = await supabase
      .from("model_inputs")
      .insert({
        user_id:              profile.id,
        vendor_client_id:     vendorClientId ?? null,
        entity_type:          entityType ?? "startup",
        source:               source ?? "questionnaire",
        model_type:           modelType,
        goal_id:              goalId ?? null,
        status:               "inputs_complete",
        step1_business:       step1,
        step2_revenue:        step2,
        step3_costs:          step3,
        step4_funding:        step4,
        benchmark_snapshot:   benchmarkSnapshot ?? {},
        name:                 name ?? null,
      })
      .select("id, status, created_at")
      .single()

    if (insertError) {
      console.error("model_inputs insert error:", insertError)
      return NextResponse.json(
        { error: "Failed to save model inputs" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      modelInputId: modelInput.id,
      status: modelInput.status,
      createdAt: modelInput.created_at,
    })

  } catch (error) {
    console.error("Unexpected error in /api/models/save:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    // Get all model inputs for this user
    const { data: models, error } = await supabase
      .from("user_models")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch models" },
        { status: 500 }
      )
    }

    return NextResponse.json({ models })

  } catch (error) {
    console.error("Unexpected error in GET /api/models/save:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
