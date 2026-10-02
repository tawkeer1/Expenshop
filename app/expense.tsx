import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import { addExpenseItem, deleteExpenseItem, getDateKey, getExpenseItems, getExpenseSummary, subscribeShoppingList, updateExpenseItem, type ExpenseItem } from "@/app/models/shoppinglist";
import { purchaseCategories } from "@/app/models/purchase-categories";
import ItemActions from "@/components/item-actions";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const monthlyCategories = [
  { label: "Rent", icon: "home-outline", color: "#6366f1" }, { label: "Electricity", icon: "flash-outline", color: "#f59e0b" },
  { label: "Water", icon: "water-outline", color: "#38bdf8" }, { label: "Internet", icon: "wifi-outline", color: "#3b82f6" },
  { label: "Transport", icon: "bus-outline", color: "#0ea5e9" }, { label: "Subscriptions", icon: "card-outline", color: "#a855f7" },
  { label: "Health", icon: "medkit-outline", color: "#ef4444" }, { label: "Other", icon: "pricetag-outline", color: "#64748b" },
];
type Mode = "monthly" | "buy";
type SelectedCategory = { label: string; icon: string; color: string };

export default function ExpenseScreen() {
  const [summary, setSummary] = useState(getExpenseSummary());
  const [expenses, setExpenses] = useState<ExpenseItem[]>(getExpenseItems());
  const [mode, setMode] = useState<Mode>("monthly");
  const [selected, setSelected] = useState<SelectedCategory>(monthlyCategories[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [count, setCount] = useState("1");
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [actionsVisible, setActionsVisible] = useState(false);

  useEffect(() => subscribeShoppingList(() => { setExpenses(getExpenseItems()); setSummary(getExpenseSummary()); }), []);
  const currentMonth = getDateKey().slice(0, 7);
  const monthExpenses = useMemo(() => expenses.filter((item) => item.purchasedDate.startsWith(currentMonth)), [expenses, currentMonth]);
  const openAdd = (category: SelectedCategory) => { setEditId(null); setSelected(category); setName(""); setAmount(""); setCount("1"); setModalOpen(true); };
  const openEdit = (expense: ExpenseItem) => {
    const isBuy = expense.source === "Buy item" || expense.quantity !== undefined || expense.unitPrice !== undefined;
    const categories: SelectedCategory[] = isBuy ? purchaseCategories : monthlyCategories;
    setMode(isBuy ? "buy" : "monthly");
    setEditId(expense.id);
    setSelected(categories.find((option) => option.label === expense.category) ?? categories[0]);
    setName(expense.description);
    setCount(String(expense.quantity ?? 1));
    setAmount(String(isBuy ? expense.unitPrice ?? expense.amount / (expense.quantity || 1) : expense.amount));
    setModalOpen(true);
  };
  const save = () => {
    const value = Number(amount); const quantity = Number(count) || 1;
    if (!value || Number.isNaN(value)) return;
    const isBuy = mode === "buy";
    const updates = { category: selected.label, description: name.trim() || selected.label, amount: isBuy ? value * quantity : value, quantity: isBuy ? quantity : undefined, unitPrice: isBuy ? value : undefined, source: isBuy ? "Buy item" as const : "Monthly expense" as const };
    if (editId) {
      updateExpenseItem(editId, updates);
      setEditId(null);
    } else {
      addExpenseItem({ id: `${Date.now()}`, ...updates, purchasedDate: getDateKey() });
    }
    setModalOpen(false);
  };
  const closeActions = () => { setActionsVisible(false); setSelectedActionId(null); };
  const editSelectedExpense = () => {
    const expense = expenses.find((item) => item.id === selectedActionId);
    closeActions();
    if (expense) openEdit(expense);
  };
  const deleteSelectedExpense = () => {
    if (selectedActionId) deleteExpenseItem(selectedActionId);
    closeActions();
  };
  const categories: SelectedCategory[] = mode === "monthly" ? monthlyCategories : purchaseCategories;

  return <ThemedView style={styles.container}><ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
    <ThemedText style={styles.title}>Expense</ThemedText><ThemedText style={styles.subtitle}>All confirmed purchases and monthly costs live in one place.</ThemedText>
    <View style={styles.summaryGrid}>{[["Today", summary.dailyTotal], ["This month", summary.monthlyTotal], ["All time", summary.allTimeTotal]].map(([label, value]) => <ThemedView key={label as string} style={styles.summaryCard}><ThemedText style={styles.muted}>{label as string}</ThemedText><ThemedText style={styles.total}>₹{(value as number).toFixed(2)}</ThemedText></ThemedView>)}</View>
    <View style={styles.switcher}><Pressable onPress={() => setMode("monthly")} style={[styles.switchOption, mode === "monthly" && styles.switchActive]}><Ionicons name="calendar-outline" size={18} color="white" /><ThemedText style={styles.switchText}>Monthly expenses</ThemedText></Pressable><Pressable onPress={() => setMode("buy")} style={[styles.switchOption, mode === "buy" && styles.switchActive]}><Ionicons name="cart-outline" size={18} color="white" /><ThemedText style={styles.switchText}>Buy items</ThemedText></Pressable></View>
    <ThemedText style={styles.sectionTitle}>{mode === "monthly" ? "Monthly expense categories" : "Buy items by category"}</ThemedText>
    <View style={styles.categoryGrid}>{categories.map((category) => <Pressable key={category.label} onPress={() => openAdd(category)} style={styles.category}><View style={[styles.categoryIcon, { backgroundColor: category.color }]}><Ionicons name={category.icon as any} size={20} color="white" /></View><ThemedText style={styles.categoryLabel}>{category.label}</ThemedText></Pressable>)}</View>
    <ThemedText style={styles.sectionTitle}>This month ({monthExpenses.length})</ThemedText>
    {monthExpenses.length === 0 ? <ThemedView style={styles.empty}><ThemedText style={styles.muted}>No expenses recorded this month.</ThemedText></ThemedView> : monthExpenses.map((expense) => <Pressable key={expense.id} style={styles.expenseCard} onLongPress={() => { setSelectedActionId(expense.id); setActionsVisible(true); }}><View style={styles.expenseHeader}><View style={styles.grow}><ThemedText style={styles.expenseName}>{expense.description}</ThemedText><ThemedText style={styles.muted}>{expense.category} - {expense.source || "Monthly expense"}</ThemedText></View><ThemedText style={styles.amount}>₹{expense.amount.toFixed(2)}</ThemedText></View><View style={styles.expenseFooter}><ThemedText style={styles.muted}>{expense.quantity ? `${expense.quantity} x ₹${expense.unitPrice?.toFixed(2)}` : expense.purchasedDate}</ThemedText></View></Pressable>)}
  </ScrollView>
    <Modal transparent animationType="slide" visible={modalOpen} onRequestClose={() => { setModalOpen(false); setEditId(null); }}><View style={styles.backdrop}><View style={styles.modal}><View style={styles.modalHeader}><ThemedText style={styles.modalTitle}>{editId ? "Edit expense" : `Add ${selected.label}`}</ThemedText><Pressable onPress={() => { setModalOpen(false); setEditId(null); }}><Ionicons name="close" size={24} color="#94a3b8" /></Pressable></View><TextInput style={styles.input} placeholder={mode === "buy" ? "Item name" : "Description (optional)"} placeholderTextColor="#94a3b8" value={name} onChangeText={setName} />{mode === "buy" ? <TextInput style={styles.input} placeholder="Count" placeholderTextColor="#94a3b8" keyboardType="number-pad" value={count} onChangeText={setCount} /> : null}<TextInput style={styles.input} placeholder={mode === "buy" ? "Cost per item (₹)" : "Amount (₹)"} placeholderTextColor="#94a3b8" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} /><Pressable style={styles.saveButton} onPress={save}><ThemedText style={styles.saveText}>{editId ? "Save changes" : "Save expense"}</ThemedText></Pressable></View></View></Modal>
    <ItemActions visible={actionsVisible} onClose={closeActions} onEdit={editSelectedExpense} onDelete={deleteSelectedExpense} title={expenses.find((item) => item.id === selectedActionId)?.description} />
  </ThemedView>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 18 }, content: { paddingTop: 32, paddingBottom: 88, gap: 14 }, title: { fontSize: 30, fontWeight: "800", height: 40 }, subtitle: { color: "#94a3b8", lineHeight: 21 }, summaryGrid: { flexDirection: "row", gap: 8 }, summaryCard: { flex: 1, backgroundColor: "#111827", borderRadius: 16, padding: 13, gap: 5 }, muted: { color: "#94a3b8", fontSize: 13 }, total: { color: "white", fontWeight: "800", fontSize: 16 }, switcher: { flexDirection: "row", backgroundColor: "#111827", padding: 5, gap: 5, borderRadius: 16 }, switchOption: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7, paddingVertical: 12, borderRadius: 12 }, switchActive: { backgroundColor: "#2563eb" }, switchText: { color: "white", fontWeight: "800", fontSize: 13 }, sectionTitle: { fontSize: 18, fontWeight: "800", marginTop: 3 }, categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 }, category: { width: "31%", minHeight: 82, backgroundColor: "#111827", borderRadius: 16, alignItems: "center", justifyContent: "center", padding: 8, gap: 8 }, categoryIcon: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center" }, categoryLabel: { color: "white", textAlign: "center", fontSize: 12, fontWeight: "700" }, empty: { backgroundColor: "#111827", padding: 18, borderRadius: 16 }, expenseCard: { backgroundColor: "#111827", borderRadius: 16, padding: 15, gap: 12 }, expenseHeader: { flexDirection: "row", gap: 12 }, grow: { flex: 1, gap: 4 }, expenseName: { color: "white", fontSize: 16, fontWeight: "800" }, amount: { color: "#38bdf8", fontSize: 16, fontWeight: "800" }, expenseFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" }, modal: { backgroundColor: "#171717", padding: 22, gap: 13, borderTopLeftRadius: 28, borderTopRightRadius: 28 }, modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, modalTitle: { color: "white", fontSize: 21, fontWeight: "800" }, input: { color: "white", backgroundColor: "#111827", borderColor: "#334155", borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 }, saveButton: { backgroundColor: "#2563eb", paddingVertical: 14, borderRadius: 14, alignItems: "center" }, saveText: { color: "white", fontWeight: "800" } });