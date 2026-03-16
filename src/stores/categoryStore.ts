import { create } from 'zustand';
import { eq } from 'drizzle-orm';
import { db } from '../database/client';
import { categories as catTable, categoryGroups as grpTable, tags as tagTable } from '../database/schema';
import {
  loadAllCategories,
  loadAllGroups,
  loadAllTags,
} from '../database/db-service';
import { MOCK_CATEGORIES, MOCK_CATEGORY_GROUPS, MOCK_TAGS } from '../__mocks__/categories';
import type { Category, CategoryGroup, Tag } from '../types';

interface CategoryStore {
  categories: Category[];
  groups: CategoryGroup[];
  tags: Tag[];
  // ── Init ────────────────────────────────────────────────────────────────────
  initFromDb: () => Promise<void>;
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

  initFromDb: async () => {
    try {
      const [cats, groups, tags] = await Promise.all([
        loadAllCategories(),
        loadAllGroups(),
        loadAllTags(),
      ]);
      if (cats.length > 0) set({ categories: cats, groups, tags });
    } catch (err) {
      console.error('[DB] categoryStore.initFromDb failed:', err);
    }
  },

  updateCategory: (id, updates) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    }));
    const dbUpdates: Partial<typeof catTable.$inferInsert> = {};
    if (updates.name            !== undefined) dbUpdates.name            = updates.name;
    if (updates.emoji           !== undefined) dbUpdates.emoji           = updates.emoji;
    if (updates.color           !== undefined) dbUpdates.color           = updates.color;
    if (updates.budgetAmount    !== undefined) dbUpdates.budgetAmount    = updates.budgetAmount;
    if (updates.isOptional      !== undefined) dbUpdates.isOptional      = updates.isOptional;
    if (updates.rolloverEnabled !== undefined) dbUpdates.rolloverEnabled = updates.rolloverEnabled;
    if (updates.rolloverBalance !== undefined) dbUpdates.rolloverBalance = updates.rolloverBalance;
    if (updates.sortOrder       !== undefined) dbUpdates.sortOrder       = updates.sortOrder;

    if (Object.keys(dbUpdates).length > 0) {
      db.update(catTable)
        .set(dbUpdates)
        .where(eq(catTable.id, id))
        .catch((err) => console.error('[DB] updateCategory failed:', err));
    }
  },

  setBudget: (categoryId, amount) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId ? { ...c, budgetAmount: amount } : c,
      ),
    }));
    db.update(catTable)
      .set({ budgetAmount: amount })
      .where(eq(catTable.id, categoryId))
      .catch((err) => console.error('[DB] setBudget failed:', err));
  },

  toggleGroupExpanded: (groupId) => {
    let nextExpanded = true;
    set((state) => {
      const updated = state.groups.map((g) => {
        if (g.id === groupId) {
          nextExpanded = !g.isExpanded;
          return { ...g, isExpanded: nextExpanded };
        }
        return g;
      });
      return { groups: updated };
    });
    db.update(grpTable)
      .set({ isExpanded: nextExpanded })
      .where(eq(grpTable.id, groupId))
      .catch((err) => console.error('[DB] toggleGroupExpanded failed:', err));
  },

  addTag: (tag) => {
    set((state) => ({ tags: [...state.tags, tag] }));
    db.insert(tagTable)
      .values(tag)
      .onConflictDoNothing()
      .catch((err) => console.error('[DB] addTag failed:', err));
  },

  removeTag: (tagId) => {
    set((state) => ({ tags: state.tags.filter((t) => t.id !== tagId) }));
    // No DELETE in schema mutations for now — tag removal is rare and
    // the record stays orphaned in the DB (doesn't affect UI).
  },
}));
