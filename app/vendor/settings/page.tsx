import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BrandingForm } from "@/components/vendor/branding-form"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Vendor Branding | FinModels UK" }

export default async function VendorSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirectTo=/vendor/settings")

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("auth_user_id", user.id)
    .single()

  if (!profile) redirect("/vendor")

  // Fetch existing branding (if any)
  const { data: branding } = await supabase
    .from("vendor_branding")
    .select("*")
    .eq("vendor_profile_id", profile.id)
    .maybeSingle()

  return <BrandingForm profileId={profile.id} initialBranding={branding} />
}
