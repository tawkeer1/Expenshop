import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AddPanel from "../addpanel";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.mainContainer}>
      <ThemedText>Hello there,</ThemedText>
      <ThemedText>Get started by adding your expenses</ThemedText>
      <ThemedText style={styles.contactText}>Contact: towqeerahmad111@gmail.com</ThemedText>
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
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  contactText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
