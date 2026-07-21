import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe, priceIdToTier } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const adminClient = createAdminClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const profileId = session.metadata?.profile_id
        const tier = session.metadata?.tier
        if (!profileId || !session.subscription) break

        // Fetch subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        await adminClient.from("subscriptions").upsert({
          profile_id: profileId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0].price.id,
          tier: tier || "founder",
          status: subscription.status,
          current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : (subscription.items?.data?.[0]?.current_period_start ? new Date(subscription.items.data[0].current_period_start * 1000).toISOString() : null),
          current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : (subscription.items?.data?.[0]?.current_period_end ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString() : null),
          cancel_at_period_end: subscription.cancel_at_period_end,
        }, { onConflict: "profile_id" })

        console.log(`Subscription activated for profile ${profileId} at tier ${tier}`)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0].price.id
        const tier = priceIdToTier(priceId)

        await adminClient
          .from("subscriptions")
          .update({
            stripe_price_id: priceId,
            tier: tier,
            status: subscription.status,
            current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : (subscription.items?.data?.[0]?.current_period_start ? new Date(subscription.items.data[0].current_period_start * 1000).toISOString() : null),
            current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : (subscription.items?.data?.[0]?.current_period_end ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString() : null),
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          })
          .eq("stripe_subscription_id", subscription.id)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await adminClient
          .from("subscriptions")
          .update({
            tier: "free",
            status: "canceled",
            canceled_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await adminClient
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription as string)
        }
        break
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({
      error: "Webhook processing failed",
      detail: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

