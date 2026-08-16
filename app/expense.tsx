import ItemActions from "@/components/item-actions";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import {
  addExpenseItem,
  deleteExpenseItem,
  getDateKey,
  getExpenseItems,
  getExpenseSummary,
  getShoppingListItems,
  subscribeShoppingList,
  updateExpenseItem,
} from "@/app/models/shoppinglist";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import Ionicons from "@expo/vector-icons/build/Ionicons";

const expenseCategories = [
  { label: "Electricity", icon: "flash-outline" },
  { label: "Petrol", icon: "car-outline" },
  { label: "Internet", icon: "wifi-outline" },
  { label: "Rent", icon: "home-outline" },
  { label: "Subscriptions", icon: "card-outline" },
  { label: "Transport", icon: "bus-outline" },
  { label: "Gym", icon: "fitness-outline" },
  { label: "Entertainment", icon: "game-controller-outline" },
  { label: "Office", icon: "briefcase-outline" },
  { label: "Grooming", icon: "person-outline" },
  { label: "Zomato/Swiggy", icon: "fast-food-outline" },
  { label: "Water", icon: "water-outline" },
  { label: "Health", icon: "medkit-outline" },
] as const;

type ExpenseCategory = (typeof expenseCategories)[number];

export default function ExpenseScreen() {
  const [summary, setSummary] = useState(() => getExpenseSummary());
  const [shoppingItems, setShoppingItems] = useState(() => getShoppingListItems());
  const [manualExpenses, setManualExpenses] = useState(() => getExpenseItems());
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>(expenseCategories[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    setShoppingItems(getShoppingListItems());
    setManualExpenses(getExpenseItems());
    setSummary(getExpenseSummary());

    const unsubscribe = subscribeShoppingList(() => {
      setShoppingItems(getShoppingListItems());
      setManualExpenses(getExpenseItems());
      setSummary(getExpenseSummary());
    });

    return unsubscribe;
  }, []);

  const allExpenses = useMemo(
    () => [
      ...manualExpenses.map((expense) => ({
        id: expense.id,
        category: expense.category,
        label: expense.description || expense.category,
        amount: expense.amount,
        date: expense.purchasedDate,
        source: "Expense",
      })),
      ...shoppingItems.map((item) => ({
        id: item.id,
        category: item.category,
        label: item.name,
        amount: item.quantity * item.price,
        date: item.purchasedDate,
        source: "Shopping",
      })),
    ]
      .sort((a, b) => b.date.localeCompare(a.date)),
    [manualExpenses, shoppingItems],
  );

  const handleOpenCategory = (category: typeof expenseCategories[number]) => {
    setSelectedCategory(category);
    setAmount("");
    setDescription("");
    setModalVisible(true);
  };

  const handleAddExpense = () => {
    const value = Number(amount);
    if (!value || Number.isNaN(value)) {
      return;
    }

    if (editId) {
      updateExpenseItem(editId, {
        category: selectedCategory.label,
        amount: value,
        description: description.trim() || selectedCategory.label,
      });
      setEditId(null);
    } else {
      addExpenseItem({
        id: `${Date.now()}`,
        category: selectedCategory.label,
        amount: value,
        description: description.trim() || selectedCategory.label,
        purchasedDate: getDateKey(),
      });
    }

    setModalVisible(false);
  };

  const handleEditExpense = (id: string) => {
    const item = getExpenseItems().find((e) => e.id === id);
    if (!item) return;

    setEditId(item.id);
    setAmount(String(item.amount));
    setDescription(item.description || item.category || "");
    const matchingCategory = expenseCategories.find((c) => c.label === item.category);
    setSelectedCategory(matchingCategory ?? expenseCategories[0]);
    setModalVisible(true);
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpenseItem(id);
  };

  const handleOpenActions = (id: string) => {
    setSelectedEntryId(id);
    setActionsVisible(true);
  };

  const handleCloseActions = () => {
    setSelectedEntryId(null);
    setActionsVisible(false);
  };

  const handleActionsEdit = () => {
    if (!selectedEntryId) return;
    const entry = allExpenses.find((e) => e.id === selectedEntryId);
    if (!entry) return;

    if (entry.source === "Expense") {
      handleEditExpense(selectedEntryId);
    } else {
      router.push("/shopping-list");
    }
  };

  const handleActionsDelete = () => {
    if (!selectedEntryId) return;
    const entry = allExpenses.find((e) => e.id === selectedEntryId);
    if (!entry) return;

    if (entry.source === "Expense") {
      deleteExpenseItem(selectedEntryId);
    } else {
      // delete shopping item
      // import and call deleteShoppingListItem
      // lazy import to avoid circular issues
      const { deleteShoppingListItem } = require("@/app/models/shoppinglist");
      deleteShoppingListItem(selectedEntryId);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.title}>Expense</ThemedText>
        <ThemedText style={styles.subtitle}>
          Track shopping purchases and manual expenses together in one clean view.
        </ThemedText>

        <ThemedView style={styles.summaryGrid}>
          <ThemedView style={styles.summaryCard}>
            <ThemedText style={styles.summaryLabel}>Today</ThemedText>
            <ThemedText style={styles.amount}>₹{summary.dailyTotal.toFixed(1)}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.summaryCard}>
            <ThemedText style={styles.summaryLabel}>This month</ThemedText>
            <ThemedText style={styles.amount}>₹{summary.monthlyTotal.toFixed(1)}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.summaryCard}>
            <ThemedText style={styles.summaryLabel}>All time</ThemedText>
            <ThemedText style={styles.amount}>₹{summary.allTimeTotal.toFixed(1)}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.expenseSection}>
          <ThemedText style={styles.sectionTitle}>Tap a category to add an expense</ThemedText>
          <View style={styles.categoryGrid}>
            {expenseCategories.map((category) => (
              <Pressable
                key={category.label}
                style={styles.categoryButton}
                onPress={() => handleOpenCategory(category)}
              >
                <View style={styles.categoryIconWrapper}>
                  <Ionicons name={category.icon} size={20} color="white" />
                </View>
                <ThemedText style={styles.categoryLabel}>{category.label}</ThemedText>
              </Pressable>
            ))}
          </View>
        </ThemedView>

        <ThemedView style={styles.listSection}>
          <ThemedText style={styles.sectionTitle}>All expenses</ThemedText>
            {allExpenses.length === 0 ? (
            <ThemedView style={styles.emptyCard}>
              <ThemedText style={styles.emptyText}>No expenses yet. Tap a category to add one.</ThemedText>
            </ThemedView>
          ) : (
            <>
              {(allExpenses.slice(0, visibleCount)).map((entry) => (
                <Pressable key={entry.id} style={styles.expenseCard} onLongPress={() => handleOpenActions(entry.id)}>
                  <View style={styles.expenseRow}>
                    <View>
                      <ThemedText style={styles.expenseLabel}>{entry.label}</ThemedText>
                      <ThemedText style={styles.expenseMeta}>{entry.category}</ThemedText>
                    </View>
                    <ThemedText style={styles.expenseAmount}>₹{entry.amount.toFixed(2)}</ThemedText>
                  </View>
                  <View style={styles.expenseFooter}>
                    <ThemedText style={styles.expenseDate}>{entry.date}</ThemedText>
                    <ThemedText style={styles.expenseSource}>{entry.source}</ThemedText>
                  </View>
                </Pressable>
              ))}
              {allExpenses.length > 6 ? (
                <Pressable
                  style={styles.showMoreButton}
                  onPress={() => {
                    if (visibleCount >= allExpenses.length) {
                      setVisibleCount(6);
                    } else {
                      const remaining = allExpenses.length - visibleCount;
                      setVisibleCount((c) => c + Math.min(5, remaining));
                    }
                  }}
                >
                  <ThemedText style={styles.showMoreText}>
                    {visibleCount >= allExpenses.length ? "Show less" : `Show ${Math.min(5, allExpenses.length - visibleCount)} more`}
                  </ThemedText>
                </Pressable>
              ) : null}
            </>
          )
        }
        </ThemedView>

        <Pressable style={styles.button} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="white" style={styles.buttonIcon} />
          <ThemedText style={styles.buttonText}>Back to Shopping</ThemedText>
        </Pressable>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Add {selectedCategory.label}</ThemedText>
              <Pressable onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
                <Ionicons name="close" size={20} color="#94a3b8" />
              </Pressable>
            </View>

            <View style={styles.selectedCategoryRow}>
              <View style={styles.categoryIconWrapperLarge}>
                <Ionicons name={selectedCategory.icon} size={22} color="white" />
              </View>
              <ThemedText style={styles.selectedCategoryText}>{selectedCategory.label}</ThemedText>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor="#94a3b8"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor="#94a3b8"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <Pressable style={styles.submitButton} onPress={handleAddExpense}>
              <ThemedText style={styles.submitButtonText}>Save expense</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
      <ItemActions
        visible={actionsVisible}
        onClose={handleCloseActions}
        onEdit={handleActionsEdit}
        onDelete={handleActionsDelete}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  screenContent: {
    marginTop: 12,
    paddingBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: 15,
    height: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 22,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#111827",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#cbd5e1",
    marginBottom: 6,
  },
  amount: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
  },
  expenseSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  categoryButton: {
    flexBasis: "48%",
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
  },
  listSection: {
    marginBottom: 24,
  },
  emptyCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#111827",
  },
  emptyText: {
    color: "#94a3b8",
  },
  expenseCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#111827",
    marginBottom: 12,
  },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
  },
  expenseLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  expenseMeta: {
    color: "#94a3b8",
    marginTop: 4,
    fontSize: 13,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#38bdf8",
  },
  expenseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  expenseDate: {
    color: "#94a3b8",
    fontSize: 13,
  },
  expenseSource: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "700",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "#2563eb",
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    borderColor: "#1f2937",
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
  },
  modalCloseButton: {
    padding: 8,
  },
  selectedCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  categoryIconWrapperLarge: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCategoryText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#111827",
    borderRadius: 18,
    color: "white",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 14,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 4,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  entryActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
  },
  showMoreButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  showMoreText: {
    color: "#2563eb",
    fontWeight: "700",
  },
});