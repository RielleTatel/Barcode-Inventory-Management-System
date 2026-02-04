import api from "@/hooks/api";

export interface MenuItem {
  id: number;
  sku: string;
  name: string;
  menu_category: number;
  menu_category_name: string;
  price: string;
  is_available_cafe: boolean;
  recipe_count: number;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: number;
  name: string;
  menu_items_count: number;
}

export const fetchAllMenuItems = async (): Promise<MenuItem[]> => {
  const { data } = await api.get('/menus/items/');
  return data;
};

export const fetchMenuCategories = async (): Promise<MenuCategory[]> => {
  const { data } = await api.get('/menus/categories/');
  return data;
};

export const createMenuItem = async (menuItem: Partial<MenuItem>): Promise<MenuItem> => {
  const { data } = await api.post('/menus/items/', menuItem);
  return data;
};

export const updateMenuItem = async (id: number, updates: Partial<MenuItem>): Promise<MenuItem> => {
  const { data } = await api.patch(`/menus/items/${id}/`, updates);
  return data;
};

export const deleteMenuItem = async (id: number): Promise<void> => {
  await api.delete(`/menus/items/${id}/`);
}; 


