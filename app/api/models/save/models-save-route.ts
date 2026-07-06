import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
    } = body

    // Validate required fields
    if (!modelType || !step1 || !step2 || !step3 || !step4) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Insert into model_inputs
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
