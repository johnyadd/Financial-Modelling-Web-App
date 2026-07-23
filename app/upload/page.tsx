import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UploadView } from "@/components/upload/upload-view"
import { getUserSubscription, canCreateAnotherModel } from "@/lib/subscription"

export default async function UploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirectTo=/upload")

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, currency")
    .eq("auth_user_id", user.id)
    .single()

  const subscription = await getUserSubscription()
  if (subscription && subscription.tier === "free") {
    const canCreate = await canCreateAnotherModel(subscription)
    if (!canCreate) {
      redirect("/pricing?reason=model_limit")
    }
  }

  return <UploadView profile={profile} />
}

