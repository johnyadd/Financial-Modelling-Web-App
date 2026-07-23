import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Anthropic from "@anthropic-ai/sdk"
import { getAssumption, getAISuggestion as staticFallback } from "@/lib/schemas/assumptions"
import type { AISuggestionContext, AISuggestionResult } from "@/lib/schemas/assumptions"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { assumptionKey, context } = await request.json() as {
      assumptionKey: string
      context: AISuggestionContext
    }

    const assumption = getAssumption(assumptionKey)
    if (!assumption) {
      return NextResponse.json({ error: "Unknown assumption" }, { status: 400 })
    }

    // Try static logic first (fast, free)
    const staticResult = staticFallback(assumptionKey, context)

    // If assumption has no static logic OR context is rich enough for LLM upgrade, call Claude
    const shouldCallLLM = assumption.getAISuggestion !== undefined &&
      (context.industry || context.subSector || context.businessStage)

    if (!shouldCallLLM) {
      return NextResponse.json({ suggestion: staticResult, source: "static" })
    }

    // Build a focused prompt for the LLM
    const prompt = `You are a financial modelling expert helping a UK founder or finance team.

Suggest a value for this assumption:
- Field: ${assumption.label}
- Description: ${assumption.description}
- Type: ${assumption.type}
${assumption.min !== undefined ? `- Min: ${assumption.min}` : ""}
${assumption.max !== undefined ? `- Max: ${assumption.max}` : ""}
${assumption.audit?.industryTypical ? `- Industry typical: ${assumption.audit.industryTypical}` : ""}
${assumption.helpText ? `- Guidance: ${assumption.helpText}` : ""}

Business context:
- Industry: ${context.industry ?? "unknown"}
- Sub-sector: ${context.subSector ?? "unknown"}
- Business stage: ${context.businessStage ?? "unknown"}
- Country: ${context.country ?? "United Kingdom"}
- Currency: ${context.currency ?? "GBP"}
- Model type: ${context.modelType ?? "unknown"}
${context.currentValues ? `- Other assumptions so far: ${JSON.stringify(context.currentValues)}` : ""}

${staticResult ? `A static fallback rule suggests: ${staticResult.value} (${staticResult.rationale})` : ""}

Return ONLY a JSON object with this exact shape:
{
  "value": <number>,
  "rationale": "<one short sentence explaining why>",
  "confidence": "low" | "medium" | "high",
  "source": "<optional short citation e.g. 'SaaS Capital 2024'>"
}
No markdown, no explanation, only the JSON.`

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    try {
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim()
      const suggestion: AISuggestionResult = JSON.parse(cleanText)
      return NextResponse.json({ suggestion, source: "llm" })
    } catch (parseError) {
      // Fallback to static if LLM output malformed
      return NextResponse.json({
        suggestion: staticResult,
        source: "static_fallback",
        parseError: parseError instanceof Error ? parseError.message : String(parseError)
      })
    }

  } catch (error) {
    console.error("AI suggest error:", error)
    return NextResponse.json({
      error: "Failed to generate suggestion",
      detail: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
