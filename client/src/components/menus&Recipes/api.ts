import api from "@/hooks/api";
import type { MenuItemFormData, MenuItem } from ".";

export interface MenuCategory {
  id: number;
  name: string;
  menu_items_count: number;
}

export const fetchAllMenuItems = async (): Promise<MenuItem[]> => {
  const { data } = await api.get('/menus/items/');
  return data;
};

export const fetchMenuItemById = async (id: number): Promise<MenuItem> => {
  const { data } = await api.get(`/menus/items/${id}/`);
  return data;
};

export const fetchMenuCategories = async (): Promise<MenuCategory[]> => {
  const { data } = await api.get('/menus/categories/');
  return data;
};

export const createMenuItem = async (menuItem: Partial<MenuItemFormData>): Promise<MenuItemFormData> => {
  const { data } = await api.post('/menus/items/', menuItem);
  return data;
};

export const updateMenuItem = async (id: number, updates: Partial<MenuItemFormData>): Promise<MenuItemFormData> => {
  const { data } = await api.patch(`/menus/items/${id}/`, updates);
  return data;
};

export const deleteMenuItem = async (id: number): Promise<void> => {
  await api.delete(`/menus/items/${id}/`);
}; 


