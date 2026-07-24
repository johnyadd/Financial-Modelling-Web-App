"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart2Icon,
  LogOutIcon,
  UserIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  LayoutDashboardIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { User } from "@supabase/supabase-js"

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<{
    id: string
    full_name: string | null
    role: string
  } | null>(null)
  const [tier, setTier] = useState<string>("free")
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq("auth_user_id", user.id)
          .single()
          .then(({ data }) => {
            setProfile(data)
            if (data) {
              supabase
                .from("subscriptions")
                .select("tier, status")
                .eq("profile_id", data.id ?? "")
                .maybeSingle()
                .then(({ data: sub }) => {
                  if (sub && (sub.status === "active" || sub.status === "trialing")) {
                    setTier(sub.tier)
                  }
                })
            }
          })
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (!session?.user) setProfile(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setMenuOpen(false)
    router.push("/")
    router.refresh()
  }

  const isVendor = profile?.role === "vendor"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground hover:opacity-80 transition-opacity"
        >
          <BarChart2Icon className="w-5 h-5 text-primary" />
          <span>FinModels UK</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md transition-colors"
          >
            Home
          </Link>
          {mounted && user && (
            <>
              {isVendor ? (
                <Link
                  href="/vendor"
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md transition-colors"
                >
                  Vendor portal
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md transition-colors"
                >
                  My models
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-2">
          {!mounted ? null : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  {isVendor
                    ? <BriefcaseIcon className="w-3 h-3 text-primary" />
                    : <UserIcon className="w-3 h-3 text-primary" />
                  }
                </div>
                <span className="text-foreground font-medium hidden sm:block">
                  {profile?.full_name?.split(" ")[0] ?? "Account"}
                </span>
                {profile?.role && (
                  <div className="hidden sm:flex items-center gap-1">
                    {tier === "founder" && (
                      <Badge className="text-xs px-1.5 py-0 bg-blue-500 text-white hover:bg-blue-600">Founder</Badge>
                    )}
                    {tier === "vendor_pro" && (
                      <Badge className="text-xs px-1.5 py-0 bg-orange-500 text-white hover:bg-orange-600">Vendor Pro</Badge>
                    )}
                    {tier === "enterprise" && (
                      <Badge className="text-xs px-1.5 py-0 bg-purple-500 text-white hover:bg-purple-600">Enterprise</Badge>
                    )}
                    {tier === "free" && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">Free</Badge>
                    )}
                  </div>
                )}
                <ChevronDownIcon className={cn(
                  "w-3 h-3 text-muted-foreground transition-transform",
                  menuOpen && "rotate-180"
                )} />
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-medium text-foreground truncate">
                      {profile?.full_name ?? user.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href={isVendor ? "/vendor" : "/dashboard"}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <LayoutDashboardIcon className="w-4 h-4 text-muted-foreground" />
                      {isVendor ? "Vendor portal" : "My models"}
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                      Profile settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    >
                      <LogOutIcon className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">Get started free</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}


