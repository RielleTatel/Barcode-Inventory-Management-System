import api from "@/hooks/api";
import type { MenuItemFormData, MenuItem, Recipe, RecipeFormData } from ".";

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

// Recipe API functions
export const fetchAllRecipes = async (): Promise<Recipe[]> => {
  const { data } = await api.get('/menus/recipes/');
  return data;
};

export const fetchRecipeById = async (id: number): Promise<Recipe> => {
  const { data } = await api.get(`/menus/recipes/${id}/`);
  return data;
};

export const fetchRecipeByMenuItemId = async (menuItemId: number): Promise<Recipe> => {
  const { data } = await api.get(`/menus/recipes/menu-item/${menuItemId}/`);
  return data;
};

export const createRecipe = async (recipe: RecipeFormData): Promise<Recipe> => {
  const { data } = await api.post('/menus/recipes/', recipe);
  return data;
};

export const updateRecipe = async (id: number, updates: Partial<RecipeFormData>): Promise<Recipe> => {
  const { data } = await api.patch(`/menus/recipes/${id}/`, updates);
  return data;
};

export const deleteRecipe = async (id: number): Promise<void> => {
  await api.delete(`/menus/recipes/${id}/`);
};
