import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

const options = [
  {
    key: "shopping",
    label: "Shopping List",
    description: "Track groceries and items you buy",
    icon: "cart-outline" as const,
    route: "/shopping-list",
    color: "#2563eb",
  },
  {
    key: "expense",
    label: "Expense",
    description: "Log bills, subscriptions, and other costs",
    icon: "card-outline" as const,
    route: "/expense",
    color: "#7c3aed",
  },
];

export default function AddItemScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="white" />
        </Pressable>

        <ThemedText style={styles.title}>Add item</ThemedText>
        <ThemedText style={styles.subtitle}>Choose what you want to track</ThemedText>

        <View style={styles.optionList}>
          {options.map((option) => (
            <Pressable
              key={option.key}
              style={styles.optionCard}
              onPress={() => router.push(option.route)}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                <Ionicons name={option.icon} size={24} color="white" />
              </View>
              <View style={styles.optionCopy}>
                <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
                <ThemedText style={styles.optionDescription}>{option.description}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  content: {
    paddingBottom: 32,
    paddingTop: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    marginBottom: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    marginBottom: 24,
    lineHeight: 22,
  },
  optionList: {
    gap: 14,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  optionCopy: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  optionDescription: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
  },
});
