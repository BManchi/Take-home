/**
 * Copilot Money design system — color tokens.
 * Supports light and dark mode. useColors() returns the active palette.
 */
import { useColorScheme } from 'react-native';

const shared = {
  accent:              '#0A84FF',
  budgetGreen:         '#34C759',
  budgetLightOrange:   '#FF9F0A',
  budgetDarkOrange:    '#FF6B00',
  budgetRed:           '#FF3B30',
  incomeGreen:         '#34C759',
  dotReview:           '#0A84FF',
  dotTip:              '#8E8E93',
  dotBadSplit:         '#FF3B30',
  chartIdealLine:      '#8E8E93',
  chartNetWorth:       '#0A84FF',
  chartAssets:         '#34C759',
  chartLiabilities:    '#FF3B30',
  utilizationLow:      '#34C759',
  utilizationMedium:   '#FF9F0A',
  utilizationHigh:     '#FF3B30',
} as const;

export const darkColors = {
  ...shared,
  background:    '#0E0E10',
  surface:       '#1C1C1E',
  surfaceRaised: '#2C2C2E',
  input:         '#2C2C2E',
  textPrimary:   '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary:  '#636366',
  separator:     '#38383A',
} as const;

export const lightColors = {
  ...shared,
  background:    '#F2F2F7',
  surface:       '#FFFFFF',
  surfaceRaised: '#EFEFF4',
  input:         '#E5E5EA',
  textPrimary:   '#000000',
  textSecondary: '#6C6C70',
  textTertiary:  '#AEAEB2',
  separator:     '#C6C6C8',
} as const;

/** Static dark palette — use only outside React components (e.g. gifted-charts color props). */
export const colors = darkColors;

/** Theme-aware hook — always use this inside React components. */
export function useColors() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
}

export type AppColors = typeof darkColors;

/**
 * Returns the budget progress bar color based on spend pace.
 */
export function getBudgetColor(
  spent: number,
  budget: number,
  currentDay: number,
  daysInMonth: number,
): string {
  if (budget <= 0) return shared.budgetGreen;
  const percentUsed = spent / budget;
  const idealPercent = currentDay / daysInMonth;
  if (percentUsed > 1.0) return shared.budgetRed;
  const diff = percentUsed - idealPercent;
  if (diff < 0)    return shared.budgetGreen;
  if (diff < 0.20) return shared.budgetLightOrange;
  return shared.budgetDarkOrange;
}

/**
 * Returns credit utilization indicator color.
 * ≤33% green · 33–66% orange · >66% red
 */
export function getUtilizationColor(utilization: number): string {
  if (utilization <= 0.33) return shared.utilizationLow;
  if (utilization <= 0.66) return shared.utilizationMedium;
  return shared.utilizationHigh;
}
