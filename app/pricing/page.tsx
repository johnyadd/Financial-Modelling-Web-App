import { createClient } from "@/lib/supabase/server"
import { PricingView } from "@/components/pricing/pricing-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing | FinModels UK",
  description: "Simple pricing for founders, finance teams, and accounting firms",
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentTier = "free"
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single()

    if (profile) {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("tier, status")
        .eq("profile_id", profile.id)
        .maybeSingle()

      if (subscription && subscription.status === "active") {
        currentTier = subscription.tier
      }
    }
  }

  return <PricingView isLoggedIn={!!user} currentTier={currentTier} />
}
