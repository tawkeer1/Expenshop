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

let listeners: ((items: ShoppingListItem[]) => void)[] = [];

const STORAGE_KEY_SHOPPING_LIST = "expenshop:shoppingList";
const STORAGE_KEY_EXPENSE_ITEMS = "expenshop:expenseItems";

const notifyListeners = () => {
  listeners.forEach((listener) => listener(getShoppingListItems()));
};

const savePersistedData = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_SHOPPING_LIST, JSON.stringify(shoppingList));
    await AsyncStorage.setItem(STORAGE_KEY_EXPENSE_ITEMS, JSON.stringify(expenseItems));
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

    shoppingList = shoppingData ? JSON.parse(shoppingData) : [];
    expenseItems = expenseData ? JSON.parse(expenseData) : [];
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

export const getExpenseSummary = (date = new Date()) => {
  const dayKey = getDateKey(date);
  const monthKey = dayKey.slice(0, 7);

  let dailyTotal = 0;
  let monthlyTotal = 0;
  let allTimeTotal = 0;

  shoppingList.forEach((item) => {
    const itemCost = item.quantity * item.price;
    allTimeTotal += itemCost;

    if (item.purchasedDate === dayKey) {
      dailyTotal += itemCost;
    }

    if (item.purchasedDate.startsWith(monthKey)) {
      monthlyTotal += itemCost;
    }
  });

  expenseItems.forEach((item) => {
    allTimeTotal += item.amount;

    if (item.purchasedDate === dayKey) {
      dailyTotal += item.amount;
    }

    if (item.purchasedDate.startsWith(monthKey)) {
      monthlyTotal += item.amount;
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
