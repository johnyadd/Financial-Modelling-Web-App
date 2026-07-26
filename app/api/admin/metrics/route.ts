import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const TIER_PRICES: Record<string, number> = {
  founder: 29,
  vendor_pro: 99,
  enterprise: 500,
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check admin_role in profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("admin_role")
      .eq("auth_user_id", user.id)
      .single()

    if (!profile || profile.admin_role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Fetch total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    // Fetch all subscriptions with status and tier
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("tier, status, created_at, profile_id, stripe_customer_id")

    // Active subscriptions (not free)
    const activeSubs = (subs ?? []).filter(
      (s) => s.status === "active" && s.tier !== "free"
    )

    // Calculate MRR
    const mrr = activeSubs.reduce((sum, s) => {
      const price = TIER_PRICES[s.tier] ?? 0
      return sum + price
    }, 0)

    // Subscription tier breakdown
    const tierBreakdown: Record<string, { count: number; revenue: number }> = {
      free: { count: 0, revenue: 0 },
      founder: { count: 0, revenue: 0 },
      vendor_pro: { count: 0, revenue: 0 },
      enterprise: { count: 0, revenue: 0 },
    }

    ;(subs ?? []).forEach((s) => {
      if (s.status === "active" || s.tier === "free") {
        const tier = s.tier
        if (tierBreakdown[tier]) {
          tierBreakdown[tier].count++
          tierBreakdown[tier].revenue += TIER_PRICES[tier] ?? 0
        }
      }
    })

    // Free tier count = total users - paying subs
    const totalUsersNum = totalUsers ?? 0
    tierBreakdown.free.count = Math.max(0, totalUsersNum - activeSubs.length)

    // Fetch total models created
    const { count: totalModels } = await supabase
      .from("models")
      .select("*", { count: "exact", head: true })

    // Fetch recent activity - last 20 events
    // Combine profiles created, subscriptions changed, models created
    const [recentProfiles, recentSubs, recentModels] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("subscriptions")
        .select("tier, status, updated_at, profile_id")
        .order("updated_at", { ascending: false })
        .limit(10),
      supabase
        .from("models")
        .select("id, business_name, model_type, created_at, profile_id")
        .order("created_at", { ascending: false })
        .limit(10),
    ])

    const activity: Array<{
      type: string
      description: string
      timestamp: string
    }> = []

    ;(recentProfiles.data ?? []).forEach((p) => {
      activity.push({
        type: "signup",
        description: `${p.full_name ?? "New user"} signed up`,
        timestamp: p.created_at,
      })
    })

    ;(recentSubs.data ?? []).forEach((s) => {
      activity.push({
        type: "subscription",
        description: `Subscription ${s.status}: ${s.tier}`,
        timestamp: s.updated_at,
      })
    })

    ;(recentModels.data ?? []).forEach((m) => {
      activity.push({
        type: "model",
        description: `Model created: ${m.business_name ?? "Unnamed"} (${m.model_type ?? "unknown"})`,
        timestamp: m.created_at,
      })
    })

    // Sort by timestamp desc, take latest 20
    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    const recentActivity = activity.slice(0, 20)

    return NextResponse.json({
      mrr,
      activeSubscriptions: activeSubs.length,
      totalUsers: totalUsersNum,
      totalModels: totalModels ?? 0,
      tierBreakdown,
      recentActivity,
    })
  } catch (error) {
    console.error("Admin metrics error:", error)
    return NextResponse.json({
      error: "Failed to fetch metrics",
      detail: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}

