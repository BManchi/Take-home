/**
 * Copilot Money design system — color tokens.
 * Dark theme only (no light mode).
 * All values match the Tailwind config extensions.
 */
export const colors = {
  // ── Backgrounds ─────────────────────────────────────────────────────────────
  background:      '#0E0E10',   // app background (near-black)
  surface:         '#1C1C1E',   // card / section background
  surfaceRaised:   '#2C2C2E',   // modals, bottom sheets
  input:           '#2C2C2E',   // text inputs, pill buttons

  // ── Text ────────────────────────────────────────────────────────────────────
  textPrimary:     '#FFFFFF',
  textSecondary:   '#8E8E93',
  textTertiary:    '#636366',

  // ── Accent (iOS system blue) ─────────────────────────────────────────────────
  accent:          '#0A84FF',

  // ── Budget / Spending states ─────────────────────────────────────────────────
  budgetGreen:        '#34C759',
  budgetLightOrange:  '#FF9F0A',
  budgetDarkOrange:   '#FF6B00',
  budgetRed:          '#FF3B30',

  // ── Income / positive ────────────────────────────────────────────────────────
  incomeGreen:     '#34C759',

  // ── Transaction dot indicators ───────────────────────────────────────────────
  dotReview:       '#0A84FF',   // blue  — needs review
  dotTip:          '#8E8E93',   // gray  — has tip
  dotBadSplit:     '#FF3B30',   // red   — split mismatch

  // ── Structural ──────────────────────────────────────────────────────────────
  separator:       '#38383A',

  // ── Chart lines ─────────────────────────────────────────────────────────────
  chartIdealLine:  '#636366',   // dotted ideal spending trajectory
  chartNetWorth:   '#0A84FF',
  chartAssets:     '#34C759',
  chartLiabilities:'#FF3B30',

  // ── Credit utilization dots ──────────────────────────────────────────────────
  utilizationLow:    '#34C759',   // ≤ 33%
  utilizationMedium: '#FF9F0A',   // 33–66%
  utilizationHigh:   '#FF3B30',   // > 66%
} as const;

export type ColorKey = keyof typeof colors;

/**
 * Returns the budget progress bar color based on spend pace.
 *
 * @param spent        - Amount spent so far (positive value)
 * @param budget       - Total budget for the period (positive value)
 * @param currentDay   - Current day of month (1-based)
 * @param daysInMonth  - Total days in the current month
 */
export function getBudgetColor(
  spent: number,
  budget: number,
  currentDay: number,
  daysInMonth: number,
): string {
  if (budget <= 0) return colors.budgetGreen;
  const percentUsed = spent / budget;
  const idealPercent = currentDay / daysInMonth;
  if (percentUsed > 1.0) return colors.budgetRed;
  const diff = percentUsed - idealPercent;
  if (diff < 0)    return colors.budgetGreen;
  if (diff < 0.20) return colors.budgetLightOrange;
  return colors.budgetDarkOrange;
}

/**
 * Returns credit utilization indicator color.
 * ≤33% green · 33–66% orange · >66% red
 */
export function getUtilizationColor(utilization: number): string {
  if (utilization <= 0.33) return colors.utilizationLow;
  if (utilization <= 0.66) return colors.utilizationMedium;
  return colors.utilizationHigh;
}
