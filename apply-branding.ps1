# Applies vendor branding to Excel Cover Page
# Modifies buildWorkbook signature and cover page code

$filePath = "app\api\models\export\[id]\route.ts"
$content = Get-Content -LiteralPath $filePath -Raw

Write-Host "Applying vendor branding refactor..."

# 1. Update buildWorkbook function signature
$oldSig = 'async function buildWorkbook(model: Record<string, unknown>, output: Record<string, unknown>, currency: string): Promise<ExcelJS.Workbook>'
$newSig = @'
async function buildWorkbook(
  model: Record<string, unknown>,
  output: Record<string, unknown>,
  currency: string,
  branding?: {
    firm_name?: string | null
    logo_url?: string | null
    primary_color?: string | null
    accent_color?: string | null
    tagline?: string | null
    disclaimer_text?: string | null
  } | null
): Promise<ExcelJS.Workbook>
'@

if ($content.Contains($oldSig)) {
    $content = $content.Replace($oldSig, $newSig)
    Write-Host "  1. Function signature updated"
} else {
    Write-Host "  1. Function signature already updated (skipped)"
}

# 2. Add branding variables after currency setup
$oldVarSetup = 'const cFmt = currencyFmt(currency)'
$newVarSetup = @'
const cFmt = currencyFmt(currency)

  // Vendor branding (falls back to FinModels UK defaults)
  const brandingHeaderColor = branding?.primary_color?.replace("#", "") || "1E3A5F"
  const brandingAccentColor = branding?.accent_color?.replace("#", "") || "27AE60"
  const brandingFirmName = branding?.firm_name || "FinModels UK"
  const brandingTagline = branding?.tagline || "Institutional Financial Model"
  const brandingDisclaimer = branding?.disclaimer_text || null
'@

if ($content.Contains($oldVarSetup) -and -not $content.Contains("brandingHeaderColor")) {
    $content = $content.Replace($oldVarSetup, $newVarSetup)
    Write-Host "  2. Branding variables added"
} else {
    Write-Host "  2. Branding variables already present (skipped)"
}

# 3. Update Cover Page title cell
$content = $content.Replace(
    'titleCell.value = "FinModels UK"',
    'titleCell.value = brandingFirmName'
)
$content = $content.Replace(
    'titleCell.font = { bold: true, size: 24, color: { argb: "1E3A5F" } }',
    'titleCell.font = { bold: true, size: 24, color: { argb: brandingHeaderColor } }'
)
Write-Host "  3. Title cell updated"

# 4. Update subtitle
$content = $content.Replace(
    'subtitleCell.value = "Institutional Financial Model"',
    'subtitleCell.value = brandingTagline'
)
Write-Host "  4. Subtitle updated"

# 5. Update divider borders
$content = $content -replace 'bottom: \{ style: "medium", color: \{ argb: "1E3A5F" \} \}', 'bottom: { style: "medium", color: { argb: brandingHeaderColor } }'
Write-Host "  5. Dividers updated"

# 6. Update client cell colour
$content = $content.Replace(
    'clientCell.font = { bold: true, size: 20, color: { argb: "1E3A5F" } }',
    'clientCell.font = { bold: true, size: 20, color: { argb: brandingHeaderColor } }'
)
Write-Host "  6. Client cell colour updated"

# 7. Update section headers (fgColor)
$content = $content -replace 'fgColor: \{ argb: "1E3A5F" \}', 'fgColor: { argb: brandingHeaderColor }'
Write-Host "  7. Section headers coloured"

# 8. Update metadata value cell colours
$content = $content.Replace(
    'valueCell.font = { bold: true, size: 10, color: { argb: "1E3A5F" } }',
    'valueCell.font = { bold: true, size: 10, color: { argb: brandingHeaderColor } }'
)
$content = $content.Replace(
    'sheetCell.font = { bold: true, size: 10, color: { argb: "1E3A5F" } }',
    'sheetCell.font = { bold: true, size: 10, color: { argb: brandingHeaderColor } }'
)
Write-Host "  8. Metadata cell colours updated"

# 9. Update PASS colour for integrity flag
$content = $content.Replace(
    'color: { argb: modelIntegrityPassed ? "27AE60" : "C0392B" }',
    'color: { argb: modelIntegrityPassed ? brandingAccentColor : "C0392B" }'
)
Write-Host "  9. PASS colour updated"

# 10. Update GET handler to fetch vendor branding
$oldHandler = @'
    const currency = (model.step1_business as Record<string, string>).currency ?? "GBP"
    const businessName = (model.step1_business as Record<string, string>).businessName ?? "Model"

    // Build workbook
    const wb = await buildWorkbook(model, output, currency)
'@

$newHandler = @'
    const currency = (model.step1_business as Record<string, string>).currency ?? "GBP"
    const businessName = (model.step1_business as Record<string, string>).businessName ?? "Model"

    // Fetch vendor branding if this is a vendor-created model
    let vendorBranding = null
    if (model.source === "vendor" && model.user_id) {
      const { data: branding } = await supabase
        .from("vendor_branding")
        .select("firm_name, logo_url, primary_color, accent_color, tagline, disclaimer_text")
        .eq("vendor_profile_id", model.user_id)
        .maybeSingle()
      vendorBranding = branding
    }

    // Build workbook
    const wb = await buildWorkbook(model, output, currency, vendorBranding)
'@

if ($content.Contains($oldHandler)) {
    $content = $content.Replace($oldHandler, $newHandler)
    Write-Host "  10. GET handler updated to fetch vendor branding"
} else {
    Write-Host "  10. GET handler already updated (or not found - check manually)"
}

Set-Content -LiteralPath $filePath -Value $content -Encoding UTF8
Write-Host ""
Write-Host "Refactor complete. Restart dev server if running."
