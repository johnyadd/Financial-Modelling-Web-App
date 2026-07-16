"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { CheckCircle2Icon } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()

  async function handleComplete(destination: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from("profiles")
        .update({ onboarding_done: true })
        .eq("auth_user_id", user.id)
    }
    router.push(destination)
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2Icon className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Account confirmed!
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Your FinModels UK account is ready. Where would you like to go?
        </p>
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => handleComplete("/dashboard")}
          >
            Start a financial model
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleComplete("/vendor")}
          >
            Go to vendor portal
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => handleComplete("/")}
          >
            Go to homepage
          </Button>
        </div>
      </div>
    </main>
  )
}
