// ── Supplier Directory ────────────────────────────────────────────────────────

export interface Supplier {
  id: number;
  supplier_code: string;
  name: string;
  category: string;
  contact_person: string;
  phone: string;
  email: string;
  payment_terms: string;
  lead_time_days: number;
  notes: string;
  is_archived: boolean;
  deliveries_count: number;
  created_at: string;
  updated_at: string;
}

export interface SupplierFormData {
  name: string;
  category: string;
  contact_person: string;
  phone: string;
  email: string;
  payment_terms: string;
  lead_time_days: string;
  notes: string;
}

// ── Delivery (Purchase History) ───────────────────────────────────────────────

export interface DeliveryItem {
  id: number;
  item_name: string;
  item_sku: string;
  item_uom: string;
  item_category: string;
  quantity_received: string;
  cost: string;
  total_cost: string;
}

export interface Delivery {
  id: number;
  supplier: number;
  supplier_name: string;
  supplier_code: string;
  branch: number;
  branch_name: string;
  dr_number: string;
  received_date: string;
  received_by: string;
  notes: string;
  delivery_items: DeliveryItem[];
  total_cost: string;
  items_summary: string[];
  item_count: number;
  created_at: string;
}

// ── Receive Delivery form ─────────────────────────────────────────────────────

export interface ReceiveItemRow {
  _id: number;
  item_name: string;
  item_sku: string;
  item_uom: string;
  item_category: string;
  quantity_received: string;
  cost: string;
}

export interface ReceivePayload {
  supplier_id: number;
  branch_id: number;
  dr_number?: string;
  received_date: string;
  received_by?: string;
  notes?: string;
  items: {
    item_name: string;
    item_sku: string;
    item_uom: string;
    item_category?: string;
    quantity_received: number;
    cost: number;
  }[];
}

// ── Legacy types (kept for gradual migration) ─────────────────────────────────

export interface ReceivedItem {
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface ActiveSupplier {
  supplierName: string;
  category: string;
  contactPerson: string;
  leadTime: string;
  status: string;
}

export interface PurchaseLog {
  dateReceived: string;
  refNumber: string;
  supplier: string;
  itemsSummary: string;
  receivingBranch: string;
  totalCost: number;
  receivedBy: string;
}

// ── Query keys ────────────────────────────────────────────────────────────────

export const SUPPLY_QUERY_KEYS = {
  SUPPLIERS: ['suppliers'],
  SUPPLIERS_ALL: ['suppliers', 'all'],
  DELIVERIES: ['deliveries'],
} as const;
