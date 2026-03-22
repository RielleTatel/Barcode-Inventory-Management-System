import api from "@/hooks/api";
import type { InventoryItem, InventoryItemFormData, InventoryCategory, Branch } from ".";

// ── Branches ─────────────────────────────────────────────────────────────────

export const fetchBranches = async (): Promise<Branch[]> => {
  const { data } = await api.get('/branches/');
  return data;
};

// ── Categories ────────────────────────────────────────────────────────────────

export const fetchInventoryCategories = async (): Promise<InventoryCategory[]> => {
  const { data } = await api.get('/inventory/categories/');
  return data;
};

export const createInventoryCategory = async (name: string): Promise<InventoryCategory> => {
  const { data } = await api.post('/inventory/categories/', { name });
  return data;
};

// ── Inventory Items ───────────────────────────────────────────────────────────

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

export const updateInventoryItem = async (
  id: number,
  updates: Partial<InventoryItemFormData>
): Promise<InventoryItem> => {
  const { data } = await api.patch(`/inventory/items/${id}/`, updates);
  return data;
};

export const deleteInventoryItem = async (id: number): Promise<void> => {
  await api.delete(`/inventory/items/${id}/`);
};

// ── Stock Transfers ───────────────────────────────────────────────────────────

export interface TransferPayload {
  item_id: number;
  from_branch_id: number;
  to_branch_id: number;
  quantity: number;
  date: string;
  notes?: string;
}

export interface TransferLog {
  id: number;
  item: number;
  item_name: string;
  item_sku: string;
  item_uom: string;
  from_branch: number;
  from_branch_name: string;
  to_branch: number;
  to_branch_name: string;
  quantity: string;
  status: 'initiated' | 'in_transit' | 'received' | 'cancelled';
  date: string;
  notes: string;
  transferred_at: string;
  received_at: string | null;
  received_notes: string;
}

export const submitTransfer = async (
  payload: TransferPayload
): Promise<{ message: string; transfer: TransferLog }> => {
  const { data } = await api.post('/inventory/transfers/submit/', payload);
  return data;
};

export const receiveTransfer = async (
  transferId: number,
  notes?: string
): Promise<{ message: string; transfer: TransferLog }> => {
  const { data } = await api.post(`/inventory/transfers/${transferId}/receive/`, { notes: notes ?? '' });
  return data;
};

export const cancelTransfer = async (
  transferId: number
): Promise<{ message: string; transfer: TransferLog }> => {
  const { data } = await api.post(`/inventory/transfers/${transferId}/cancel/`);
  return data;
};

export const fetchTransferLogs = async (): Promise<TransferLog[]> => {
  const { data } = await api.get('/inventory/transfers/');
  return data;
};

// ── Consumption & BOM ─────────────────────────────────────────────────────────

export interface ConsumptionPayload {
  date: string;
  branch_id: number | null;
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
