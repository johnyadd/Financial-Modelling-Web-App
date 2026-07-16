import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UploadView } from "@/components/upload/upload-view"

export default async function UploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirectTo=/upload")

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, currency")
    .eq("auth_user_id", user.id)
    .single()

  return <UploadView profile={profile} />
}
