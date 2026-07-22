import { createClient } from "@/lib/supabase/server"
import { getUserSubscription } from "@/lib/subscription"
import { redirect } from "next/navigation"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | FinModels UK",
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login?redirectTo=/dashboard")
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, plan, created_at")
    .eq("auth_user_id", user.id)
    .single()

  const subscription = await getUserSubscription()

  // Fetch all models via the user_models view
  const { data: models } = await supabase
    .from("user_models")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <DashboardView
      profile={profile}
      models={models ?? []}
      subscription={subscription}
    />
  )
}

