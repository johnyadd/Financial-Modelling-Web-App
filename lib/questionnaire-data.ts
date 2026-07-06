export const INDUSTRIES: Record<string, string[]> = {
  "Technology": [
    "SaaS / Cloud Software",
    "Fintech",
    "Edtech",
    "Healthtech",
    "Cybersecurity",
    "AI / Machine Learning",
    "E-commerce Platform",
    "Mobile Apps",
    "Developer Tools",
    "Data & Analytics",
  ],
  "Financial Services": [
    "Retail Banking",
    "Investment Banking",
    "Insurance",
    "Asset Management",
    "Payments & Remittance",
    "Lending / Credit",
    "Wealth Management",
    "Cryptocurrency / DeFi",
  ],
  "Healthcare & Life Sciences": [
    "Pharmaceuticals",
    "Medical Devices",
    "Hospitals & Clinics",
    "Diagnostics",
    "Biotech",
    "Mental Health",
    "Health Insurance",
    "Telemedicine",
  ],
  "Consumer & Retail": [
    "D2C E-commerce",
    "Physical Retail",
    "Food & Beverage",
    "Fashion & Apparel",
    "Consumer Electronics",
    "Beauty & Personal Care",
    "Luxury Goods",
    "Subscription Boxes",
  ],
  "Energy & Cleantech": [
    "Renewable Energy (Solar)",
    "Renewable Energy (Wind)",
    "Energy Storage / Batteries",
    "EV & Mobility",
    "Oil & Gas",
    "Carbon Credits",
    "Smart Grid",
    "Waste Management",
  ],
  "Real Estate & Construction": [
    "Residential Development",
    "Commercial Property",
    "PropTech",
    "Construction",
    "REITs",
    "Co-working / Flex Space",
    "Industrial & Logistics",
  ],
  "Manufacturing & Industry": [
    "Automotive",
    "Aerospace & Defence",
    "Electronics Manufacturing",
    "Chemical Industry",
    "Food Processing",
    "Textiles",
    "Heavy Machinery",
  ],
  "Media & Entertainment": [
    "Streaming / OTT",
    "Gaming",
    "Digital Advertising",
    "Publishing",
    "Music",
    "Sports & Live Events",
    "Podcasting",
  ],
  "Professional Services": [
    "Management Consulting",
    "Legal Services",
    "Accounting & Finance",
    "HR & Recruitment",
    "Marketing Agency",
    "IT Consulting",
    "Architecture & Engineering",
  ],
  "Agriculture & Food": [
    "AgriTech",
    "Crop Farming",
    "Livestock",
    "Aquaculture",
    "Food Distribution",
    "Vertical Farming",
  ],
  "Logistics & Transportation": [
    "Freight & Shipping",
    "Last-mile Delivery",
    "Supply Chain Software",
    "Fleet Management",
    "Rail & Aviation",
    "Warehousing",
  ],
  "Education": [
    "K-12 Education",
    "Higher Education",
    "Vocational Training",
    "Online Learning Platform",
    "Tutoring & Test Prep",
    "Corporate Training",
  ],
}

export const REVENUE_MODELS = [
  "Subscription (Monthly/Annual)",
  "Transactional / Per-use",
  "Marketplace / Commission",
  "Freemium",
  "Advertising",
  "Licensing",
  "Project-based / Retainer",
  "Product Sales (One-off)",
  "Usage-based (Metered)",
  "Hybrid (Multiple streams)",
]

export const BUSINESS_STAGES = [
  "Pre-revenue (Idea / MVP)",
  "Early Revenue (< £500k ARR)",
  "Growth Stage (£500k – £5M ARR)",
  "Scale-up (£5M – £20M ARR)",
  "Established (£20M+ ARR)",
]

export const CURRENCIES = [
  { value: "GBP", label: "£ GBP – British Pound" },
  { value: "USD", label: "$ USD – US Dollar" },
  { value: "EUR", label: "€ EUR – Euro" },
  { value: "NGN", label: "₦ NGN – Nigerian Naira" },
  { value: "ZAR", label: "R ZAR – South African Rand" },
  { value: "KES", label: "KSh KES – Kenyan Shilling" },
  { value: "GHS", label: "₵ GHS – Ghanaian Cedi" },
  { value: "AED", label: "AED – UAE Dirham" },
  { value: "CAD", label: "C$ CAD – Canadian Dollar" },
  { value: "AUD", label: "A$ AUD – Australian Dollar" },
]

export const MODEL_TYPES = [
  {
    value: "pre_revenue_dcf",
    label: "Pre-revenue Startup DCF",
    description: "Valuation for pre-revenue startups using discounted cash flows with scenario planning",
    tags: ["Startup", "Valuation", "DCF"],
  },
  {
    value: "three_statement",
    label: "3-Statement Financial Model",
    description: "Integrated Income Statement, Balance Sheet and Cash Flow Statement",
    tags: ["P&L", "Balance Sheet", "Cash Flow"],
  },
  {
    value: "dcf",
    label: "DCF Valuation Model",
    description: "Discounted Cash Flow valuation for businesses with existing revenue",
    tags: ["Valuation", "DCF", "WACC"],
  },
  {
    value: "lbo",
    label: "LBO Model",
    description: "Leveraged Buyout model for private equity acquisition analysis",
    tags: ["Private Equity", "Debt", "Returns"],
  },
  {
    value: "saas",
    label: "SaaS Financial Model",
    description: "MRR/ARR, churn, CAC, LTV and unit economics for SaaS businesses",
    tags: ["SaaS", "MRR", "Unit Economics"],
  },
  {
    value: "ma",
    label: "M&A / Merger Model",
    description: "Accretion/dilution analysis and combined entity pro-forma financials",
    tags: ["M&A", "Synergies", "Accretion"],
  },
]

export const FUNDING_ROUNDS = [
  "Bootstrapped (Self-funded)",
  "Pre-seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C+",
  "Debt / Revenue-based Financing",
  "Grant Funded",
]

export const EMPLOYEE_RANGES = [
  "1 (Solo founder)",
  "2 – 5",
  "6 – 15",
  "16 – 50",
  "51 – 100",
  "100+",
]

export const PROJECTION_YEARS = ["3 years", "5 years", "7 years", "10 years"]

export const GROWTH_DRIVERS = [
  "Organic (word of mouth / SEO)",
  "Paid Marketing (PPC / Social)",
  "Sales Team",
  "Channel / Partnerships",
  "Product-led Growth",
  "Enterprise Sales",
  "Referral / Affiliate",
]

export const COST_DRIVERS = [
  "Headcount / Salaries",
  "Cloud / Infrastructure",
  "Marketing & Advertising",
  "Cost of Goods Sold (COGS)",
  "Office / Facilities",
  "R&D / Product Development",
  "Legal & Professional Fees",
  "Customer Support",
]
