import api from "@/hooks/api";
import type { Supplier, SupplierFormData, Delivery, ReceivePayload } from "./supplier-types";

// ── Suppliers ─────────────────────────────────────────────────────────────────

export const fetchSuppliers = async (includeArchived = false): Promise<Supplier[]> => {
  const { data } = await api.get(`/supply/suppliers/${includeArchived ? '?all=1' : ''}`);
  return data;
};

export const fetchSupplierById = async (id: number): Promise<Supplier> => {
  const { data } = await api.get(`/supply/suppliers/${id}/`);
  return data;
};

export const createSupplier = async (payload: SupplierFormData): Promise<Supplier> => {
  const { data } = await api.post('/supply/suppliers/', payload);
  return data;
};

export const updateSupplier = async (id: number, payload: Partial<SupplierFormData>): Promise<Supplier> => {
  const { data } = await api.patch(`/supply/suppliers/${id}/`, payload);
  return data;
};

export const archiveSupplier = async (id: number): Promise<Supplier> => {
  const { data } = await api.patch(`/supply/suppliers/${id}/archive/`);
  return data;
};

export const restoreSupplier = async (id: number): Promise<Supplier> => {
  const { data } = await api.patch(`/supply/suppliers/${id}/restore/`);
  return data;
};

// ── Deliveries / Purchase History ─────────────────────────────────────────────

export interface DeliveryFilters {
  supplier?: number | string;
  branch?: number | string;
  date_from?: string;
  date_to?: string;
}

export const fetchDeliveries = async (filters?: DeliveryFilters): Promise<Delivery[]> => {
  const params = new URLSearchParams();
  if (filters?.supplier) params.set('supplier', String(filters.supplier));
  if (filters?.branch) params.set('branch', String(filters.branch));
  if (filters?.date_from) params.set('date_from', filters.date_from);
  if (filters?.date_to) params.set('date_to', filters.date_to);
  const query = params.toString();
  const { data } = await api.get(`/supply/deliveries/${query ? `?${query}` : ''}`);
  return data;
};

export const fetchDeliveryById = async (id: number): Promise<Delivery> => {
  const { data } = await api.get(`/supply/deliveries/${id}/`);
  return data;
};

export const receiveDelivery = async (
  payload: ReceivePayload
): Promise<{ message: string; delivery: Delivery }> => {
  const { data } = await api.post('/supply/deliveries/receive/', payload);
  return data;
};
