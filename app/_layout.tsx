import { Stack } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { archiveOldItems } from "@/app/models/shoppinglist";

export default function RootLayout() {
  useEffect(() => {
    archiveOldItems();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") archiveOldItems();
    });
    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}