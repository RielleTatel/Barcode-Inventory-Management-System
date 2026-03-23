// Branch type (from /api/branches/)
export interface Branch {
  id: number;
  name: string;
  branch_type: 'kitchen' | 'cafe_only';
  branch_type_display?: string;
  address: string;
  contact_number: string;
  is_active: boolean;
}

// Unit of Measurement preset
export interface UomPreset {
  id: number;
  name: string;
  abbreviation: string;
}

// Per-branch stock record
export interface BranchStock {
  id: number;
  branch: number;
  branch_name: string;
  branch_type: string;
  quantity: string;
  threshold: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  last_updated: string;
}

// Inventory Category types
export interface InventoryCategory {
  id: number;
  name: string;
  items_count: number;
}

// Category options for the dropdown
export const INVENTORY_CATEGORIES = [
  { value: 'raw_materials', label: 'Raw Materials' },
  { value: 'prepared_items', label: 'Prepared Items' },
] as const;

export type InventoryCategoryType = typeof INVENTORY_CATEGORIES[number]['value'];

// Inventory Item from API — master product record
export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  category: number;
  category_name: string;
  uom: string;
  total_stock: string;
  stock_status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  branch_stocks: BranchStock[];
  linked_menu_item: number | null;
  linked_menu_item_details?: {
    id: number;
    sku: string;
    name: string;
    price: string;
  } | null;
  created_at: string;
  updated_at: string;
}

// Form data for creating/editing inventory items
export interface InventoryItemFormData {
  sku: string;
  name: string;
  category: number;
  uom: string;
  linked_menu_item?: number | null;
  branch_stocks_write: { branch_id: number; quantity: string; threshold: string }[];
}

// Stock data for display (legacy support)
export interface stockData {
  sku: string;
  itemName: string;
  category: string;
  stockLevel: number;
  unit: number;
  status: string;
  actions: () => void;
}

// Query keys for React Query
export const INVENTORY_QUERY_KEYS = {
  INVENTORY_ITEMS: ['inventoryItems'],
  INVENTORY_CATEGORIES: ['inventoryCategories'],
  LOW_STOCK: ['lowStockItems'],
  BOM_ENTRIES: ['bomEntries'],
  BRANCHES: ['branches'],
  TRANSFER_LOGS: ['transferLogs'],
} as const;

// Unit of Measure options
export const UOM_OPTIONS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'L', label: 'Liters (L)' },
  { value: 'mL', label: 'Milliliters (mL)' },
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'box', label: 'Box' },
  { value: 'pack', label: 'Pack' },
  { value: 'serving', label: 'Serving' },
] as const;
