import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import {
  addShoppingListItem,
  getDateKey,
  getShoppingListItems,
  subscribeShoppingList,
  updateShoppingListItem,
  updateShoppingListQuantity,
} from "@/app/models/shoppinglist";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const defaultCategories: Category[] = [
  { id: "milk", label: "Milk", icon: "water-outline", color: "#60a5fa" },
  { id: "bread", label: "Bread", icon: "bread-outline", color: "#fbbf24" },
  { id: "fruit", label: "Fruit", icon: "leaf-outline", color: "#34d399" },
  { id: "vegetables", label: "Vegetables", icon: "leaf-outline", color: "#10b981" },
  { id: "snacks", label: "Snacks", icon: "fast-food-outline", color: "#f97316" },
  { id: "coffee", label: "Coffee", icon: "cafe-outline", color: "#fb7185" },
  { id: "dairy", label: "Dairy", icon: "ice-cream-outline", color: "#7c3aed" },
  { id: "meat", label: "Meat", icon: "restaurant-outline", color: "#ef4444" },
  { id: "seafood", label: "Seafood", icon: "fish-outline", color: "#3b82f6" },
  { id: "frozen", label: "Frozen", icon: "snow-outline", color: "#38bdf8" },
  { id: "cleaning", label: "Cleaning", icon: "brush-outline", color: "#0ea5e9" },
  { id: "household", label: "Household", icon: "home-outline", color: "#8b5cf6" },
  { id: "personal-care", label: "Personal Care", icon: "heart-outline", color: "#ec4899" },
  { id: "pet", label: "Pet Supplies", icon: "paw-outline", color: "#f97316" },
  { id: "office", label: "Office", icon: "document-text-outline", color: "#22c55e" },
  { id: "baby", label: "Baby", icon: "baby-outline", color: "#a855f7" },
  { id: "beauty", label: "Beauty", icon: "flower-outline", color: "#fb7185" },
  { id: "health", label: "Health", icon: "medkit-outline", color: "#14b8a6" },
  { id: "pantry", label: "Pantry", icon: "basket-outline", color: "#f59e0b" },
  { id: "electronics", label: "Electronics", icon: "phone-portrait-outline", color: "#0f766e" },
  { id: "garden", label: "Garden", icon: "flower-outline", color: "#4ade80" },
  { id: "cooking", label: "Cooking", icon: "restaurant-outline", color: "#f97316" },
  { id: "stationery", label: "Stationery", icon: "pencil-outline", color: "#6366f1" },
  { id: "baking", label: "Baking", icon: "bonfire-outline", color: "#facc15" },
  { id: "beverages", label: "Beverages", icon: "wine-outline", color: "#7c3aed" },
  { id: "grains", label: "Grains", icon: "basket-outline", color: "#22c55e" },
  { id: "spices", label: "Spices", icon: "flame-outline", color: "#ef4444" },
  { id: "sports", label: "Sports", icon: "fitness-outline", color: "#14b8a6" },
  { id: "paper", label: "Paper Goods", icon: "document-text-outline", color: "#64748b" },
];

export default function ShoppingListScreen() {
  const [items, setItems] = useState(getShoppingListItems);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState<Category>(defaultCategories[0]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingPrice, setEditingPrice] = useState("");
  const scaleAnimationsRef = useRef<Record<string, Animated.Value>>({});

  const getScaleAnimation = useCallback((categoryId: string) => {
    if (!scaleAnimationsRef.current[categoryId]) {
      scaleAnimationsRef.current[categoryId] = new Animated.Value(1);
    }
    return scaleAnimationsRef.current[categoryId];
  }, []);

  const handleCategoryPressIn = useCallback((categoryId: string) => {
    Animated.spring(getScaleAnimation(categoryId), {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 8,
      tension: 90,
    }).start();
  }, [getScaleAnimation]);

  const handleCategoryPressOut = useCallback((categoryId: string) => {
    Animated.spring(getScaleAnimation(categoryId), {
      toValue: 1,
      useNativeDriver: true,
      friction: 10,
      tension: 100,
    }).start();
  }, [getScaleAnimation]);

  useEffect(() => {
    const unsubscribe = subscribeShoppingList((nextItems) => setItems(nextItems));
    return unsubscribe;
  }, []);

  const handleAddItem = () => {
    const trimmedName = name.trim() || selectedCategory.label;
    const normalizedPrice = Number(price);

    if (!trimmedName) {
      return;
    }

    addShoppingListItem({
      id: `${Date.now()}`,
      name: trimmedName,
      category: selectedCategory.label,
      quantity: Number(quantity) || 1,
      price: Number.isNaN(normalizedPrice) ? 0 : normalizedPrice,
      purchasedDate: getDateKey(),
    });

    setName("");
    setQuantity("1");
    setPrice("");
    setIsFormOpen(false);
  };

  const handleToggleForm = () => setIsFormOpen((prev) => !prev);

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryModalVisible(true);
  };

  const handleCloseModal = () => setCategoryModalVisible(false);

  const handleAddCustomCategory = () => {
    const label = newCategoryName.trim();
    if (!label) {
      return;
    }

    const customCategory: Category = {
      id: `${Date.now()}`,
      label,
      icon: "pricetag-outline",
      color: "#8b5cf6",
    };

    setCategories([customCategory, ...categories]);
    setSelectedCategory(customCategory);
    setNewCategoryName("");
  };

  const handleStartEdit = (item: { id: string; name: string; price: number }) => {
    setEditingId(item.id);
    setEditingName(item.name);
    setEditingPrice(String(item.price));
  };

  const handleSaveEdit = (id: string) => {
    const normalizedPrice = Number(editingPrice);
    if (!editingName.trim() || Number.isNaN(normalizedPrice)) {
      return;
    }

    updateShoppingListItem(id, {
      name: editingName,
      price: normalizedPrice,
    });

    setEditingId(null);
    setEditingName("");
    setEditingPrice("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingPrice("");
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.screenContent}>
        <ThemedText style={styles.title}></ThemedText>

        <ThemedView style={styles.heroCard}>
          <ThemedText style={styles.heroTitle}>Quick, clean shopping tracking</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Tap to add your item
          </ThemedText>

          <Pressable style={styles.heroAction} onPress={handleToggleForm}>
            <Ionicons name={isFormOpen ? "close-circle" : "add-circle"} size={22} color="white" />
            <ThemedText style={styles.heroActionText}>
              {isFormOpen ? "Hide categories" : "Add new item"}
            </ThemedText>
          </Pressable>
        </ThemedView>

        {isFormOpen ? (
          <ThemedView style={styles.formCard}>
            <ThemedText style={styles.sectionTitle}>Pick a category</ThemedText>
            <ThemedView style={styles.categoryGrid}>
              {categories.map((categoryItem) => {
                const animatedScale = getScaleAnimation(categoryItem.id);
                return (
                  <Pressable
                    key={categoryItem.id}
                    style={[
                      styles.categoryCell,
                      selectedCategory.id === categoryItem.id && styles.categoryCellActive,
                    ]}
                    onPress={() => handleSelectCategory(categoryItem)}
                    onPressIn={() => handleCategoryPressIn(categoryItem.id)}
                    onPressOut={() => handleCategoryPressOut(categoryItem.id)}
                  >
                    <Animated.View style={[styles.animatedCategory, { transform: [{ scale: animatedScale }] }]}> 
                      <ThemedView style={[styles.categoryIcon, { backgroundColor: categoryItem.color }]}> 
                        <Ionicons name={categoryItem.icon as any} size={18} color="white" />
                      </ThemedView>
                      <ThemedText
                        style={
                          selectedCategory.id === categoryItem.id
                            ? styles.categoryLabelActive
                            : styles.categoryLabel
                        }
                      >
                        {categoryItem.label}
                      </ThemedText>
                    </Animated.View>
                  </Pressable>
                );
              })}
            </ThemedView>

            <ThemedText style={styles.helpText}>Tap a category to add item details in a smooth pop-up.</ThemedText>

            <Modal
              visible={categoryModalVisible}
              animationType="slide"
              transparent
              onRequestClose={handleCloseModal}
            >
              <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                    <ThemedText style={styles.modalTitle}>Add to {selectedCategory.label}</ThemedText>
                    <Pressable onPress={handleCloseModal} style={styles.modalCloseButton}>
                      <Ionicons name="close" size={22} color="#94a3b8" />
                    </Pressable>
                  </View>

                  <ThemedView style={styles.selectedBadge}>
                    <Ionicons name={selectedCategory.icon as any} size={16} color="white" />
                    <ThemedText style={styles.selectedBadgeText}>{selectedCategory.label}</ThemedText>
                  </ThemedView>

                  <TextInput
                    style={styles.input}
                    placeholder="Item name"
                    placeholderTextColor="#8b95a6"
                    value={name}
                    onChangeText={setName}
                  />

                  <ThemedView style={styles.rowInputs}>
                    <TextInput
                      style={[styles.input, styles.halfInput]}
                      placeholder="Qty"
                      placeholderTextColor="#8b95a6"
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="number-pad"
                    />
                    <TextInput
                      style={[styles.input, styles.halfInput]}
                      placeholder="Price"
                      placeholderTextColor="#8b95a6"
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="decimal-pad"
                    />
                  </ThemedView>

                  <Pressable style={styles.submitButton} onPress={handleAddItem}>
                    <ThemedText style={styles.submitButtonText}>Add Item</ThemedText>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </ThemedView>
        ) : null}

        <ThemedView style={styles.listSection}>
          <ThemedText style={styles.sectionTitle}>Your current list</ThemedText>
          <ScrollView contentContainerStyle={styles.listContent}>
            {items.map((item) => (
              <Pressable
                key={item.id}
                style={styles.listCard}
                onLongPress={() => handleStartEdit(item)}
              >
                {editingId === item.id ? (
                  <ThemedView style={styles.editContainer}>
                    <TextInput
                      style={styles.editInput}
                      placeholder="Name"
                      placeholderTextColor="#8b95a6"
                      value={editingName}
                      onChangeText={setEditingName}
                    />
                    <TextInput
                      style={styles.editInput}
                      placeholder="Price"
                      placeholderTextColor="#8b95a6"
                      value={editingPrice}
                      onChangeText={setEditingPrice}
                      keyboardType="decimal-pad"
                    />
                    <ThemedView style={styles.editActions}>
                      <Pressable style={styles.saveButton} onPress={() => handleSaveEdit(item.id)}>
                        <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                      </Pressable>
                      <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
                        <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                      </Pressable>
                    </ThemedView>
                  </ThemedView>
                ) : (
                  <ThemedView style={styles.cardRow}>
                    <ThemedView style={styles.cardInfo}>
                      <ThemedView style={styles.listHeaderRow}>
                        <ThemedText style={styles.listName}>{item.name}</ThemedText>
                        <Ionicons name="pencil" size={16} color="#94a3b8" />
                      </ThemedView>
<ThemedText style={styles.listMeta}>{item.category}</ThemedText>
                      {/* <ThemedText style={styles.listMeta}>Price: ${item.price.toFixed(2)} each</ThemedText> */}
                      <ThemedText style={styles.listMeta}>Total: ${(item.quantity * item.price).toFixed(2)}</ThemedText>
                      <ThemedText style={styles.listMeta}>Qty: {item.quantity}</ThemedText>
                      <ThemedText style={styles.listMeta}>Purchased: {item.purchasedDate}</ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.quantityControls}>
                      <Pressable style={styles.qtyButton} onPress={() => updateShoppingListQuantity(item.id, -1)}>
                        <ThemedText style={styles.qtyButtonText}>-</ThemedText>
                      </Pressable>
                      <ThemedText style={styles.qtyValue}>{item.quantity}</ThemedText>
                      <Pressable style={styles.qtyButton} onPress={() => updateShoppingListQuantity(item.id, 1)}>
                        <ThemedText style={styles.qtyButtonText}>+</ThemedText>
                      </Pressable>
                    </ThemedView>
                  </ThemedView>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  screenContent: {
    paddingBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 16,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#154cc2",
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "white",
  },
  heroSubtitle: {
    color: "#cbd5e1",
    lineHeight: 22,
    marginBottom: 16,
  },
  heroAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#000000",
    paddingVertical: 12,
    borderRadius: 16,
  },
  heroActionText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  formCard: {
    marginBottom: 18,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#171717",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
    padding: 6,
  },
  categoryCell: {
    width: "31%",
    minHeight: 78,
    borderRadius: 18,
    backgroundColor: "#171717",
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryCellActive: {
    backgroundColor: "#0844f7",
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryLabel: {
    color: "#cbd5e1",
    textAlign: "center",
    fontSize: 12,
  },
  categoryLabelActive: {
    color: "white",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
  },
  animatedCategory: {
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    marginBottom: 14,
  },
  selectedBadgeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  helpText: {
    color: "#94a3b8",
    marginBottom: 14,
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(6, 5, 5, 0.55)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#171717",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 30,
    borderColor: "#1e293b",
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
  modalCloseButton: {
    padding: 8,
  },
  input: {
    backgroundColor: "#111827",
    borderRadius: 16,
    color: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  newCategoryRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  newCategoryInput: {
    flex: 1,
    marginBottom: 0,
  },
  newCategoryButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  listSection: {
    marginBottom: 24,
  },
  listContent: {
    gap: 14,
  },
  listCard: {
    borderRadius: 24,
    backgroundColor: "#171717",
    padding: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    backgroundColor: "#171717",
  },
  cardInfo: {
    flex: 1,
    backgroundColor: "#171717"
  },
  listHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
    backgroundColor: "#171717"
  },
  listName: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  listMeta: {
    color: "#94a3b8",
    marginTop: 2,
    fontSize: 13,
  },
  quantityControls: {
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 18,
    padding: 8,
    width: 96,
    backgroundColor: "#171717",
  },
  qtyButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#171717",
  },
  qtyButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  qtyValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginVertical: 4,
  },
  editContainer: {
    gap: 12,
  },
  editInput: {
    backgroundColor: "#111827",
    borderRadius: 16,
    color: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "700",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#334155",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#cbd5e1",
    fontWeight: "700",
  },
});
