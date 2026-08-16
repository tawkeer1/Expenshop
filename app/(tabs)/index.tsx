import { getExpenseSummary, subscribeShoppingList } from "@/app/models/shoppinglist";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import AddPanel from "../addpanel";

export default function HomeScreen() {
  const [summary, setSummary] = useState(() => getExpenseSummary());

  useEffect(() => {
    setSummary(getExpenseSummary());

    const unsubscribe = subscribeShoppingList(() => {
      setSummary(getExpenseSummary());
    });

    return unsubscribe;
  }, []);

  return (
    <ThemedView style={styles.mainContainer}>
      <ThemedView style={styles.summaryContainer}>
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
            <ThemedText style={styles.summaryLabel}>This year</ThemedText>
            <ThemedText style={styles.amount}>₹{summary.allTimeTotal.toFixed(1)}</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <AddPanel />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  summaryContainer: {
    position: "absolute",
    top: "auto",
    width: "100%",
    paddingHorizontal: 18,
    alignItems: "center",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#cbd5e1",
    marginBottom: 6,
  },
  amount: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
  },
  quickAdd: {
    marginTop: 6,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  quickAddText: {
    color: "white",
    fontWeight: "700",
  },
});
