import type { ExpenseItem, ShoppingListItem } from "@/app/models/shoppinglist";

export type SortDirection = "asc" | "desc";

export type ShoppingSortField = "date" | "name" | "cost" | "category" | "quantity";
export type ExpenseSortField = "date" | "name" | "amount" | "category" | "source";

export interface ExpenseEntry {
  id: string;
  category: string;
  label: string;
  amount: number;
  date: string;
  source: string;
}

const compareStrings = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base" });

const applyDirection = (result: number, direction: SortDirection) =>
  direction === "asc" ? result : -result;

// Item IDs are generated with a timestamp. Copies include a "copy-" prefix, so
// comparing IDs as plain strings incorrectly places every copied item before
// newly added timestamp-only items on the same day.
const getCreatedAtFromId = (id: string) => {
  const timestamp = id.match(/(\d+)(?!.*\d)/)?.[1];
  return timestamp ? Number(timestamp) : 0;
};

const compareByCreatedAt = (a: { id: string }, b: { id: string }) => {
  const result = getCreatedAtFromId(a.id) - getCreatedAtFromId(b.id);
  return result || compareStrings(a.id, b.id);
};

export const defaultSortDirection = (field: string): SortDirection => {
  if (field === "name" || field === "category" || field === "source") {
    return "asc";
  }
  return "desc";
};

export const sortShoppingItems = (
  items: ShoppingListItem[],
  field: ShoppingSortField,
  direction: SortDirection,
) => {
  const sorted = [...items];

  sorted.sort((a, b) => {
    let result = 0;

    switch (field) {
      case "name":
        result = compareStrings(a.name, b.name);
        break;
      case "category":
        result = compareStrings(a.category, b.category);
        break;
      case "quantity":
        result = a.quantity - b.quantity;
        break;
      case "cost":
        result = a.quantity * a.price - b.quantity * b.price;
        break;
      case "date":
      default:
        result = compareStrings(a.purchasedDate, b.purchasedDate);
        break;
    }

    if (result === 0) {
      result = field === "date" ? compareByCreatedAt(a, b) : compareStrings(a.id, b.id);
    }

    return applyDirection(result, direction);
  });

  return sorted;
};

export const sortExpenseEntries = (
  entries: ExpenseEntry[],
  field: ExpenseSortField,
  direction: SortDirection,
) => {
  const sorted = [...entries];

  sorted.sort((a, b) => {
    let result = 0;

    switch (field) {
      case "name":
        result = compareStrings(a.label, b.label);
        break;
      case "category":
        result = compareStrings(a.category, b.category);
        break;
      case "source":
        result = compareStrings(a.source, b.source);
        break;
      case "amount":
        result = a.amount - b.amount;
        break;
      case "date":
      default:
        result = compareStrings(a.date, b.date);
        break;
    }

    if (result === 0) {
      result = field === "date" ? compareByCreatedAt(a, b) : compareStrings(a.id, b.id);
    }

    return applyDirection(result, direction);
  });

  return sorted;
};

export const sortExpenseItems = (
  items: ExpenseItem[],
  field: Exclude<ExpenseSortField, "source">,
  direction: SortDirection,
) => {
  const sorted = [...items];

  sorted.sort((a, b) => {
    let result = 0;

    switch (field) {
      case "name":
        result = compareStrings(a.description || a.category, b.description || b.category);
        break;
      case "category":
        result = compareStrings(a.category, b.category);
        break;
      case "amount":
        result = a.amount - b.amount;
        break;
      case "date":
      default:
        result = compareStrings(a.purchasedDate, b.purchasedDate);
        break;
    }

    if (result === 0) {
      result = field === "date" ? compareByCreatedAt(a, b) : compareStrings(a.id, b.id);
    }

    return applyDirection(result, direction);
  });

  return sorted;
};
