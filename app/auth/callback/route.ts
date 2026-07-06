import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"
  const redirectTo = searchParams.get("redirectTo")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get user profile to determine role-based redirect
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, onboarding_done")
          .eq("auth_user_id", user.id)
          .single()

        // If redirectTo was specified (e.g. came from questionnaire), use that
        if (redirectTo) {
          return NextResponse.redirect(`${origin}${redirectTo}`)
        }

        // Role-based redirect after login
        if (profile) {
          if (!profile.onboarding_done) {
            return NextResponse.redirect(`${origin}/onboarding`)
          }
          if (profile.role === "vendor") {
            return NextResponse.redirect(`${origin}/vendor`)
          }
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Error — redirect to login with error message
  return NextResponse.redirect(
    `${origin}/auth/login?error=Could not authenticate user`
  )
}
