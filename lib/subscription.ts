import { createClient } from "@/lib/supabase/server"
import { TIERS, type Tier } from "@/lib/stripe"

export interface UserSubscription {
  tier: Tier
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  canExport: boolean
  canWhiteLabel: boolean
  hasVendorPortal: boolean
  maxModels: number
}

/**
 * Get the current user's subscription and derived permissions.
 * Returns a "free" tier if no active subscription exists.
 */
export async function getUserSubscription(): Promise<UserSubscription | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .single()

  if (!profile) return null

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("tier, status, current_period_end, cancel_at_period_end")
    .eq("profile_id", profile.id)
    .maybeSingle()

  // Default to free tier if no subscription
  const tier: Tier = (subscription?.status === "active" || subscription?.status === "trialing")
    ? (subscription.tier as Tier)
    : "free"

  const tierConfig = TIERS[tier]

  return {
    tier,
    status: subscription?.status || "free",
    currentPeriodEnd: subscription?.current_period_end || null,
    cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
    canExport: tierConfig.limits.canExport,
    canWhiteLabel: tierConfig.limits.canWhiteLabel,
    hasVendorPortal: tierConfig.limits.hasVendorPortal,
    maxModels: tierConfig.limits.maxModels,
  }
}

/**
 * Check if a user's current model count is at or over the tier limit.
 * Returns true if they can create another model, false if blocked.
 */
export async function canCreateAnotherModel(subscription: UserSubscription): Promise<boolean> {
  if (subscription.maxModels === -1) return true  // unlimited

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .single()

  if (!profile) return false

  const { count } = await supabase
    .from("model_inputs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id)

  return (count || 0) < subscription.maxModels
}
