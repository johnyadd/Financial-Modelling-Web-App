import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const { files } = await request.json()

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Create model_input record for this upload
    const { data: modelInput, error: modelError } = await adminClient
      .from("model_inputs")
      .insert({
        user_id:     profile.id,
        entity_type: "existing_business",
        source:      "upload",
        model_type:  "three_statement",  // default — user can change in review
        status:      "draft",
        step1_business: {},
        step2_revenue:  {},
        step3_costs:    {},
        step4_funding:  {},
      })
      .select("id")
      .single()

    if (modelError || !modelInput) {
      console.error("Model input error:", modelError)
      return NextResponse.json({ error: "Failed to create model record" }, { status: 500 })
    }

    // Create uploaded_statements records for each file
    const statementInserts = files.map((f: {
      fileName: string
      fileType: string
      fileSizeBytes: number
      storagePath: string
      statementType: string
    }) => ({
      model_input_id:  modelInput.id,
      user_id:         profile.id,
      file_name:       f.fileName,
      file_type:       f.fileType,
      file_size_bytes: f.fileSizeBytes,
      storage_path:    f.storagePath,
      statement_type:  f.statementType.toLowerCase().replace(/ /g, "_"),
      parse_status:    "pending",
    }))

    const { error: stmtError } = await adminClient
      .from("uploaded_statements")
      .insert(statementInserts)

    if (stmtError) {
      console.error("Statement insert error:", stmtError)
      return NextResponse.json({ error: "Failed to create statement records" }, { status: 500 })
    }

    return NextResponse.json({
      success:      true,
      modelInputId: modelInput.id,
    })

  } catch (error) {
    console.error("Upload create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
