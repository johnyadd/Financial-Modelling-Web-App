import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single()

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

    const body = await request.json()
    const {
      firm_name, logo_url, logo_storage_path, primary_color, accent_color,
      tagline, disclaimer_text, website_url, contact_email,
    } = body

    const adminClient = createAdminClient()

    // Upsert branding record
    const { data: branding, error } = await adminClient
      .from("vendor_branding")
      .upsert({
        vendor_profile_id: profile.id,
        firm_name: firm_name || null,
        logo_url: logo_url || null,
        logo_storage_path: logo_storage_path || null,
        primary_color: primary_color || "#1E3A5F",
        accent_color: accent_color || "#27AE60",
        tagline: tagline || null,
        disclaimer_text: disclaimer_text || null,
        website_url: website_url || null,
        contact_email: contact_email || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "vendor_profile_id",
      })
      .select("id")
      .single()

    if (error) {
      console.error("Branding upsert error:", error)
      return NextResponse.json({ error: "Failed to save branding" }, { status: 500 })
    }

    return NextResponse.json({ success: true, brandingId: branding.id })

  } catch (error) {
    console.error("Branding save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single()

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

    const { data: branding } = await supabase
      .from("vendor_branding")
      .select("*")
      .eq("vendor_profile_id", profile.id)
      .maybeSingle()

    return NextResponse.json({ branding })

  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
