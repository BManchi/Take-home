import type { Category, CategoryGroup, Tag } from '../types';

export const MOCK_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'grp-food',
    name: 'Food & Dining',
    emoji: '🍽️',
    unassignedBudget: 0,
    isExpanded: true,
    sortOrder: 1,
  },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-01', name: 'Restaurants',   emoji: '🍔', color: '#FF9500', budgetAmount: 250,  groupId: 'grp-food', isOptional: false, rolloverEnabled: true,  rolloverBalance: 0,  sortOrder: 1 },
  { id: 'cat-02', name: 'Groceries',     emoji: '🛒', color: '#34C759', budgetAmount: 300,  groupId: 'grp-food', isOptional: false, rolloverEnabled: true,  rolloverBalance: 0,  sortOrder: 2 },
  { id: 'cat-03', name: 'Housing',       emoji: '🏠', color: '#636366', budgetAmount: 1600, groupId: null,       isOptional: false, rolloverEnabled: false, rolloverBalance: 0,  sortOrder: 3 },
  { id: 'cat-04', name: 'Transport',     emoji: '🚗', color: '#0A84FF', budgetAmount: 150,  groupId: null,       isOptional: false, rolloverEnabled: true,  rolloverBalance: 15, sortOrder: 4 },
  { id: 'cat-05', name: 'Subscriptions', emoji: '📱', color: '#5E5CE6', budgetAmount: 80,   groupId: null,       isOptional: false, rolloverEnabled: false, rolloverBalance: 0,  sortOrder: 5 },
  { id: 'cat-06', name: 'Health',        emoji: '💊', color: '#FF2D55', budgetAmount: 100,  groupId: null,       isOptional: false, rolloverEnabled: true,  rolloverBalance: 0,  sortOrder: 6 },
  { id: 'cat-07', name: 'Entertainment', emoji: '🎬', color: '#FF6B00', budgetAmount: 120,  groupId: null,       isOptional: false, rolloverEnabled: true,  rolloverBalance: 0,  sortOrder: 7 },
  { id: 'cat-08', name: 'Coffee',        emoji: '☕', color: '#A2845E', budgetAmount: 60,   groupId: 'grp-food', isOptional: false, rolloverEnabled: true,  rolloverBalance: -8, sortOrder: 8 },
  { id: 'cat-09', name: 'Shopping',      emoji: '🛍️', color: '#FF9F0A', budgetAmount: 200,  groupId: null,       isOptional: false, rolloverEnabled: true,  rolloverBalance: 0,  sortOrder: 9 },
  { id: 'cat-10', name: 'Travel',        emoji: '✈️', color: '#30D158', budgetAmount: null, groupId: null,       isOptional: true,  rolloverEnabled: false, rolloverBalance: 0,  sortOrder: 10 },
  { id: 'cat-11', name: 'Personal Care', emoji: '🪥', color: '#64D2FF', budgetAmount: 50,   groupId: null,       isOptional: false, rolloverEnabled: true,  rolloverBalance: 0,  sortOrder: 11 },
  { id: 'cat-12', name: 'Utilities',     emoji: '💡', color: '#FFD60A', budgetAmount: 120,  groupId: null,       isOptional: false, rolloverEnabled: false, rolloverBalance: 0,  sortOrder: 12 },
  { id: 'cat-13', name: 'Gifts',         emoji: '🎁', color: '#FF375F', budgetAmount: 50,   groupId: null,       isOptional: true,  rolloverEnabled: true,  rolloverBalance: 0,  sortOrder: 13 },
  { id: 'cat-14', name: 'Fitness',       emoji: '🏋️', color: '#30D158', budgetAmount: 80,   groupId: null,       isOptional: false, rolloverEnabled: false, rolloverBalance: 0,  sortOrder: 14 },
  { id: 'cat-15', name: 'Other',         emoji: '🗂️', color: '#636366', budgetAmount: 100,  groupId: null,       isOptional: false, rolloverEnabled: true,  rolloverBalance: 0,  sortOrder: 15 },
];

export const MOCK_TAGS: Tag[] = [
  { id: 'tag-01', name: 'Date Night', color: '#FF375F' },
  { id: 'tag-02', name: 'Party',      color: '#5E5CE6' },
  { id: 'tag-03', name: 'Work',       color: '#0A84FF' },
  { id: 'tag-04', name: 'Vacation',   color: '#30D158' },
];
