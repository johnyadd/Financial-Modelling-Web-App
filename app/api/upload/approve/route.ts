import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

    const { modelInputId } = await request.json()
    if (!modelInputId) return NextResponse.json({ error: "modelInputId required" }, { status: 400 })

    const adminClient = createAdminClient()

    // Mark statements as approved
    await adminClient
      .from("uploaded_statements")
      .update({ user_reviewed: true, user_approved: true })
      .eq("model_input_id", modelInputId)
      .eq("parse_status", "complete")

    // Update model input status to inputs_complete
    await adminClient
      .from("model_inputs")
      .update({ status: "inputs_complete" })
      .eq("id", modelInputId)

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
