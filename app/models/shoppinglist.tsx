import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ShoppingListItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  purchasedDate: string;
}

export const getDateKey = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

let shoppingList: ShoppingListItem[] = [];

export interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  description: string;
  purchasedDate: string;
}

let expenseItems: ExpenseItem[] = [];
let archivedShopping: Record<string, ShoppingListItem[]> = {};
let archivedExpenses: Record<string, ExpenseItem[]> = {};

let listeners: ((items: ShoppingListItem[]) => void)[] = [];

const STORAGE_KEY_SHOPPING_LIST = "expenshop:shoppingList";
const STORAGE_KEY_EXPENSE_ITEMS = "expenshop:expenseItems";
const STORAGE_KEY_ARCHIVE_SHOPPING = "expenshop:archive:shoppingList";
const STORAGE_KEY_ARCHIVE_EXPENSE = "expenshop:archive:expenseItems";

const notifyListeners = () => {
  listeners.forEach((listener) => listener(getShoppingListItems()));
};

const savePersistedData = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_SHOPPING_LIST, JSON.stringify(shoppingList));
    await AsyncStorage.setItem(STORAGE_KEY_EXPENSE_ITEMS, JSON.stringify(expenseItems));
    await AsyncStorage.setItem(STORAGE_KEY_ARCHIVE_SHOPPING, JSON.stringify(archivedShopping));
    await AsyncStorage.setItem(STORAGE_KEY_ARCHIVE_EXPENSE, JSON.stringify(archivedExpenses));
  } catch {
    // ignore storage errors for now
  }
};

const loadPersistedData = async () => {
  try {
    const [shoppingData, expenseData] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_SHOPPING_LIST),
      AsyncStorage.getItem(STORAGE_KEY_EXPENSE_ITEMS),
    ]);

    const [archivedShoppingData, archivedExpenseData] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_ARCHIVE_SHOPPING),
      AsyncStorage.getItem(STORAGE_KEY_ARCHIVE_EXPENSE),
    ]);

    shoppingList = shoppingData ? JSON.parse(shoppingData) : [];
    expenseItems = expenseData ? JSON.parse(expenseData) : [];
    archivedShopping = archivedShoppingData ? JSON.parse(archivedShoppingData) : {};
    archivedExpenses = archivedExpenseData ? JSON.parse(archivedExpenseData) : {};

    // Archive any older items on load to keep current lists short
    archiveOldItems();
    notifyListeners();
  } catch {
    // ignore storage errors for now
  }
};

void loadPersistedData();

export const getShoppingListItems = () => [...shoppingList];

export const subscribeShoppingList = (
  listener: (items: ShoppingListItem[]) => void,
) => {
  listeners = [...listeners, listener];

  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
};

export const addShoppingListItem = (item: ShoppingListItem) => {
  shoppingList = [item, ...shoppingList];
  notifyListeners();
  void savePersistedData();
};

export const updateShoppingListQuantity = (id: string, delta: number) => {
  const nextItems = shoppingList.flatMap((item) => {
    if (item.id !== id) {
      return [item];
    }

    const nextQuantity = item.quantity + delta;

    if (nextQuantity <= 0) {
      return [];
    }

    return [{ ...item, quantity: nextQuantity }];
  });

  shoppingList = nextItems;
  notifyListeners();
  void savePersistedData();
};

export const updateShoppingListItem = (
  id: string,
  updates: Partial<Pick<ShoppingListItem, "name" | "price">>,
) => {
  const trimmedName = updates.name?.trim();

  if (trimmedName === "") {
    return;
  }

  shoppingList = shoppingList.map((item) => {
    if (item.id !== id) {
      return item;
    }

    return {
      ...item,
      ...(trimmedName !== undefined ? { name: trimmedName } : {}),
      ...(updates.price !== undefined ? { price: updates.price } : {}),
    };
  });

  notifyListeners();
  void savePersistedData();
};

export const getExpenseItems = () => [...expenseItems];

export const addExpenseItem = (item: ExpenseItem) => {
  expenseItems = [item, ...expenseItems];
  notifyListeners();
  void savePersistedData();
};

export const updateExpenseItem = (
  id: string,
  updates: Partial<Pick<ExpenseItem, "category" | "amount" | "description" | "purchasedDate">>,
) => {
  expenseItems = expenseItems.map((item) => {
    if (item.id !== id) return item;
    return { ...item, ...(updates.category !== undefined ? { category: updates.category } : {}), ...(updates.amount !== undefined ? { amount: updates.amount } : {}), ...(updates.description !== undefined ? { description: updates.description } : {}), ...(updates.purchasedDate !== undefined ? { purchasedDate: updates.purchasedDate } : {}), };
  });

  notifyListeners();
  void savePersistedData();
};

export const deleteExpenseItem = (id: string) => {
  expenseItems = expenseItems.filter((item) => item.id !== id);
  notifyListeners();
  void savePersistedData();
};

export const deleteShoppingListItem = (id: string) => {
  shoppingList = shoppingList.filter((item) => item.id !== id);
  notifyListeners();
  void savePersistedData();
};

export const getArchivedShoppingMonths = () => Object.keys(archivedShopping).sort().reverse();

export const getArchivedShoppingItems = (monthKey: string) => {
  return archivedShopping[monthKey] ? [...archivedShopping[monthKey]] : [];
};

export const getArchivedExpenseMonths = () => Object.keys(archivedExpenses).sort().reverse();

export const getArchivedExpenseItems = (monthKey: string) => {
  return archivedExpenses[monthKey] ? [...archivedExpenses[monthKey]] : [];
};

export const archiveOldItems = (referenceDate: Date = new Date()) => {
  const currentMonth = getDateKey(referenceDate).slice(0, 7); // YYYY-MM

  // Move shoppingList items not in currentMonth into archivedShopping grouped by their monthKey
  const [toKeepShopping, toArchiveShopping] = shoppingList.reduce<[ShoppingListItem[], ShoppingListItem[]]>(
    (acc, item) => {
      const monthKey = item.purchasedDate.slice(0, 7);
      if (monthKey === currentMonth) acc[0].push(item);
      else acc[1].push(item);
      return acc;
    },
    [[], []],
  );

  toArchiveShopping.forEach((item) => {
    const key = item.purchasedDate.slice(0, 7);
    archivedShopping[key] = archivedShopping[key] ? [item, ...archivedShopping[key]] : [item];
  });

  shoppingList = toKeepShopping;

  // Move expenseItems not in currentMonth into archivedExpenses
  const [toKeepExpenses, toArchiveExpenses] = expenseItems.reduce<[ExpenseItem[], ExpenseItem[]]>(
    (acc, item) => {
      const monthKey = item.purchasedDate.slice(0, 7);
      if (monthKey === currentMonth) acc[0].push(item);
      else acc[1].push(item);
      return acc;
    },
    [[], []],
  );

  toArchiveExpenses.forEach((item) => {
    const key = item.purchasedDate.slice(0, 7);
    archivedExpenses[key] = archivedExpenses[key] ? [item, ...archivedExpenses[key]] : [item];
  });

  expenseItems = toKeepExpenses;

  void savePersistedData();
};

const getAllShoppingItems = () => [
  ...shoppingList,
  ...Object.values(archivedShopping).flat(),
];

const getAllExpenseItems = () => [
  ...expenseItems,
  ...Object.values(archivedExpenses).flat(),
];

export const getExpenseSummary = (date = new Date()) => {
  const dayKey = getDateKey(date);
  const monthKey = dayKey.slice(0, 7);

  let dailyTotal = 0;
  let monthlyTotal = 0;
  let allTimeTotal = 0;

  getAllShoppingItems().forEach((item) => {
    const itemCost = Number(item.quantity || 0) * Number(item.price || 0);
    allTimeTotal += itemCost;

    if (item.purchasedDate === dayKey) {
      dailyTotal += itemCost;
    }

    if (item.purchasedDate && item.purchasedDate.startsWith(monthKey)) {
      monthlyTotal += itemCost;
    }
  });

  getAllExpenseItems().forEach((item) => {
    const itemCost = Number(item.amount || 0);
    allTimeTotal += itemCost;

    if (item.purchasedDate === dayKey) {
      dailyTotal += itemCost;
    }

    if (item.purchasedDate && item.purchasedDate.startsWith(monthKey)) {
      monthlyTotal += itemCost;
    }
  });

  return {
    dayKey,
    monthKey,
    dailyTotal,
    monthlyTotal,
    allTimeTotal,
  };
};
