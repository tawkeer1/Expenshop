import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const contactOptions = [
  {
    title: "Call support",
    value: "+91 123-456-7890",
    icon: "call-outline" as const,
  },
  {
    title: "Email us",
    value: "towqeerahmad111@gmail.com",
    icon: "mail-outline" as const,
  },
  {
    title: "Visit office",
    value: "123 Budget Street, Finance City",
    icon: "location-outline" as const,
  },
];

export default function ContactScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.title}>Contact</ThemedText>
        <ThemedText style={styles.subtitle}>
          Reach out for support, feedback, or help keeping your spending organized.
        </ThemedText>

        <ThemedView style={styles.heroCard}>
          <Ionicons name="people-outline" size={28} color="#60a5fa" />
          <ThemedText style={styles.heroTitle}>Need a hand?</ThemedText>
          <ThemedText style={styles.heroText}>
            Feel free to contact
          </ThemedText>
        </ThemedView>

        {contactOptions.map((option) => (
          <ThemedView key={option.title} style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <View style={styles.iconWrapper}>
                <Ionicons name={option.icon} size={18} color="white" />
              </View>
              <View style={styles.contactTextWrap}>
                <ThemedText style={styles.contactTitle}>{option.title}</ThemedText>
                <ThemedText style={styles.contactValue}>{option.value}</ThemedText>
              </View>
            </View>
          </ThemedView>
        ))}

        <Pressable style={styles.button} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="white" style={styles.buttonIcon} />
          <ThemedText style={styles.buttonText}>Back</ThemedText>
        </Pressable>
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
    paddingTop: 12,
    paddingBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    marginBottom: 20,
    lineHeight: 22,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#111827",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginTop: 12,
    marginBottom: 6,
  },
  heroText: {
    color: "#cbd5e1",
    lineHeight: 22,
  },
  contactCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#111827",
    marginBottom: 12,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  contactTextWrap: {
    flex: 1,
  },
  contactTitle: {
    color: "white",
    fontWeight: "700",
    marginBottom: 4,
  },
  contactValue: {
    color: "#94a3b8",
    fontSize: 14,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "#2563eb",
    marginTop: 16,
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
  },
});
