import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import {
  addShoppingListItem,
  deleteShoppingListItem,
  getDateKey,
  getShoppingListItems,
  markShoppingListItemBought,
  subscribeShoppingList,
  updateShoppingListItem,
  updateShoppingListQuantity,
  type ShoppingListItem,
} from "@/app/models/shoppinglist";
import { purchaseCategories, type PurchaseCategory } from "@/app/models/purchase-categories";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import ItemActions from "@/components/item-actions";

export default function ShoppingListScreen() {
  const [items, setItems] = useState<ShoppingListItem[]>(getShoppingListItems());
  const [category, setCategory] = useState<PurchaseCategory>(purchaseCategories[0]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [boughtItem, setBoughtItem] = useState<ShoppingListItem | null>(null);
  const [boughtQuantity, setBoughtQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("");
  const [actionsItemId, setActionsItemId] = useState<string | null>(null);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => subscribeShoppingList(setItems), []);

  const addToList = () => {
    const itemName = name.trim() || category.label;
    if (!itemName) return;
    addShoppingListItem({
      id: `${Date.now()}`,
      name: itemName,
      category: category.label,
      quantity: Number(quantity) || 1,
      purchasedDate: getDateKey(), price: 0, planned: true,
    });
    setName("");
    setQuantity("1");
    setIsAddModalVisible(false);
  };

  const openBought = (item: ShoppingListItem) => {
    setBoughtItem(item);
    setBoughtQuantity(String(item.quantity));
    setUnitCost("");
  };

  const confirmBought = () => {
    if (!boughtItem) return;
    const count = Number(boughtQuantity);
    const cost = Number(unitCost);
    if (!count || Number.isNaN(cost) || cost < 0) return;
    markShoppingListItemBought(boughtItem.id, count, cost);
    setBoughtItem(null);
  };

  const closeActions = () => {
    setActionsVisible(false);
    setActionsItemId(null);
  };

  const editSelectedItem = () => {
    const item = items.find((entry) => entry.id === actionsItemId);
    if (item) {
      setEditingItemId(item.id);
      setEditingName(item.name);
    }
    closeActions();
  };

  const deleteSelectedItem = () => {
    if (actionsItemId) deleteShoppingListItem(actionsItemId);
    closeActions();
  };

  const saveItemName = (id: string) => {
    if (!editingName.trim()) return;
    updateShoppingListItem(id, { name: editingName });
    setEditingItemId(null);
    setEditingName("");
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
        <ThemedText style={styles.title}>Shopping list</ThemedText>
        <ThemedText style={styles.subtitle}>Keep your market checklist here. Mark an item bought to add it to Expense.</ThemedText>
        <ThemedView style={styles.formCard}>
          <ThemedText style={styles.sectionTitle}>Choose a category</ThemedText>
          <View style={styles.categoryGrid}>
            {purchaseCategories.map((option) => <Pressable key={option.id} onPress={() => { setCategory(option); setIsAddModalVisible(true); }} style={styles.category}>
              <View style={[styles.categoryIcon, { backgroundColor: option.color }]}><Ionicons name={option.icon as any} size={18} color="white" /></View>
              <ThemedText style={styles.categoryLabel}>{option.label}</ThemedText>
            </Pressable>)}
          </View>
        </ThemedView>

        <ThemedText style={styles.sectionTitle}>To buy ({items.length})</ThemedText>
        {items.length === 0 ? <ThemedView style={styles.empty}><ThemedText style={styles.muted}>Your list is clear. Add something before your next trip.</ThemedText></ThemedView> : items.map((item) => <Pressable key={item.id} style={styles.itemCard} onLongPress={() => { setActionsItemId(item.id); setActionsVisible(true); }}>
          <View style={styles.itemTop}><View style={styles.itemDetails}>{editingItemId === item.id ? <TextInput autoFocus style={styles.editInput} value={editingName} onChangeText={setEditingName} onSubmitEditing={() => saveItemName(item.id)} returnKeyType="done" /> : <ThemedText style={styles.itemName}>{item.name}</ThemedText>}<ThemedText style={styles.muted}>{item.category} - Need {item.quantity}</ThemedText></View>
            {editingItemId === item.id ? <View style={styles.editControls}><Pressable onPress={() => saveItemName(item.id)} hitSlop={8}><Ionicons name="checkmark" size={21} color="#22c55e" /></Pressable><Pressable onPress={() => { setEditingItemId(null); setEditingName(""); }} hitSlop={8}><Ionicons name="close" size={21} color="#94a3b8" /></Pressable></View> : null}</View>
          <View style={styles.itemActions}><View style={styles.counter}><Pressable onPress={() => updateShoppingListQuantity(item.id, -1)}><Ionicons name="remove" size={18} color="white" /></Pressable><ThemedText style={styles.count}>{item.quantity}</ThemedText><Pressable onPress={() => updateShoppingListQuantity(item.id, 1)}><Ionicons name="add" size={18} color="white" /></Pressable></View>
            <Pressable style={styles.boughtButton} onPress={() => openBought(item)}><Ionicons name="checkmark-circle" size={18} color="white" /><ThemedText style={styles.boughtText}>Buy</ThemedText></Pressable></View>
        </Pressable>)}
      </ScrollView>

      <ItemActions visible={actionsVisible} onClose={closeActions} onEdit={editSelectedItem} onDelete={deleteSelectedItem} title={items.find((item) => item.id === actionsItemId)?.name} />

      <Modal transparent animationType="slide" visible={isAddModalVisible} onRequestClose={() => setIsAddModalVisible(false)}><View style={styles.backdrop}><View style={styles.modal}>
        <View style={styles.modalHeader}><ThemedText style={styles.modalTitle}>Add to list</ThemedText><Pressable onPress={() => setIsAddModalVisible(false)}><Ionicons name="close" size={24} color="#94a3b8" /></Pressable></View>
        <View style={styles.selectedCategory}><View style={[styles.categoryIcon, { backgroundColor: category.color }]}><Ionicons name={category.icon as any} size={18} color="white" /></View><ThemedText style={styles.itemName}>{category.label}</ThemedText></View>
        <TextInput style={styles.input} placeholder="Item name (optional)" placeholderTextColor="#94a3b8" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="How many?" placeholderTextColor="#94a3b8" keyboardType="number-pad" value={quantity} onChangeText={setQuantity} />
        <Pressable style={styles.primaryButton} onPress={addToList}><ThemedText style={styles.primaryButtonText}>Add to list</ThemedText></Pressable>
      </View></View></Modal>

      <Modal transparent animationType="slide" visible={!!boughtItem} onRequestClose={() => setBoughtItem(null)}><View style={styles.backdrop}><View style={styles.modal}>
        <View style={styles.modalHeader}><ThemedText style={styles.modalTitle}>Mark as bought</ThemedText><Pressable onPress={() => setBoughtItem(null)}><Ionicons name="close" size={24} color="#94a3b8" /></Pressable></View>
        <ThemedText style={styles.muted}>{boughtItem?.name} will be added to your expense list.</ThemedText>
        <TextInput style={styles.input} placeholder="Count" placeholderTextColor="#94a3b8" keyboardType="number-pad" value={boughtQuantity} onChangeText={setBoughtQuantity} />
        <TextInput style={styles.input} placeholder="Cost per item (₹)" placeholderTextColor="#94a3b8" keyboardType="decimal-pad" value={unitCost} onChangeText={setUnitCost} />
        <Pressable style={styles.primaryButton} onPress={confirmBought}><ThemedText style={styles.primaryButtonText}>Add to expenses</ThemedText></Pressable>
      </View></View></Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  selectedCategory: { flexDirection: "row", alignItems: "center", gap: 10 },
  editInput: { color: "white", backgroundColor: "#111827", borderColor: "#334155", borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  editControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  container: { flex: 1, padding: 18 }, content: { paddingTop: 32, paddingBottom: 88, gap: 14 }, title: { fontSize: 30, fontWeight: "800", height:40 }, subtitle: { color: "#94a3b8", lineHeight: 21, marginBottom: 4, marginTop: 2 }, hero: { backgroundColor: "#154cc2", borderRadius: 24, padding: 20, gap: 10 }, heroTitle: { color: "white", fontSize: 20, fontWeight: "800" }, heroText: { color: "#dbeafe", lineHeight: 20 }, primaryButton: { backgroundColor: "#2563eb", borderRadius: 14, paddingVertical: 13, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }, primaryButtonText: { color: "white", fontWeight: "800" }, formCard: { backgroundColor: "#171717", borderRadius: 22, padding: 16, gap: 12 }, sectionTitle: { fontSize: 18, fontWeight: "800", marginTop: 6 }, categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, category: { width: "31%", minHeight: 72, borderRadius: 14, padding: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a", gap: 5 }, categorySelected: { borderWidth: 2, borderColor: "#2563eb" }, categoryIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" }, categoryLabel: { color: "white", fontSize: 11, textAlign: "center" }, input: { color: "white", backgroundColor: "#111827", borderColor: "#334155", borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 }, empty: { backgroundColor: "#111827", borderRadius: 18, padding: 18 }, muted: { color: "#94a3b8" }, itemCard: { backgroundColor: "#111827", borderRadius: 18, padding: 16, gap: 14 }, itemTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 }, itemDetails: { flex: 1, gap: 4 }, itemName: { color: "white", fontSize: 17, fontWeight: "800" }, itemActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, counter: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: "#0f172a", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }, count: { color: "white", fontWeight: "800", minWidth: 20, textAlign: "center" }, boughtButton: { flexDirection: "row", gap: 6, alignItems: "center", backgroundColor: "#2563eb", paddingHorizontal: 13, paddingVertical: 10, borderRadius: 12 }, boughtText: { color: "white", fontWeight: "800" }, backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }, modal: { backgroundColor: "#171717", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, gap: 14 }, modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, modalTitle: { color: "white", fontSize: 21, fontWeight: "800" },
});