// Three-case scenario support.
//
// Single-switch pattern per the FAST Standard and ICAEW Financial Modelling
// Code: ONE model holds one set of base assumptions, and the upside and
// downside cases are sparse override maps applied on top. Duplicating the
// whole model per case is the anti-pattern those standards exist to prevent.
//
// Base is never stored as a case - step2/step3/step4 on model_inputs ARE the
// base, so it cannot drift out of sync with what the user edits.

export type ScenarioCase = "base" | "upside" | "downside"

export const SCENARIO_CASES: ScenarioCase[] = ["base", "upside", "downside"]

export const SCENARIO_LABELS: Record<ScenarioCase, string> = {
  base:     "Base",
  upside:   "Upside",
  downside: "Downside",
}

/** Sparse overrides, mirroring the questionnaire step shape so they merge cleanly. */
export interface ScenarioOverrides {
  step2?: Record<string, unknown>
  step3?: Record<string, unknown>
  step4?: Record<string, unknown>
}

/** Stored on model_inputs.scenarios. Absent cases simply are not modelled. */
export interface ScenarioSet {
  upside?: ScenarioOverrides
  downside?: ScenarioOverrides
}

/**
 * Applies one case's overrides to the base step data. Returns the base
 * untouched when the case is "base" or has no overrides.
 */
export function applyScenarioOverrides(
  base: { step2: Record<string, unknown>; step3: Record<string, unknown>; step4: Record<string, unknown> },
  overrides?: ScenarioOverrides
): { step2: Record<string, unknown>; step3: Record<string, unknown>; step4: Record<string, unknown> } {
  if (!overrides) return base
  return {
    step2: { ...base.step2, ...(overrides.step2 ?? {}) },
    step3: { ...base.step3, ...(overrides.step3 ?? {}) },
    step4: { ...base.step4, ...(overrides.step4 ?? {}) },
  }
}

/** Flat list of every overridden field, for the bridge and the UI summary. */
export function listOverriddenFields(overrides?: ScenarioOverrides): string[] {
  if (!overrides) return []
  const keys: string[] = []
  for (const step of ["step2", "step3", "step4"] as const) {
    for (const k of Object.keys(overrides[step] ?? {})) keys.push(k)
  }
  return keys
}
