import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { VendorDashboard } from "@/components/vendor/vendor-dashboard"

export const metadata = { title: "Vendor Portal | FinModels UK" }

export default async function VendorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirectTo=/vendor")

  const { data: profile } = await supabase
    .from("profiles").select("id, full_name, role").eq("auth_user_id", user.id).single()

  const { data: models } = await supabase
    .from("model_inputs").select("id, name, model_type, status, entity_type, created_at, goal_id")
    .eq("source", "vendor").order("created_at", { ascending: false })

  return <VendorDashboard profile={profile} models={models ?? []} />
}
