import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { stripe, TIERS, type Tier } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("auth_user_id", user.id)
      .single()

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

    const { tier } = await request.json() as { tier: Tier }
    const tierConfig = TIERS[tier]

    if (!tierConfig?.priceId) {
      return NextResponse.json({ error: "Invalid or non-purchasable tier" }, { status: 400 })
    }

    // Check if user already has a Stripe customer id
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("profile_id", profile.id)
      .maybeSingle()

    let customerId = existingSub?.stripe_customer_id

    // Create Stripe customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile.full_name || undefined,
        metadata: {
          profile_id: profile.id,
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id
    }

    // Origin for return URLs
    const origin = request.headers.get("origin") || request.nextUrl.origin

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: tierConfig.priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?upgraded=true&tier=${tier}`,
      cancel_url: `${origin}/pricing`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: {
        profile_id: profile.id,
        tier: tier,
      },
      subscription_data: {
        metadata: {
          profile_id: profile.id,
          tier: tier,
        },
      },
    })

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({
      error: "Internal server error",
      detail: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
