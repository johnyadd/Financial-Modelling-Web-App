import Stripe from "stripe"

let _stripe: Stripe | null = null

function getStripeInstance(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", { typescript: true })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get: (_target, prop) => {
    const s = getStripeInstance()
    const value = s[prop as keyof Stripe]
    return typeof value === "function" ? (value as Function).bind(s) : value
  }
})

// Tier configuration - single source of truth
export type Tier = "free" | "founder" | "vendor_pro" | "enterprise"

export const TIERS: Record<Tier, {
  name: string
  price: number  // in GBP
  priceId?: string
  features: string[]
  limits: {
    maxModels: number  // -1 = unlimited
    canExport: boolean
    canWhiteLabel: boolean
    hasVendorPortal: boolean
  }
}> = {
  free: {
    name: "Free",
    price: 0,
    features: [
      "1 model total",
      "View results in-app",
      "All charts and metrics",
      "3-statement models",
      "No Excel export",
    ],
    limits: {
      maxModels: 1,
      canExport: false,
      canWhiteLabel: false,
      hasVendorPortal: false,
    },
  },
  founder: {
    name: "Founder",
    price: 29,
    priceId: process.env.STRIPE_PRICE_FOUNDER,
    features: [
      "Unlimited models",
      "Full Excel export (all 9 sheets)",
      "Institutional integrity checks",
      "Cover page and disclaimer",
      "All model types (DCF, 3-Statement, LBO, SaaS)",
      "Priority support",
    ],
    limits: {
      maxModels: -1,
      canExport: true,
      canWhiteLabel: false,
      hasVendorPortal: false,
    },
  },
  vendor_pro: {
    name: "Vendor Pro",
    price: 99,
    priceId: process.env.STRIPE_PRICE_VENDOR_PRO,
    features: [
      "Everything in Founder",
      "Vendor portal for client models",
      "White-label branding on exports",
      "Custom logo and colours",
      "Custom disclaimer text",
      "Unlimited client models",
      "Priority support",
    ],
    limits: {
      maxModels: -1,
      canExport: true,
      canWhiteLabel: true,
      hasVendorPortal: true,
    },
  },
  enterprise: {
    name: "Enterprise",
    price: 0,  // Custom
    features: [
      "Everything in Vendor Pro",
      "Team seats",
      "Custom domain",
      "Priority phone support",
      "Custom integrations",
      "SLA and dedicated CSM",
    ],
    limits: {
      maxModels: -1,
      canExport: true,
      canWhiteLabel: true,
      hasVendorPortal: true,
    },
  },
}

// Map Stripe Price ID -> tier
export function priceIdToTier(priceId: string): Tier {
  if (priceId === process.env.STRIPE_PRICE_FOUNDER) return "founder"
  if (priceId === process.env.STRIPE_PRICE_VENDOR_PRO) return "vendor_pro"
  return "free"
}



