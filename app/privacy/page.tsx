export const metadata = {
  title: "Privacy Policy | Finanyst",
  description: "Finanyst privacy policy — how we handle your data.",
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="font-display text-5xl mb-4 text-foreground">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="prose prose-neutral max-w-none space-y-6 text-foreground">
        <p className="text-lg leading-relaxed">
          Finanyst takes your privacy seriously. This is a summary of how we handle your data. A full policy document is being finalised.
        </p>

        <h2 className="font-display text-2xl mt-8">What we collect</h2>
        <p>We collect the minimum information needed to provide the service: your email address, your business context (industry, stage, etc. that you enter in the questionnaire), and the financial models you create. Payment information is handled entirely by Stripe — we never see or store your card details.</p>

        <h2 className="font-display text-2xl mt-8">How we use it</h2>
        <p>Your data is used solely to provide the Finanyst service: generating financial models, providing AI-powered suggestions via Claude, and managing your subscription. We do not sell or share your data with third parties for marketing purposes.</p>

        <h2 className="font-display text-2xl mt-8">Data storage</h2>
        <p>Data is stored in Supabase (SOC 2 Type II certified) with row-level security ensuring each user only sees their own data. AI processing uses Anthropic&apos;s Claude API. Payment processing is handled by Stripe (PCI DSS Level 1 certified).</p>

        <h2 className="font-display text-2xl mt-8">Your rights (GDPR)</h2>
        <p>Under GDPR, you have the right to access, correct, or delete your data at any time. To exercise these rights, contact us at <a href="mailto:hello@finanyst.com" className="text-primary hover:underline">hello@finanyst.com</a>.</p>

        <h2 className="font-display text-2xl mt-8">Contact</h2>
        <p>For any privacy questions, please email <a href="mailto:hello@finanyst.com" className="text-primary hover:underline">hello@finanyst.com</a>. Full privacy policy documentation will be published shortly.</p>
      </div>
    </main>
  )
}
