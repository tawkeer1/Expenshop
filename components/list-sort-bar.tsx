import { ThemedText } from "@/components/themed-text";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from "react-native-reanimated";

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
  const [areSortOptionsVisible, setAreSortOptionsVisible] = useState(false);

  const handleFieldPress = (field: T) => {
    if (field === sortField) {
      onSortChange(field, sortDirection === "asc" ? "desc" : "asc");
      return;
    }

    onSortChange(field, defaultSortDirection(field));
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.sortButton}
        onPress={() => setAreSortOptionsVisible((visible) => !visible)}
        accessibilityRole="button"
        accessibilityState={{ expanded: areSortOptionsVisible }}
        accessibilityLabel="Sort items"
      >
        <Ionicons name="swap-vertical-outline" size={17} color="#cbd5e1" />
        <ThemedText style={styles.sortButtonText}>Sort by</ThemedText>
        <Ionicons
          name={areSortOptionsVisible ? "chevron-up" : "chevron-down"}
          size={16}
          color="#94a3b8"
        />
      </Pressable>

      {areSortOptionsVisible ? (
        <Animated.View
          entering={FadeInDown.duration(180)}
          exiting={FadeOutUp.duration(140)}
          layout={LinearTransition.duration(180)}
          style={styles.sortPanel}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
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
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  sortButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  sortButtonText: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "700",
  },
  sortPanel: {
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#0b1220",
    borderWidth: 1,
    borderColor: "#1f2937",
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
