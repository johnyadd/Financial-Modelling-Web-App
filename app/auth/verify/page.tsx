import { MailCheckIcon } from "lucide-react"
import Link from "next/link"

export default function VerifyPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <MailCheckIcon className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Check your email
        </h1>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          We've sent a confirmation link to your email address.
          Click the link to activate your account and get started.
        </p>
        <p className="text-xs text-muted-foreground">
          Already confirmed?{" "}
          <Link
            href="/auth/login"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
