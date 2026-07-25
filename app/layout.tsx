import type { Metadata } from "next"
import { Inter, Instrument_Serif } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/auth/navbar"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Finanyst — AI-native financial intelligence",
  description:
    "Build institutional-quality financial models with AI-powered analysis. Purpose-built for founders, finance teams, and advisors. Multi-currency, global-ready.",
  metadataBase: new URL("https://finanyst.com"),
  openGraph: {
    title: "Finanyst — AI-native financial intelligence",
    description:
      "Build institutional-quality financial models with AI-powered analysis. Purpose-built for founders, finance teams, and advisors.",
    url: "https://finanyst.com",
    siteName: "Finanyst",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finanyst — AI-native financial intelligence",
    description:
      "Build institutional-quality financial models with AI-powered analysis.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${instrumentSerif.variable} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
