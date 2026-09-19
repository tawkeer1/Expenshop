import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

type SelectionTotalBarProps = {
  active: boolean;
  count: number;
  total: number;
  onToggle: () => void;
  onClear: () => void;
};

export default function SelectionTotalBar({
  active,
  count,
  total,
  onToggle,
  onClear,
}: SelectionTotalBarProps) {
  if (!active) {
    return (
      <Pressable style={styles.selectButton} onPress={onToggle} accessibilityLabel="Select items to calculate their total">
        <Ionicons name="checkbox-outline" size={18} color="#bfdbfe" />
        <ThemedText style={styles.selectButtonText}>Select items</ThemedText>
      </Pressable>
    );
  }

  return (
    <ThemedView style={styles.summary}>
      <View style={styles.summaryText}>
        <ThemedText style={styles.label}>
          {count === 0 ? "Select items to calculate total" : `${count} item${count === 1 ? "" : "s"} selected`}
        </ThemedText>
        <ThemedText style={styles.total}>₹{total.toFixed(2)}</ThemedText>
      </View>
      <View style={styles.actions}>
        {count > 0 ? (
          <Pressable style={styles.clearButton} onPress={onClear} accessibilityLabel="Clear selected items">
            <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
          </Pressable>
        ) : null}
        <Pressable style={styles.doneButton} onPress={onToggle} accessibilityLabel="Finish selecting items">
          <ThemedText style={styles.doneButtonText}>Done</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  selectButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: "#1d4ed8", backgroundColor: "#102a43" },
  selectButtonText: { color: "#dbeafe", fontWeight: "700" },
  summary: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12, padding: 14, borderRadius: 16, backgroundColor: "#102a43", borderWidth: 1, borderColor: "#2563eb" },
  summaryText: { flex: 1 },
  label: { color: "#bfdbfe", fontSize: 13, fontWeight: "700" },
  total: { color: "white", fontSize: 20, fontWeight: "800", marginTop: 3, fontVariant: ["tabular-nums"] },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  clearButton: { paddingVertical: 8, paddingHorizontal: 10 },
  clearButtonText: { color: "#bfdbfe", fontWeight: "700" },
  doneButton: { paddingVertical: 8, paddingHorizontal: 11, borderRadius: 10, backgroundColor: "#2563eb" },
  doneButtonText: { color: "white", fontWeight: "800" },
});
