import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AddPanel from "../addpanel";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.mainContainer}>
      <ThemedText style={styles.contactText}>
        Hello there, Get started by adding your expenses
      </ThemedText>
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
