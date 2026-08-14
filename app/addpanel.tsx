import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

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

  const options = useMemo(
    () => [
      { key: "shopping", label: "Shopping List", icon: "cart-outline", route: "shopping-list" },
      { key: "expense", label: "Expense", icon: "card-outline", route: "expense" },
      { key: "archive", label: "Archive", icon: "archive-outline", route: "archive" },
      { key: "contact", label: "Contact", icon: "call-outline", route: "contact" },
    ],
    [],
  );

  const optionsAnimRef = useRef(
    options.map(() => ({ opacity: new Animated.Value(0), translateY: new Animated.Value(12), scale: new Animated.Value(0.98) })),
  );

  useEffect(() => {
    if (isExpanded) {
      const anims = optionsAnimRef.current.map((anim) =>
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
          Animated.spring(anim.translateY, { toValue: 0, friction: 12, useNativeDriver: true }),
          Animated.spring(anim.scale, { toValue: 1, friction: 8, useNativeDriver: true }),
        ]),
      );
      Animated.stagger(80, anims).start();
    } else {
      const anims = optionsAnimRef.current
        .slice()
        .reverse()
        .map((anim) =>
          Animated.parallel([
            Animated.timing(anim.opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
            Animated.timing(anim.translateY, { toValue: 12, duration: 120, useNativeDriver: true }),
            Animated.spring(anim.scale, { toValue: 0.98, friction: 8, useNativeDriver: true }),
          ]),
        );
      Animated.stagger(40, anims).start();
    }
  }, [isExpanded, optionsAnimRef]);

  const handleNavigate = useCallback((screen: "shopping-list" | "expense" | "contact" | "archive") => {
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
          <View style={styles.optionList}>
            {options.map((opt, i) => {
              const anim = optionsAnimRef.current[i];
              return (
                <Animated.View
                  key={opt.key}
                  style={{
                    width: "100%",
                    opacity: anim.opacity,
                    transform: [
                      { translateY: anim.translateY },
                      { scale: anim.scale },
                    ],
                  }}
                >
                  <Pressable style={styles.optionRow} onPress={() => handleNavigate(opt.route as any)}>
                    <View style={styles.optionIcon}>
                      <Ionicons name={opt.icon as any} size={18} color="white" />
                    </View>
                    <ThemedText style={styles.optionText}>{opt.label}</ThemedText>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 21,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },

  sheetBackground: {
    borderColor: "#1f2937",
    backgroundColor: "#171717",
  },

  sheetContent: {
    paddingTop: 10,
    paddingBottom: 22,
    backgroundColor: "#171717",
  },

  optionList: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 8,
  },

  optionRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderColor: "#1f2937",
    borderWidth: 2,
  },

  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  optionText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
