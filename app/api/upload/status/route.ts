import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

    const modelInputId = request.nextUrl.searchParams.get("modelInputId")
    if (!modelInputId) return NextResponse.json({ error: "modelInputId required" }, { status: 400 })

    const { data: statements } = await supabase
      .from("uploaded_statements")
      .select("id, file_name, file_type, statement_type, parse_status, extracted_data, extraction_notes")
      .eq("model_input_id", modelInputId)
      .order("uploaded_at", { ascending: true })

    return NextResponse.json({ statements: statements ?? [] })

  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
