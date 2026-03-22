import type { LucideIcon } from 'lucide-react';

// ── Legacy (kept for KpiCards component) ─────────────────────────────────────
export interface InventoryKpiData {
  lowStock: number;
  totalItems: number;
  preparedFood: number;
  pendingTransfers: number;
}

export type KpiConfig = {
  title: string;
  subtitle: string;
  description: string;
  iconColor: string;
  dataKey: keyof InventoryKpiData;
  icon?: LucideIcon;
};

export type KpiCardProps = {
  title: string;
  iconColor: string;
  subtitle: string;
  description: string;
  value: number;
  icon?: LucideIcon;
};

// ── Branch dashboard ──────────────────────────────────────────────────────────

export interface LowStockItem {
  item_id: number;
  sku: string;
  name: string;
  category: string;
  uom: string;
  quantity: number;
  threshold: number;
  status: string;
}

export interface PendingTransferAlert {
  id: number;
  direction: 'in' | 'out';
  item: string;
  quantity: number;
  uom: string;
  other_branch: string;
  status: string;
  date: string;
}

export interface DeliveryAlert {
  id: number;
  supplier: string;
  dr_number: string;
  received_date: string;
  item_count: number;
  total_cost: number;
}

export interface BranchDashboardData {
  branch: {
    id: number;
    name: string;
    branch_type: string;
    address: string;
  };
  total_items: number;
  items_in_stock: number;
  out_of_stock_count: number;
  low_stock_count: number;
  prepared_food_count: number;
  pending_transfers_in: number;
  pending_transfers_out: number;
  low_stock_items: LowStockItem[];
  pending_transfers: PendingTransferAlert[];
  recent_deliveries: DeliveryAlert[];
}

// ── Global dashboard ──────────────────────────────────────────────────────────

export type BranchHealth = 'healthy' | 'warning' | 'critical';

export interface BranchSummary {
  id: number;
  name: string;
  branch_type: string;
  total_items: number;
  low_stock_count: number;
  out_of_stock_count: number;
  pending_in: number;
  pending_out: number;
  health: BranchHealth;
}

export interface CriticalItem {
  sku: string;
  name: string;
  branch: string;
  quantity: number;
  threshold: number;
  uom: string;
}

export interface GlobalDelivery {
  id: number;
  supplier: string;
  branch: string;
  dr_number: string;
  received_date: string;
  item_count: number;
  total_cost: number;
}

export interface GlobalDashboardData {
  totals: {
    total_items: number;
    low_stock_count: number;
    out_of_stock_count: number;
    pending_transfers: number;
  };
  branch_breakdown: BranchSummary[];
  critical_items: CriticalItem[];
  recent_deliveries: GlobalDelivery[];
}

// ── Query keys ────────────────────────────────────────────────────────────────

export const DASHBOARD_QUERY_KEYS = {
  GLOBAL: ['dashboard', 'global'],
  BRANCH: (id: number | string) => ['dashboard', 'branch', String(id)],
} as const;
