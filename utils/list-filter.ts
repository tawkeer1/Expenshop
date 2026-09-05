import type { ExpenseItem, ShoppingListItem } from "@/app/models/shoppinglist";
import { getDateKey } from "@/app/models/shoppinglist";

import type { ExpenseEntry } from "@/utils/list-sort";

export type DateFilter = "all" | "today" | "thisMonth";

export interface ListFilterState {
  query: string;
  category: string | null;
  source: string | null;
  dateFilter: DateFilter;
}

export const emptyListFilters: ListFilterState = {
  query: "",
  category: null,
  source: null,
  dateFilter: "all",
};

const normalize = (value: string) => value.toLowerCase().trim();

const matchesQuery = (query: string, ...fields: (string | number)[]) => {
  if (!query.trim()) {
    return true;
  }

  const normalizedQuery = normalize(query);
  return fields.some((field) => normalize(String(field)).includes(normalizedQuery));
};

const matchesDateFilter = (date: string, dateFilter: DateFilter, referenceDate = new Date()) => {
  if (dateFilter === "all") {
    return true;
  }

  const dayKey = getDateKey(referenceDate);

  if (dateFilter === "today") {
    return date === dayKey;
  }

  return date.startsWith(dayKey.slice(0, 7));
};

export const isFilterActive = (filters: ListFilterState) =>
  Boolean(filters.query.trim()) ||
  filters.category !== null ||
  filters.source !== null ||
  filters.dateFilter !== "all";

export const getUniqueValues = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));

export const filterShoppingItems = (
  items: ShoppingListItem[],
  filters: ListFilterState,
  referenceDate = new Date(),
) =>
  items.filter((item) => {
    if (filters.category && item.category !== filters.category) {
      return false;
    }

    if (!matchesDateFilter(item.purchasedDate, filters.dateFilter, referenceDate)) {
      return false;
    }

    return matchesQuery(
      filters.query,
      item.name,
      item.category,
      item.purchasedDate,
      item.price,
      item.quantity,
      item.quantity * item.price,
    );
  });

export const filterExpenseEntries = (
  entries: ExpenseEntry[],
  filters: ListFilterState,
  referenceDate = new Date(),
) =>
  entries.filter((entry) => {
    if (filters.category && entry.category !== filters.category) {
      return false;
    }

    if (filters.source && entry.source !== filters.source) {
      return false;
    }

    if (!matchesDateFilter(entry.date, filters.dateFilter, referenceDate)) {
      return false;
    }

    return matchesQuery(
      filters.query,
      entry.label,
      entry.category,
      entry.source,
      entry.date,
      entry.amount,
    );
  });

export const filterExpenseItems = (
  items: ExpenseItem[],
  filters: Omit<ListFilterState, "source">,
  referenceDate = new Date(),
) =>
  items.filter((item) => {
    if (filters.category && item.category !== filters.category) {
      return false;
    }

    if (!matchesDateFilter(item.purchasedDate, filters.dateFilter, referenceDate)) {
      return false;
    }

    return matchesQuery(
      filters.query,
      item.description,
      item.category,
      item.purchasedDate,
      item.amount,
    );
  });
