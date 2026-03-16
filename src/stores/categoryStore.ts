import { create } from 'zustand';
import type { Category, CategoryGroup, Tag } from '../types';
import { MOCK_CATEGORIES, MOCK_CATEGORY_GROUPS, MOCK_TAGS } from '../__mocks__/categories';

interface CategoryStore {
  categories: Category[];
  groups: CategoryGroup[];
  tags: Tag[];
  // ── Mutators ────────────────────────────────────────────────────────────────
  updateCategory: (id: string, updates: Partial<Category>) => void;
  setBudget: (categoryId: string, amount: number) => void;
  toggleGroupExpanded: (groupId: string) => void;
  addTag: (tag: Tag) => void;
  removeTag: (tagId: string) => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: MOCK_CATEGORIES,
  groups: MOCK_CATEGORY_GROUPS,
  tags: MOCK_TAGS,

  updateCategory: (id, updates) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    })),

  setBudget: (categoryId, amount) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId ? { ...c, budgetAmount: amount } : c,
      ),
    })),

  toggleGroupExpanded: (groupId) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId ? { ...g, isExpanded: !g.isExpanded } : g,
      ),
    })),

  addTag: (tag) =>
    set((state) => ({ tags: [...state.tags, tag] })),

  removeTag: (tagId) =>
    set((state) => ({ tags: state.tags.filter((t) => t.id !== tagId) })),
}));
