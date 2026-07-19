"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  PaletteIcon, ImageIcon, LoaderIcon, CheckCircle2Icon,
  UploadIcon, ArrowLeftIcon, BriefcaseIcon, EyeIcon, TrashIcon,
} from "lucide-react"

interface BrandingFormProps {
  profileId: string
  initialBranding: {
    firm_name?: string | null
    logo_url?: string | null
    logo_storage_path?: string | null
    primary_color?: string | null
    accent_color?: string | null
    tagline?: string | null
    disclaimer_text?: string | null
    website_url?: string | null
    contact_email?: string | null
  } | null
}

const DEFAULT_DISCLAIMER = `This financial model has been prepared by {firm_name} for the sole use of the named client.

The information contained in this model is confidential and proprietary. It should not be reproduced, distributed, or disclosed to any third party without prior written consent.

The projections and assumptions in this model are based on information provided by the client and reasonable estimates. Actual results may differ materially from those projected. This model does not constitute investment advice, tax advice, or a recommendation to buy or sell any security.

The recipient should conduct their own due diligence and consult with qualified advisors before making any investment or business decision based on this model.`

export function BrandingForm({ profileId, initialBranding }: BrandingFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [firmName, setFirmName] = useState(initialBranding?.firm_name ?? "")
  const [tagline, setTagline] = useState(initialBranding?.tagline ?? "")
  const [primaryColor, setPrimaryColor] = useState(initialBranding?.primary_color ?? "#1E3A5F")
  const [accentColor, setAccentColor] = useState(initialBranding?.accent_color ?? "#27AE60")
  const [disclaimerText, setDisclaimerText] = useState(initialBranding?.disclaimer_text ?? DEFAULT_DISCLAIMER)
  const [websiteUrl, setWebsiteUrl] = useState(initialBranding?.website_url ?? "")
  const [contactEmail, setContactEmail] = useState(initialBranding?.contact_email ?? "")

  const [logoUrl, setLogoUrl] = useState(initialBranding?.logo_url ?? "")
  const [logoStoragePath, setLogoStoragePath] = useState(initialBranding?.logo_storage_path ?? "")
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("Logo file must be under 5MB")
      return
    }
    if (!file.type.startsWith("image/")) {
      setError("File must be an image (PNG, JPG, or SVG)")
      return
    }

    setError(null)
    uploadLogo(file)
    e.target.value = ""
  }

  async function uploadLogo(file: File) {
    setIsUploadingLogo(true)
    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop()
      const path = `${profileId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("vendor-logos")
        .upload(path, file, { cacheControl: "3600", upsert: false })

      if (uploadError) throw new Error(uploadError.message)

      const { data: urlData } = supabase.storage
        .from("vendor-logos")
        .getPublicUrl(path)

      setLogoUrl(urlData.publicUrl)
      setLogoStoragePath(path)
      setSuccess(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logo upload failed")
    } finally {
      setIsUploadingLogo(false)
    }
  }

  async function handleRemoveLogo() {
    if (!logoStoragePath) {
      setLogoUrl("")
      return
    }
    try {
      const supabase = createClient()
      await supabase.storage.from("vendor-logos").remove([logoStoragePath])
      setLogoUrl("")
      setLogoStoragePath("")
    } catch (err) {
      // Silent - remove from UI anyway
      setLogoUrl("")
      setLogoStoragePath("")
    }
  }

  async function handleSave() {
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch("/api/vendor/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firm_name: firmName,
          tagline: tagline,
          primary_color: primaryColor,
          accent_color: accentColor,
          disclaimer_text: disclaimerText,
          website_url: websiteUrl,
          contact_email: contactEmail,
          logo_url: logoUrl,
          logo_storage_path: logoStoragePath,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? "Failed to save branding")

      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-10">

        <button
          onClick={() => router.push("/vendor")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />Back to vendor dashboard
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <BriefcaseIcon className="w-5 h-5 text-orange-600" />
            <Badge variant="outline" className="text-orange-600 border-orange-300">Vendor branding</Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            White-label your client deliverables
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure how your firm's branding appears on models delivered to clients — Excel exports include your logo, colours, and disclaimer.
          </p>
        </div>

        {/* Firm details */}
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Firm details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Firm name</label>
              <Input
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                placeholder="Smith & Co Consulting"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tagline (optional)</label>
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Strategic Finance for UK SMEs"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Website URL</label>
                <Input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://smithco.co.uk"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Contact email</label>
                <Input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="hello@smithco.co.uk"
                  type="email"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo upload */}
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Logo</h2>
          </div>

          {logoUrl ? (
            <div className="flex items-start gap-4">
              <div className="w-32 h-32 rounded-lg border border-border bg-white flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">Logo uploaded</p>
                <p className="text-xs text-muted-foreground mb-3">Will appear on Excel Cover Page</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                    disabled={isUploadingLogo}
                  >
                    <UploadIcon className="w-3 h-3" />Replace
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveLogo}
                    className="gap-2 text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-3 h-3" />Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Upload your firm logo</p>
              <p className="text-xs text-muted-foreground mb-4">PNG, JPG, or SVG · Max 5MB</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingLogo}
                className="gap-2"
              >
                {isUploadingLogo ? (
                  <><LoaderIcon className="w-3 h-3 animate-spin" />Uploading...</>
                ) : (
                  <><UploadIcon className="w-3 h-3" />Choose file</>
                )}
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Colours */}
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <PaletteIcon className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Brand colours</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Primary colour</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 rounded-md border border-border cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#1E3A5F"
                  className="flex-1 font-mono text-xs"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Used for Cover Page headers</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Accent colour</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-12 h-10 rounded-md border border-border cursor-pointer"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#27AE60"
                  className="flex-1 font-mono text-xs"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Used for highlights and PASS badges</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <EyeIcon className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Custom disclaimer</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            This text appears on the Excel Cover Page. Use {"{firm_name}"} as a placeholder for your firm name.
          </p>
          <textarea
            value={disclaimerText}
            onChange={(e) => setDisclaimerText(e.target.value)}
            rows={8}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none font-mono"
          />
        </div>

        {/* Preview */}
        <div className="rounded-xl border-2 border-dashed border-border p-6 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Live preview
          </p>
          <div className="rounded-lg overflow-hidden">
            <div style={{ backgroundColor: primaryColor }} className="p-4 flex items-center gap-3">
              {logoUrl && (
                <div className="w-12 h-12 rounded bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              )}
              <div className="text-white">
                <p className="font-bold text-lg">{firmName || "Your Firm Name"}</p>
                {tagline && <p className="text-xs opacity-90">{tagline}</p>}
              </div>
            </div>
            <div className="p-4 bg-white">
              <p className="text-sm font-medium mb-1" style={{ color: primaryColor }}>
                Sample Client Ltd
              </p>
              <div className="mt-2 flex gap-2">
                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: accentColor, color: "white" }}>
                  MODEL PASSES ALL CHECKS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300 mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 mb-4 flex items-center gap-2">
            <CheckCircle2Icon className="w-4 h-4" />Branding saved successfully
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => router.push("/vendor")}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <><LoaderIcon className="w-4 h-4 animate-spin" />Saving...</>
            ) : (
              <>Save branding</>
            )}
          </Button>
        </div>

      </div>
    </main>
  )
}
