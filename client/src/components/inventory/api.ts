import api from "@/hooks/api";
import type { InventoryItem, InventoryItemFormData, InventoryCategory } from ".";

// Category API functions
export const fetchInventoryCategories = async (): Promise<InventoryCategory[]> => {
  const { data } = await api.get('/inventory/categories/');
  return data;
};

export const createInventoryCategory = async (name: string): Promise<InventoryCategory> => {
  const { data } = await api.post('/inventory/categories/', { name });
  return data;
};

// Inventory Item API functions
export const fetchAllInventoryItems = async (): Promise<InventoryItem[]> => {
  const { data } = await api.get('/inventory/items/');
  return data;
};

export const fetchInventoryItemById = async (id: number): Promise<InventoryItem> => {
  const { data } = await api.get(`/inventory/items/${id}/`);
  return data;
};

export const fetchInventoryItemsByCategory = async (categoryName: string): Promise<InventoryItem[]> => {
  const { data } = await api.get(`/inventory/items/by_category/?name=${encodeURIComponent(categoryName)}`);
  return data;
};

export const fetchLowStockItems = async (): Promise<InventoryItem[]> => {
  const { data } = await api.get('/inventory/items/low_stock/');
  return data;
};

export const createInventoryItem = async (item: InventoryItemFormData): Promise<InventoryItem> => {
  const { data } = await api.post('/inventory/items/', item);
  return data;
};

export const updateInventoryItem = async (id: number, updates: Partial<InventoryItemFormData>): Promise<InventoryItem> => {
  const { data } = await api.patch(`/inventory/items/${id}/`, updates);
  return data;
};

export const deleteInventoryItem = async (id: number): Promise<void> => {
  await api.delete(`/inventory/items/${id}/`);
};

// ── Consumption & BOM ────────────────────────────────────────────────────────

export interface ConsumptionPayload {
  date: string;
  branch_name: string;
  notes?: string;
  menu_items_sold: { menu_item_id: number; units_sold: number }[];
}

export interface BOMRow {
  id: number;
  consumption_id: number;
  date: string;
  branch_name: string;
  submitted_at: string;
  menu_item_name: string;
  menu_item_sku: string;
  units_sold: string;
  ingredient_name: string;
  quantity_deducted: string;
  unit: string;
  inventory_item: number | null;
  inventory_item_sku: string;
  inventory_matched: boolean;
}

export const submitConsumption = async (
  payload: ConsumptionPayload
): Promise<{ message: string; unmatched: string[] }> => {
  const { data } = await api.post('/inventory/consumption/submit/', payload);
  return data;
};

export const fetchBOMEntries = async (): Promise<BOMRow[]> => {
  const { data } = await api.get('/inventory/consumption/bom/');
  return data;
};

