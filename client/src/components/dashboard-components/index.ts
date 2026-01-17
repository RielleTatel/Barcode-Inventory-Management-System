import type { LucideIcon } from 'lucide-react';

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