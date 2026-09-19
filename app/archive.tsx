import { getArchivedExpenseItems, getArchivedExpenseMonths, getArchivedShoppingItems, getArchivedShoppingMonths } from "@/app/models/shoppinglist";
import ListSearchBar from "@/components/list-search-bar";
import ListSortBar from "@/components/list-sort-bar";
import SelectionTotalBar from "@/components/selection-total-bar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  emptyListFilters,
  filterExpenseItems,
  filterShoppingItems,
  getUniqueValues,
  isFilterActive,
  type ListFilterState,
} from "@/utils/list-filter";
import {
  sortExpenseItems,
  sortShoppingItems,
  type ExpenseSortField,
  type ShoppingSortField,
  type SortDirection,
} from "@/utils/list-sort";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

function prettyMonth(monthKey: string) {
  // monthKey: YYYY-MM
  try {
    const [y, m] = monthKey.split("-");
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleString(undefined, { month: "long", year: "numeric" });
  } catch {
    return monthKey;
  }
}

function prettyDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function ArchiveScreen() {
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<"shopping" | "expenses">("shopping");
  const [shoppingSortField, setShoppingSortField] = useState<ShoppingSortField>("date");
  const [shoppingSortDirection, setShoppingSortDirection] = useState<SortDirection>("desc");
  const [expenseSortField, setExpenseSortField] = useState<Exclude<ExpenseSortField, "source">>("date");
  const [expenseSortDirection, setExpenseSortDirection] = useState<SortDirection>("desc");
  const [shoppingFilters, setShoppingFilters] = useState<ListFilterState>(emptyListFilters);
  const [expenseFilters, setExpenseFilters] = useState<ListFilterState>(emptyListFilters);
  const [isSelectingItems, setIsSelectingItems] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setShoppingFilters(emptyListFilters);
    setExpenseFilters(emptyListFilters);
    setIsSelectingItems(false);
    setSelectedItemIds(new Set());
  }, [selectedMonth, viewTab]);

  useEffect(() => {
    const s = getArchivedShoppingMonths();
    const e = getArchivedExpenseMonths();
    const setUnion = Array.from(new Set([...s, ...e])).sort().reverse();
    setMonths(setUnion);
    if (setUnion.length > 0) setSelectedMonth(setUnion[0]);
  }, []);

  const rawShoppingItems = useMemo(
    () => (selectedMonth ? getArchivedShoppingItems(selectedMonth) : []),
    [selectedMonth],
  );

  const rawExpenseItems = useMemo(
    () => (selectedMonth ? getArchivedExpenseItems(selectedMonth) : []),
    [selectedMonth],
  );

  const monthlyTotal = useMemo(() => {
    const shoppingTotal = rawShoppingItems.reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );
    const expensesTotal = rawExpenseItems.reduce(
      (total, item) => total + Number(item.amount || 0),
      0,
    );

    return shoppingTotal + expensesTotal;
  }, [rawExpenseItems, rawShoppingItems]);

  const shoppingCategoryOptions = useMemo(
    () => getUniqueValues(rawShoppingItems.map((item) => item.category)),
    [rawShoppingItems],
  );

  const expenseCategoryOptions = useMemo(
    () => getUniqueValues(rawExpenseItems.map((item) => item.category)),
    [rawExpenseItems],
  );

  const shoppingItems = useMemo(() => {
    const filtered = filterShoppingItems(rawShoppingItems, shoppingFilters);
    return sortShoppingItems(filtered, shoppingSortField, shoppingSortDirection);
  }, [rawShoppingItems, shoppingFilters, shoppingSortField, shoppingSortDirection]);

  const expenseItems = useMemo(() => {
    const filtered = filterExpenseItems(rawExpenseItems, expenseFilters);
    return sortExpenseItems(filtered, expenseSortField, expenseSortDirection);
  }, [rawExpenseItems, expenseFilters, expenseSortField, expenseSortDirection]);

  const selectedShoppingCategoryTotal = useMemo(() => {
    if (!shoppingFilters.category) {
      return null;
    }

    return rawShoppingItems
      .filter((item) => item.category === shoppingFilters.category)
      .reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);
  }, [rawShoppingItems, shoppingFilters.category]);

  const selectedExpenseCategoryTotal = useMemo(() => {
    if (!expenseFilters.category) {
      return null;
    }

    return rawExpenseItems
      .filter((item) => item.category === expenseFilters.category)
      .reduce((total, item) => total + Number(item.amount || 0), 0);
  }, [expenseFilters.category, rawExpenseItems]);

  const selectedShoppingItems = useMemo(
    () => rawShoppingItems.filter((item) => selectedItemIds.has(item.id)),
    [rawShoppingItems, selectedItemIds],
  );

  const selectedExpenseItems = useMemo(
    () => rawExpenseItems.filter((item) => selectedItemIds.has(item.id)),
    [rawExpenseItems, selectedItemIds],
  );

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectionMode = () => {
    setIsSelectingItems((active) => !active);
    setSelectedItemIds(new Set());
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={18} color="white" />
          </Pressable>
          <ThemedText style={styles.title}>Archive</ThemedText>
        </View>

        <ThemedView style={styles.monthsRow}>
          {months.length === 0 ? (
            <ThemedText style={styles.emptyText}>No archived months yet</ThemedText>
          ) : (
            months.map((m) => (
              <Pressable
                key={m}
                style={[styles.monthButton, selectedMonth === m && styles.monthButtonActive]}
                onPress={() => setSelectedMonth(m)}
              >
                <ThemedText style={selectedMonth === m ? styles.monthLabelActive : styles.monthLabel}>{prettyMonth(m)}</ThemedText>
              </Pressable>
            ))
          )}
        </ThemedView>

        {selectedMonth ? (
          <>
            <ThemedView style={styles.monthTotalCard}>
              <View>
                <ThemedText style={styles.monthTotalLabel}>Total cost for {prettyMonth(selectedMonth)}</ThemedText>
                <ThemedText style={styles.monthTotalCaption}>Shopping and expenses</ThemedText>
              </View>
              <ThemedText style={styles.monthTotalAmount}>₹{monthlyTotal.toFixed(2)}</ThemedText>
            </ThemedView>

            <View style={styles.tabRow}>
              <Pressable onPress={() => setViewTab("shopping")} style={[styles.tabButton, viewTab === "shopping" && styles.tabButtonActive]}>
                <ThemedText style={viewTab === "shopping" ? styles.tabTextActive : styles.tabText}>Shopping</ThemedText>
              </Pressable>
              <Pressable onPress={() => setViewTab("expenses")} style={[styles.tabButton, viewTab === "expenses" && styles.tabButtonActive]}>
                <ThemedText style={viewTab === "expenses" ? styles.tabTextActive : styles.tabText}>Expenses</ThemedText>
              </Pressable>
            </View>

            {viewTab === "shopping" ? (
              <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Shopping ({shoppingItems.length})</ThemedText>
                {rawShoppingItems.length > 0 ? (
                  <>
                    <ListSearchBar
                      filters={shoppingFilters}
                      onFiltersChange={setShoppingFilters}
                      categories={shoppingCategoryOptions}
                      showDateFilter={false}
                      placeholder="Search archived items..."
                    />
                    <ListSortBar
                      fields={[
                        { key: "date", label: "Date" },
                        { key: "name", label: "Name" },
                        { key: "cost", label: "Cost" },
                        { key: "category", label: "Category" },
                        { key: "quantity", label: "Qty" },
                      ]}
                      sortField={shoppingSortField}
                      sortDirection={shoppingSortDirection}
                      onSortChange={(field, direction) => {
                        setShoppingSortField(field);
                        setShoppingSortDirection(direction);
                      }}
                    />
                    {selectedShoppingCategoryTotal !== null ? (
                      <ThemedView style={styles.categoryTotalCard}>
                        <ThemedText style={styles.categoryTotalLabel}>
                          {shoppingFilters.category} spent in {prettyMonth(selectedMonth)}
                        </ThemedText>
                        <ThemedText style={styles.categoryTotalAmount}>
                          ₹{selectedShoppingCategoryTotal.toFixed(2)}
                        </ThemedText>
                      </ThemedView>
                    ) : null}
                    <SelectionTotalBar
                      active={isSelectingItems}
                      count={selectedShoppingItems.length}
                      total={selectedShoppingItems.reduce((total, item) => total + item.price * item.quantity, 0)}
                      onToggle={toggleSelectionMode}
                      onClear={() => setSelectedItemIds(new Set())}
                    />
                  </>
                ) : null}
                {rawShoppingItems.length === 0 ? (
                  <ThemedText style={styles.emptyText}>No items for this month.</ThemedText>
                ) : shoppingItems.length === 0 ? (
                  <ThemedText style={styles.emptyText}>
                    {isFilterActive(shoppingFilters) ? "No items match your search or filters." : "No items to show."}
                  </ThemedText>
                ) : (
                  shoppingItems.map((it) => (
                    <Pressable
                      key={it.id}
                      style={[styles.itemCard, isSelectingItems && selectedItemIds.has(it.id) && styles.itemCardSelected]}
                      onPress={isSelectingItems ? () => toggleItemSelection(it.id) : undefined}
                    >
                      <View style={styles.itemRow}>
                        <View style={styles.itemLeft}>
                          {isSelectingItems ? (
                            <View style={[styles.selectionIndicator, selectedItemIds.has(it.id) && styles.selectionIndicatorActive]}>
                              {selectedItemIds.has(it.id) ? <Ionicons name="checkmark" size={15} color="white" /> : null}
                            </View>
                          ) : <Ionicons name="cart-outline" size={20} color="#cbd5e1" />}
                        </View>

                        <View style={styles.itemCenter}>
                          <ThemedText style={styles.itemTitle}>{it.name}</ThemedText>
                          <ThemedText style={styles.itemMeta}>{it.category} • Qty {it.quantity}</ThemedText>
                        </View>

                        <View style={styles.itemRight}>
                          <ThemedText style={styles.itemAmount}>₹{(it.price * it.quantity).toFixed(2)}</ThemedText>
                          <ThemedText style={styles.itemDate}>{prettyDate(it.purchasedDate)}</ThemedText>
                        </View>
                      </View>
                    </Pressable>
                  ))
                )}
              </ThemedView>
            ) : (
              <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Expenses ({expenseItems.length})</ThemedText>
                {rawExpenseItems.length > 0 ? (
                  <>
                    <ListSearchBar
                      filters={expenseFilters}
                      onFiltersChange={setExpenseFilters}
                      categories={expenseCategoryOptions}
                      showDateFilter={false}
                      placeholder="Search archived expenses..."
                    />
                    <ListSortBar
                      fields={[
                        { key: "date", label: "Date" },
                        { key: "name", label: "Name" },
                        { key: "amount", label: "Amount" },
                        { key: "category", label: "Category" },
                      ]}
                      sortField={expenseSortField}
                      sortDirection={expenseSortDirection}
                      onSortChange={(field, direction) => {
                        setExpenseSortField(field);
                        setExpenseSortDirection(direction);
                      }}
                    />
                    {selectedExpenseCategoryTotal !== null ? (
                      <ThemedView style={styles.categoryTotalCard}>
                        <ThemedText style={styles.categoryTotalLabel}>
                          {expenseFilters.category} spent in {prettyMonth(selectedMonth)}
                        </ThemedText>
                        <ThemedText style={styles.categoryTotalAmount}>
                          ₹{selectedExpenseCategoryTotal.toFixed(2)}
                        </ThemedText>
                      </ThemedView>
                    ) : null}
                    <SelectionTotalBar
                      active={isSelectingItems}
                      count={selectedExpenseItems.length}
                      total={selectedExpenseItems.reduce((total, item) => total + item.amount, 0)}
                      onToggle={toggleSelectionMode}
                      onClear={() => setSelectedItemIds(new Set())}
                    />
                  </>
                ) : null}
                {rawExpenseItems.length === 0 ? (
                  <ThemedText style={styles.emptyText}>No expenses for this month.</ThemedText>
                ) : expenseItems.length === 0 ? (
                  <ThemedText style={styles.emptyText}>
                    {isFilterActive(expenseFilters) ? "No expenses match your search or filters." : "No expenses to show."}
                  </ThemedText>
                ) : (
                  expenseItems.map((it) => (
                    <Pressable
                      key={it.id}
                      style={[styles.itemCard, isSelectingItems && selectedItemIds.has(it.id) && styles.itemCardSelected]}
                      onPress={isSelectingItems ? () => toggleItemSelection(it.id) : undefined}
                    >
                      <View style={styles.itemRow}>
                        <View style={styles.itemLeft}>
                          {isSelectingItems ? (
                            <View style={[styles.selectionIndicator, selectedItemIds.has(it.id) && styles.selectionIndicatorActive]}>
                              {selectedItemIds.has(it.id) ? <Ionicons name="checkmark" size={15} color="white" /> : null}
                            </View>
                          ) : <Ionicons name="card-outline" size={20} color="#cbd5e1" />}
                        </View>

                        <View style={styles.itemCenter}>
                          <ThemedText style={styles.itemTitle}>{it.description || it.category}</ThemedText>
                          <ThemedText style={styles.itemMeta}>{it.category}</ThemedText>
                        </View>

                        <View style={styles.itemRight}>
                          <ThemedText style={styles.itemAmount}>₹{it.amount.toFixed(2)}</ThemedText>
                          <ThemedText style={styles.itemDate}>{prettyDate(it.purchasedDate)}</ThemedText>
                        </View>
                      </View>
                    </Pressable>
                  ))
                )}
              </ThemedView>
            )}
          </>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18,},
  content: { paddingBottom: 48, marginTop: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  backButton: { padding: 8 },
  title: { fontSize: 22, fontWeight: "800"},
  monthsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  monthButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, backgroundColor: "#111827" },
  monthButtonActive: { backgroundColor: "#2563eb" },
  monthLabel: { color: "#cbd5e1" },
  monthLabelActive: { color: "white", fontWeight: "700" },
  monthTotalCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 14, borderRadius: 16, backgroundColor: "#111827", borderWidth: 1, borderColor: "#1f2937", marginBottom: 12 },
  monthTotalLabel: { color: "#e6eef8", fontSize: 15, fontWeight: "700" },
  monthTotalCaption: { color: "#94a3b8", fontSize: 13, marginTop: 4 },
  monthTotalAmount: { color: "#ffffff", fontSize: 18, fontWeight: "800", fontVariant: ["tabular-nums"] },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "#0f172a" },
  tabButtonActive: { backgroundColor: "#2563eb" },
  tabText: { color: "#cbd5e1" },
  tabTextActive: { color: "white", fontWeight: "700" },
  categoryTotalCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12, padding: 14, borderRadius: 16, backgroundColor: "#102a43", borderWidth: 1, borderColor: "#1d4ed8" },
  categoryTotalLabel: { flex: 1, color: "#dbeafe", fontSize: 14, fontWeight: "700" },
  categoryTotalAmount: { color: "white", fontSize: 18, fontWeight: "800", fontVariant: ["tabular-nums"] },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  itemCard: { padding: 10, borderRadius: 12, backgroundColor: "#0b1220", marginBottom: 10, borderWidth: 1, borderColor: "#0f172a" },
  itemCardSelected: { borderColor: "#3b82f6", backgroundColor: "#102a43" },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemLeft: { width: 36, alignItems: "center", justifyContent: "center" },
  selectionIndicator: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#64748b", alignItems: "center", justifyContent: "center" },
  selectionIndicatorActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  itemCenter: { flex: 1 },
  itemRight: { alignItems: "flex-end", minWidth: 84 },
  itemTitle: { fontSize: 15, fontWeight: "700", color: "#e6eef8" },
  itemMeta: { color: "#94a3b8", marginTop: 4, fontSize: 13 },
  itemAmount: { fontWeight: "700", color: "#cbd5e1" },
  itemDate: { color: "#94a3b8", fontSize: 12, marginTop: 4 },
  emptyText: { color: "#94a3b8" },
});
