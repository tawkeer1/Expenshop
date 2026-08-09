import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

export default function AddPanel() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const snapPoints = useMemo(() => ["20%", "45%"], []);
  const handleToggleSheet = useCallback(() => {
    if (isExpanded) {
      bottomSheetRef.current?.close();
      setIsExpanded(false);
    } else {
      bottomSheetRef.current?.expand();
      setIsExpanded(true);
    }
  }, [isExpanded]);

  const handleSheetChange = useCallback((index: number) => {
    setIsExpanded(index !== -1);
  }, []);

  const handleNavigate = useCallback((screen: "shopping-list" | "expense") => {
    bottomSheetRef.current?.close();
    setIsExpanded(false);
    router.push(`/${screen}`);
  }, []);

  return (
    <>
      <ThemedView style={styles.panelContainer}>
        <Pressable style={styles.fab} onPress={handleToggleSheet}>
          {isExpanded ? (
            <Ionicons name="close" size={30} color="white" />
          ) : (
            <Ionicons name="add" size={30} color="white" />
          )}
        </Pressable>
      </ThemedView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleSheetChange}
        bottomInset={90}
        topInset={0}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Pressable
            style={styles.option}
            onPress={() => handleNavigate("shopping-list")}
          >
            <ThemedText>🛒 Shopping List</ThemedText>
          </Pressable>

          <Pressable
            style={styles.option}
            onPress={() => handleNavigate("expense")}
          >
            <ThemedText>💰 Expense</ThemedText>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
const styles = StyleSheet.create({
  panelContainer: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    alignItems: "center",
    zIndex: 20,
  },

  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",

    justifyContent: "center",
    alignItems: "center",
    zIndex: 21,
    elevation: 5,
  },

  sheetBackground: {
    backgroundColor: "#000000",
  },

  sheetContent: {
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "#000000",
  },

  option: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#2a2a2a",
  },
});
