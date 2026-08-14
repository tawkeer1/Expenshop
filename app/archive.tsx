import { getArchivedExpenseItems, getArchivedExpenseMonths, getArchivedShoppingItems, getArchivedShoppingMonths } from "@/app/models/shoppinglist";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
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

  useEffect(() => {
    const s = getArchivedShoppingMonths();
    const e = getArchivedExpenseMonths();
    const setUnion = Array.from(new Set([...s, ...e])).sort().reverse();
    setMonths(setUnion);
    if (setUnion.length > 0) setSelectedMonth(setUnion[0]);
  }, []);

  const shoppingItems = useMemo(() => (selectedMonth ? getArchivedShoppingItems(selectedMonth) : []), [selectedMonth]);
  const expenseItems = useMemo(() => (selectedMonth ? getArchivedExpenseItems(selectedMonth) : []), [selectedMonth]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
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
                {shoppingItems.length === 0 ? (
                  <ThemedText style={styles.emptyText}>No items for this month.</ThemedText>
                ) : (
                  shoppingItems.map((it) => (
                    <ThemedView key={it.id} style={styles.itemCard}>
                      <View style={styles.itemRow}>
                        <View style={styles.itemLeft}>
                          <Ionicons name="cart-outline" size={20} color="#cbd5e1" />
                        </View>

                        <View style={styles.itemCenter}>
                          <ThemedText style={styles.itemTitle}>{it.name}</ThemedText>
                          <ThemedText style={styles.itemMeta}>{it.category} • Qty {it.quantity}</ThemedText>
                        </View>

                        <View style={styles.itemRight}>
                          <ThemedText style={styles.itemAmount}>${(it.price * it.quantity).toFixed(2)}</ThemedText>
                          <ThemedText style={styles.itemDate}>{prettyDate(it.purchasedDate)}</ThemedText>
                        </View>
                      </View>
                    </ThemedView>
                  ))
                )}
              </ThemedView>
            ) : (
              <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Expenses ({expenseItems.length})</ThemedText>
                {expenseItems.length === 0 ? (
                  <ThemedText style={styles.emptyText}>No expenses for this month.</ThemedText>
                ) : (
                  expenseItems.map((it) => (
                    <ThemedView key={it.id} style={styles.itemCard}>
                      <View style={styles.itemRow}>
                        <View style={styles.itemLeft}>
                          <Ionicons name="card-outline" size={20} color="#cbd5e1" />
                        </View>

                        <View style={styles.itemCenter}>
                          <ThemedText style={styles.itemTitle}>{it.description || it.category}</ThemedText>
                          <ThemedText style={styles.itemMeta}>{it.category}</ThemedText>
                        </View>

                        <View style={styles.itemRight}>
                          <ThemedText style={styles.itemAmount}>${it.amount.toFixed(2)}</ThemedText>
                          <ThemedText style={styles.itemDate}>{prettyDate(it.purchasedDate)}</ThemedText>
                        </View>
                      </View>
                    </ThemedView>
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
  container: { flex: 1, padding: 18 },
  content: { paddingBottom: 48 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  backButton: { padding: 8 },
  title: { fontSize: 22, fontWeight: "800" },
  monthsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  monthButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, backgroundColor: "#111827" },
  monthButtonActive: { backgroundColor: "#2563eb" },
  monthLabel: { color: "#cbd5e1" },
  monthLabelActive: { color: "white", fontWeight: "700" },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "#0f172a" },
  tabButtonActive: { backgroundColor: "#2563eb" },
  tabText: { color: "#cbd5e1" },
  tabTextActive: { color: "white", fontWeight: "700" },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  itemCard: { padding: 10, borderRadius: 12, backgroundColor: "#0b1220", marginBottom: 10, borderWidth: 1, borderColor: "#0f172a" },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemLeft: { width: 36, alignItems: "center", justifyContent: "center" },
  itemCenter: { flex: 1 },
  itemRight: { alignItems: "flex-end", minWidth: 84 },
  itemTitle: { fontSize: 15, fontWeight: "700", color: "#e6eef8" },
  itemMeta: { color: "#94a3b8", marginTop: 4, fontSize: 13 },
  itemAmount: { fontWeight: "700", color: "#cbd5e1" },
  itemDate: { color: "#94a3b8", fontSize: 12, marginTop: 4 },
  emptyText: { color: "#94a3b8" },
});
