import api from "@/hooks/api";
import type { CateringEvent, CateringDish, KitchenSheet, CateringFormData } from ".";

// ── Dishes (menu items for the dropdown) ─────────────────────────────────────

export const fetchCateringDishes = async (): Promise<CateringDish[]> => {
  const { data } = await api.get('/catering/dishes/');
  return data;
};

// ── Catering Events ───────────────────────────────────────────────────────────

export const fetchCateringEvents = async (): Promise<CateringEvent[]> => {
  const { data } = await api.get('/catering/events/');
  return data;
};

export const fetchCateringEventById = async (id: number): Promise<CateringEvent> => {
  const { data } = await api.get(`/catering/events/${id}/`);
  return data;
};

export const createCateringEvent = async (payload: CateringFormData): Promise<CateringEvent> => {
  const { data } = await api.post('/catering/events/', payload);
  return data;
};

export const updateCateringEvent = async (
  id: number,
  payload: Partial<CateringFormData>
): Promise<CateringEvent> => {
  const { data } = await api.patch(`/catering/events/${id}/`, payload);
  return data;
};

export const deleteCateringEvent = async (id: number): Promise<void> => {
  await api.delete(`/catering/events/${id}/`);
};

export const updateCateringStatus = async (
  id: number,
  status: string
): Promise<CateringEvent> => {
  const { data } = await api.patch(`/catering/events/${id}/update_status/`, { status });
  return data;
};

export const fetchKitchenSheet = async (id: number): Promise<KitchenSheet> => {
  const { data } = await api.get(`/catering/events/${id}/kitchen_sheet/`);
  return data;
};
