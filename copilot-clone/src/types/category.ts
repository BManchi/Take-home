export interface Category {
  id: string;
  name: string;
  /** Single emoji character e.g. "🍔" */
  emoji: string;
  /** Hex color for progress bar accent e.g. "#FF9500" */
  color: string;
  /** null = optional/unbudgeted */
  budgetAmount: number | null;
  /** Optional categories excluded from totals */
  isOptional: boolean;
  /** FK to CategoryGroup.id; null if ungrouped */
  groupId: string | null;
  rolloverEnabled: boolean;
  /** Current cumulative rollover (can be negative) */
  rolloverBalance: number;
  sortOrder: number;
}

export interface CategoryGroup {
  id: string;
  name: string;
  emoji: string;
  /** Group-level "flex" budget not assigned to subcategories */
  unassignedBudget: number;
  isExpanded: boolean;
  sortOrder: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  /** "YYYY-MM" */
  month: string;
  amount: number;
  /** Carried over from prior month */
  rolloverAmount: number;
  /** amount + rolloverAmount = actual cap */
  effectiveAmount: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string | null;
}
