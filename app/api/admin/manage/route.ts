import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - List all admins
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify caller is admin
    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("admin_role")
      .eq("auth_user_id", user.id)
      .single()

    if (!callerProfile || callerProfile.admin_role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Fetch all admins with their emails from auth.users
    const { data: admins, error } = await supabase
      .from("profiles")
      .select("id, full_name, auth_user_id, admin_role, created_at")
      .eq("admin_role", "admin")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get emails from auth.users via admin API (requires service role)
    // For now, return profile info; frontend will show name + user_id
    return NextResponse.json({ admins: admins ?? [] })
  } catch (error) {
    console.error("List admins error:", error)
    return NextResponse.json({
      error: "Failed to list admins",
      detail: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}

// POST - Grant admin role to existing user by email
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify caller is admin
    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("admin_role")
      .eq("auth_user_id", user.id)
      .single()

    if (!callerProfile || callerProfile.admin_role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { email } = await request.json() as { email: string }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    // Find the target user in profiles via email
    // Note: this requires access to auth.users which is only via service role
    // For this feature we join via profiles.auth_user_id matching auth.users.email
    const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers()

    if (authErr) {
      return NextResponse.json({
        error: "Could not lookup user (requires service role in production)",
        detail: authErr.message,
      }, { status: 500 })
    }

    const targetAuthUser = authUsers.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    )

    if (!targetAuthUser) {
      return NextResponse.json({
        error: `No user found with email ${email}. They must sign up first.`,
      }, { status: 404 })
    }

    // Grant admin role
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ admin_role: "admin" })
      .eq("auth_user_id", targetAuthUser.id)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Admin access granted to ${email}`,
    })
  } catch (error) {
    console.error("Grant admin error:", error)
    return NextResponse.json({
      error: "Failed to grant admin",
      detail: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}

// DELETE - Revoke admin role from a user
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify caller is admin
    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("id, admin_role")
      .eq("auth_user_id", user.id)
      .single()

    if (!callerProfile || callerProfile.admin_role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { profileId } = await request.json() as { profileId: string }

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID required" }, { status: 400 })
    }

    // Prevent self-demotion (safety measure)
    if (profileId === callerProfile.id) {
      return NextResponse.json({
        error: "You cannot revoke your own admin access. Another admin must do this.",
      }, { status: 400 })
    }

    // Revoke admin role
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ admin_role: "user" })
      .eq("id", profileId)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Admin access revoked",
    })
  } catch (error) {
    console.error("Revoke admin error:", error)
    return NextResponse.json({
      error: "Failed to revoke admin",
      detail: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
