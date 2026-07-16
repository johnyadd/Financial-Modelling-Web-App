"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  EyeIcon, EyeOffIcon, LoaderIcon,
  RocketIcon, BuildingIcon, BriefcaseIcon,
} from "lucide-react"
import Link from "next/link"

const signupSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email:    z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  role:     z.enum(["startup_founder", "existing_business", "vendor"], {
    required_error: "Please select your account type",
  }),
})

type SignupData = z.infer<typeof signupSchema>

const ROLES = [
  {
    value: "startup_founder" as const,
    icon: <RocketIcon className="w-4 h-4" />,
    label: "Startup founder",
    sub: "Building something new",
  },
  {
    value: "existing_business" as const,
    icon: <BuildingIcon className="w-4 h-4" />,
    label: "Existing business",
    sub: "Have trading history",
  },
  {
    value: "vendor" as const,
    icon: <BriefcaseIcon className="w-4 h-4" />,
    label: "Financial consultant",
    sub: "Building for clients",
  },
]

export function SignupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email:    "",
      password: "",
    },
  })

  async function onSubmit(values: SignupData) {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email:    values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          role:      values.role,
        },
        emailRedirectTo: "http://localhost:3000/auth/callback",
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Update profile with role immediately
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from("profiles")
        .update({ role: values.role, full_name: values.fullName })
        .eq("auth_user_id", user.id)
    }

    // Redirect to email verification page
    router.push("/onboarding")
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {/* Role selection */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>I am a</FormLabel>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((role) => {
                    const isSelected = field.value === role.value
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => field.onChange(role.value)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-all",
                          "hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background"
                        )}
                      >
                        <span className={cn(
                          "transition-colors",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )}>
                          {role.icon}
                        </span>
                        <span className="text-xs font-medium text-foreground leading-tight">
                          {role.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-tight">
                          {role.sub}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Smith"
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      autoComplete="new-password"
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword
                        ? <EyeOffIcon className="w-4 h-4" />
                        : <EyeIcon className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderIcon className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create free account"
            )}
          </Button>
        </form>
      </Form>

      <Separator className="my-5" />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-primary font-medium hover:underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-muted-foreground mt-3">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}
