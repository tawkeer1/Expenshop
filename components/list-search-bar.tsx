import { ThemedText } from "@/components/themed-text";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from "react-native-reanimated";

import {
  emptyListFilters,
  isFilterActive,
  type DateFilter,
  type ListFilterState,
} from "@/utils/list-filter";

type Props = {
  filters: ListFilterState;
  onFiltersChange: (filters: ListFilterState) => void;
  categories: string[];
  placeholder?: string;
  showSourceFilter?: boolean;
  showDateFilter?: boolean;
};

const dateOptions: { key: DateFilter; label: string }[] = [
  { key: "all", label: "All dates" },
  { key: "today", label: "Today" },
  { key: "thisMonth", label: "This month" },
];

const sourceOptions = ["Shopping", "Expense"];

export default function ListSearchBar({
  filters,
  onFiltersChange,
  categories,
  placeholder = "Search by name, category, date, amount...",
  showSourceFilter = false,
  showDateFilter = true,
}: Props) {
  const [areFiltersVisible, setAreFiltersVisible] = useState(false);

  const updateFilters = (updates: Partial<ListFilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleClear = () => {
    onFiltersChange(emptyListFilters);
    setAreFiltersVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color="#94a3b8" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          value={filters.query}
          onChangeText={(query) => updateFilters({ query })}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {isFilterActive(filters) ? (
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        style={[styles.filterButton, isFilterActive(filters) && styles.filterButtonActive]}
        onPress={() => setAreFiltersVisible((visible) => !visible)}
        accessibilityRole="button"
        accessibilityState={{ expanded: areFiltersVisible }}
        accessibilityLabel="Filter items"
      >
        <Ionicons name="filter-outline" size={17} color={isFilterActive(filters) ? "white" : "#cbd5e1"} />
        <ThemedText style={isFilterActive(filters) ? styles.filterButtonTextActive : styles.filterButtonText}>
          Filter
        </ThemedText>
        <Ionicons
          name={areFiltersVisible ? "chevron-up" : "chevron-down"}
          size={16}
          color={isFilterActive(filters) ? "white" : "#94a3b8"}
        />
      </Pressable>

      {areFiltersVisible ? (
        <Animated.View entering={FadeInDown.duration(180)} exiting={FadeOutUp.duration(140)} layout={LinearTransition.duration(180)} style={styles.filterPanel}>
      {showDateFilter ? (
        <>
          <ThemedText style={styles.label}>Date</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {dateOptions.map((option) => {
              const isActive = filters.dateFilter === option.key;

              return (
                <Pressable
                  key={option.key}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => updateFilters({ dateFilter: option.key })}
                >
                  <ThemedText style={isActive ? styles.chipTextActive : styles.chipText}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      ) : null}

      {showSourceFilter ? (
        <>
          <ThemedText style={styles.label}>Source</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            <Pressable
              style={[styles.chip, filters.source === null && styles.chipActive]}
              onPress={() => updateFilters({ source: null })}
            >
              <ThemedText style={filters.source === null ? styles.chipTextActive : styles.chipText}>
                All
              </ThemedText>
            </Pressable>
            {sourceOptions.map((source) => {
              const isActive = filters.source === source;

              return (
                <Pressable
                  key={source}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => updateFilters({ source: isActive ? null : source })}
                >
                  <ThemedText style={isActive ? styles.chipTextActive : styles.chipText}>
                    {source}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      ) : null}

      {categories.length > 0 ? (
        <>
          <ThemedText style={styles.label}>Category</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            <Pressable
              style={[styles.chip, filters.category === null && styles.chipActive]}
              onPress={() => updateFilters({ category: null })}
            >
              <ThemedText style={filters.category === null ? styles.chipTextActive : styles.chipText}>
                All
              </ThemedText>
            </Pressable>
            {categories.map((category) => {
              const isActive = filters.category === category;

              return (
                <Pressable
                  key={category}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => updateFilters({ category: isActive ? null : category })}
                >
                  <ThemedText style={isActive ? styles.chipTextActive : styles.chipText}>
                    {category}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      ) : null}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#111827",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: "white",
    paddingVertical: 12,
    fontSize: 15,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
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
  filterButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterButtonText: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "700",
  },
  filterButtonTextActive: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
  },
  filterPanel: {
    marginTop: 10,
    padding: 12,
    gap: 10,
    borderRadius: 16,
    backgroundColor: "#0b1220",
    borderWidth: 1,
    borderColor: "#1f2937",
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
    marginBottom: 10,
  },
  chip: {
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
