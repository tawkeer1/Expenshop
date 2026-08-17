import { ThemedText } from "@/components/themed-text";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { defaultSortDirection, type SortDirection } from "@/utils/list-sort";

export interface SortFieldOption<T extends string> {
  key: T;
  label: string;
}

type Props<T extends string> = {
  fields: SortFieldOption<T>[];
  sortField: T;
  sortDirection: SortDirection;
  onSortChange: (field: T, direction: SortDirection) => void;
};

export default function ListSortBar<T extends string>({
  fields,
  sortField,
  sortDirection,
  onSortChange,
}: Props<T>) {
  const handleFieldPress = (field: T) => {
    if (field === sortField) {
      onSortChange(field, sortDirection === "asc" ? "desc" : "asc");
      return;
    }

    onSortChange(field, defaultSortDirection(field));
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>Sort by</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {fields.map((field) => {
          const isActive = sortField === field.key;

          return (
            <Pressable
              key={field.key}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => handleFieldPress(field.key)}
            >
              <ThemedText style={isActive ? styles.chipTextActive : styles.chipText}>
                {field.label}
              </ThemedText>
              {isActive ? (
                <Ionicons
                  name={sortDirection === "asc" ? "arrow-up" : "arrow-down"}
                  size={14}
                  color="white"
                />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  chipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  chipText: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
  },
});
