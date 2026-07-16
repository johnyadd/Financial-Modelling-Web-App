import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { VendorWizard } from "@/components/vendor/vendor-wizard"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "New Client Model | FinModels UK" }

export default async function VendorNewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirectTo=/vendor/new")

  const { data: profile } = await supabase
    .from("profiles").select("id, full_name").eq("auth_user_id", user.id).single()

  return <VendorWizard profile={profile} />
}
