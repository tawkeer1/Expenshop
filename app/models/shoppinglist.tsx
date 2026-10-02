import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ShoppingListItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  purchasedDate: string;
  price: number;
  planned?: boolean;
}

export interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  description: string;
  purchasedDate: string;
  quantity?: number;
  unitPrice?: number;
  source?: "Monthly expense" | "Buy item";
}

export const getDateKey = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

let shoppingList: ShoppingListItem[] = [];
let expenseItems: ExpenseItem[] = [];
let archivedShopping: Record<string, ShoppingListItem[]> = {};
let archivedExpenses: Record<string, ExpenseItem[]> = {};
let listeners: ((items: ShoppingListItem[]) => void)[] = [];

const KEYS = {
  shopping: "expenshop:shoppingList",
  expenses: "expenshop:expenseItems",
  archiveShopping: "expenshop:archive:shoppingList",
  archiveExpenses: "expenshop:archive:expenseItems",
};

const notify = () => listeners.forEach((listener) => listener(getShoppingListItems()));
const persist = async () => {
  try {
    await AsyncStorage.multiSet([
      [KEYS.shopping, JSON.stringify(shoppingList)],
      [KEYS.expenses, JSON.stringify(expenseItems)],
      [KEYS.archiveShopping, JSON.stringify(archivedShopping)],
      [KEYS.archiveExpenses, JSON.stringify(archivedExpenses)],
    ]);
  } catch {}
};

const load = async () => {
  try {
    const values = Object.fromEntries(await AsyncStorage.multiGet(Object.values(KEYS)));
    const saved = values[KEYS.shopping] ? JSON.parse(values[KEYS.shopping]!) : [];
    const legacy = saved.filter((item: any) => item.price !== undefined && !item.planned);
    shoppingList = saved.filter((item: any) => item.price === undefined || item.planned).map((item: any) => ({ ...item, quantity: Number(item.quantity) || 1 }));
    expenseItems = values[KEYS.expenses] ? JSON.parse(values[KEYS.expenses]!) : [];
    if (legacy.length) {
      expenseItems = [
        ...legacy.map((item: any) => ({
          id: `legacy-purchase-${item.id}`,
          category: item.category,
          amount: (Number(item.quantity) || 0) * (Number(item.price) || 0),
          description: item.name,
          purchasedDate: item.purchasedDate,
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.price) || 0,
          source: "Buy item" as const,
        })),
        ...expenseItems,
      ];
    }
    archivedShopping = values[KEYS.archiveShopping] ? JSON.parse(values[KEYS.archiveShopping]!) : {};
    archivedExpenses = values[KEYS.archiveExpenses] ? JSON.parse(values[KEYS.archiveExpenses]!) : {};
    void persist();
    notify();
  } catch {}
};
void load();

export const getShoppingListItems = () => [...shoppingList];
export const getExpenseItems = () => [...expenseItems];
export const subscribeShoppingList = (listener: (items: ShoppingListItem[]) => void) => {
  listeners = [...listeners, listener];
  return () => { listeners = listeners.filter((item) => item !== listener); };
};

export const addShoppingListItem = (item: ShoppingListItem) => { shoppingList = [item, ...shoppingList]; notify(); void persist(); };
export const updateShoppingListQuantity = (id: string, delta: number) => {
  shoppingList = shoppingList.flatMap((item) => {
    if (item.id !== id) return [item];
    const quantity = item.quantity + delta;
    return quantity > 0 ? [{ ...item, quantity }] : [];
  });
  notify(); void persist();
};
export const updateShoppingListItem = (id: string, updates: Partial<Pick<ShoppingListItem, "name">>) => {
  const name = updates.name?.trim();
  if (name === "") return;
  shoppingList = shoppingList.map((item) => item.id === id && name ? { ...item, name } : item);
  notify(); void persist();
};
export const deleteShoppingListItem = (id: string) => { shoppingList = shoppingList.filter((item) => item.id !== id); notify(); void persist(); };
export const markShoppingListItemBought = (id: string, quantity: number, unitPrice: number) => {
  const item = shoppingList.find((candidate) => candidate.id === id);
  if (!item || quantity <= 0 || unitPrice < 0) return;
  shoppingList = shoppingList.filter((candidate) => candidate.id !== id);
  expenseItems = [{ id: `purchase-${id}-${Date.now()}`, category: item.category, amount: quantity * unitPrice, description: item.name, purchasedDate: getDateKey(), quantity, unitPrice, source: "Buy item" }, ...expenseItems];
  notify(); void persist();
};

export const addExpenseItem = (item: ExpenseItem) => { expenseItems = [item, ...expenseItems]; notify(); void persist(); };
export const updateExpenseItem = (id: string, updates: Partial<Omit<ExpenseItem, "id">>) => { expenseItems = expenseItems.map((item) => item.id === id ? { ...item, ...updates } : item); notify(); void persist(); };
export const deleteExpenseItem = (id: string) => { expenseItems = expenseItems.filter((item) => item.id !== id); notify(); void persist(); };

export const getArchivedShoppingMonths = () => Object.keys(archivedShopping).sort().reverse();
export const getArchivedShoppingItems = (monthKey: string) => [...(archivedShopping[monthKey] || [])];
export const getArchivedExpenseMonths = () => Object.keys(archivedExpenses).sort().reverse();
export const getArchivedExpenseItems = (monthKey: string) => [...(archivedExpenses[monthKey] || [])];

export const archiveOldItems = (referenceDate: Date = new Date()) => {
  const currentMonth = getDateKey(referenceDate).slice(0, 7);
  const move = <T extends { purchasedDate: string }>(items: T[], archive: Record<string, T[]>) => {
    const kept: T[] = [];
    items.forEach((item) => {
      const month = item.purchasedDate.slice(0, 7);
      if (month === currentMonth) kept.push(item); else archive[month] = [item, ...(archive[month] || [])];
    });
    return kept;
  };
  shoppingList = move(shoppingList, archivedShopping);
  expenseItems = move(expenseItems, archivedExpenses);
  notify(); void persist();
};

export const getExpenseSummary = (date = new Date()) => {
  const dayKey = getDateKey(date);
  const monthKey = dayKey.slice(0, 7);
  const allExpenses = [...expenseItems, ...Object.values(archivedExpenses).flat()];
  return allExpenses.reduce((summary, item) => {
    const amount = Number(item.amount) || 0;
    summary.allTimeTotal += amount;
    if (item.purchasedDate === dayKey) summary.dailyTotal += amount;
    if (item.purchasedDate.startsWith(monthKey)) summary.monthlyTotal += amount;
    return summary;
  }, { dayKey, monthKey, dailyTotal: 0, monthlyTotal: 0, allTimeTotal: 0 });
};
