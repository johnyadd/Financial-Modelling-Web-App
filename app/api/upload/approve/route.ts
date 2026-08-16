import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { mapEntityToSteps } from "@/lib/upload/map-entity"
import type { ExtractedEntity } from "@/lib/upload/map-entity"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

    const { modelInputId, entityIndex } = await request.json()
    if (!modelInputId) return NextResponse.json({ error: "modelInputId required" }, { status: 400 })

    const adminClient = createAdminClient()

    // Re-map when the user picked an entity other than the one extraction defaulted to.
    // Extraction maps entity 0 so a model exists immediately; this is where a
    // different choice actually takes effect.
    if (typeof entityIndex === "number" && entityIndex > 0) {
      const { data: rows } = await adminClient
        .from("uploaded_statements")
        .select("extracted_data")
        .eq("model_input_id", modelInputId)
        .eq("parse_status", "complete")

      const entities: ExtractedEntity[] = []
      const coverage = new Set<string>()
      let currency = "GBP"
      for (const r of rows ?? []) {
        const d = (r.extracted_data ?? {}) as Record<string, unknown>
        if (typeof d.currency === "string") currency = d.currency
        for (const c of ((d.data_coverage as string[]) ?? [])) coverage.add(c)
        for (const e of ((d.entities as ExtractedEntity[]) ?? [])) entities.push(e)
      }

      const chosen = entities[entityIndex]
      if (chosen) {
        const steps = mapEntityToSteps(chosen, currency, Array.from(coverage))
        await adminClient.from("model_inputs").update(steps).eq("id", modelInputId)
      }
    }

    await adminClient
      .from("uploaded_statements")
      .update({ user_reviewed: true, user_approved: true })
      .eq("model_input_id", modelInputId)
      .eq("parse_status", "complete")

    await adminClient
      .from("model_inputs")
      .update({ status: "inputs_complete" })
      .eq("id", modelInputId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Approve error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
