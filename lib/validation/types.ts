// Validation layer types
// Layer 1 (this session): field-level warnings that fire on value change
// Layer 2 (future session): cross-field warnings, displayed in a review panel

export type Severity = "info" | "warning" | "error"

export interface FieldWarning {
  severity: Severity
  message: string
  /** Optional inline fix suggestion — "Did you mean X?" */
  suggestion?: string
}

/**
 * A checker takes a field value and optional context (typically cross-step data
 * from the Zustand store), and returns a warning if the value looks wrong.
 * Returns null when the value is acceptable or when it can't be checked
 * (missing prerequisites).
 */
export type FieldChecker<TContext = Record<string, unknown>> = (
  value: string,
  context: TContext
) => FieldWarning | null
