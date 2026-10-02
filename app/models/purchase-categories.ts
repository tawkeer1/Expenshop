export type PurchaseCategory = { id: string; label: string; icon: string; color: string };

// Shared by the market checklist and the Expense "Buy items" area.
export const purchaseCategories: PurchaseCategory[] = [
  { id: "milk", label: "Milk", icon: "water-outline", color: "#60a5fa" },
  { id: "eggs", label: "Eggs", icon: "egg-outline", color: "#fbbf24" },
  { id: "bread", label: "Bread", icon: "bread-outline", color: "#fbbf24" },
  { id: "fruit", label: "Fruit", icon: "leaf-outline", color: "#34d399" },
  { id: "vegetables", label: "Vegetables", icon: "leaf-outline", color: "#10b981" },
  { id: "snacks", label: "Snacks", icon: "fast-food-outline", color: "#f97316" },
  { id: "dairy", label: "Dairy", icon: "ice-cream-outline", color: "#7c3aed" },
  { id: "meat", label: "Meat", icon: "restaurant-outline", color: "#ef4444" },
  { id: "cleaning", label: "Cleaning", icon: "brush-outline", color: "#0ea5e9" },
  { id: "household", label: "Household", icon: "home-outline", color: "#8b5cf6" },
  { id: "personal-care", label: "Personal care", icon: "heart-outline", color: "#ec4899" },
  { id: "pet", label: "Pet supplies", icon: "paw-outline", color: "#f97316" },
  { id: "pantry", label: "Pantry", icon: "basket-outline", color: "#f59e0b" },
  { id: "other", label: "Other", icon: "pricetag-outline", color: "#64748b" },
];
