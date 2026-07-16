import { Suspense } from "react"
import { SignupForm } from "@/components/auth/signup-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create account | FinModels UK",
}

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Get started with FinModels UK - free to begin
          </p>
        </div>
        <Suspense fallback={<div className="h-96 rounded-2xl border border-border animate-pulse bg-muted" />}>
          <SignupForm />
        </Suspense>
      </div>
    </main>
  )
}
