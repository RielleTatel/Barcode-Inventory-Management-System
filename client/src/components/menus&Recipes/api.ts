import api from "@/hooks/api";
import type { MenuItemFormData, MenuItem, Recipe, BackendRecipeRow } from ".";

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
// Backend returns flat rows; group by menu_item so the frontend works with one Recipe per menu item
export const fetchAllRecipes = async (): Promise<Recipe[]> => {
  const { data }: { data: BackendRecipeRow[] } = await api.get('/menus/recipes/');

  const grouped = new Map<number, Recipe>();

  for (const row of data) {
    if (!grouped.has(row.menu_item)) {
      grouped.set(row.menu_item, {
        id: row.menu_item,
        menu_item_id: row.menu_item,
        menu_item_name: row.menu_item_name,
        menu_item_sku: row.menu_item_sku,
        ingredients: [],
      });
    }
    grouped.get(row.menu_item)!.ingredients.push({
      id: row.id,
      ingredient_name: row.ingredient_name,
      quantity: row.quantity_required,
      unit: row.unit,
    });
  }

  return Array.from(grouped.values());
};

// Bulk-create all recipe rows for a menu item in one call
export const createRecipe = async (payload: {
  menu_item_id: number;
  ingredients: { ingredient_name: string; unit: string; quantity: string }[];
}): Promise<void> => {
  const recipes = payload.ingredients.map((ing) => ({
    menu_item: payload.menu_item_id,
    ingredient_name: ing.ingredient_name,
    unit: ing.unit,
    quantity_required: ing.quantity,
  }));
  await api.post('/menus/recipes/bulk_create/', { recipes });
};

// Bulk-update: replaces all recipe rows for a menu item
export const updateRecipe = async (payload: {
  menu_item_id: number;
  ingredients: { ingredient_name: string; unit: string; quantity: string }[];
}): Promise<void> => {
  const recipes = payload.ingredients.map((ing) => ({
    ingredient_name: ing.ingredient_name,
    unit: ing.unit,
    quantity_required: ing.quantity,
  }));
  await api.put('/menus/recipes/bulk_update/', {
    menu_item: payload.menu_item_id,
    recipes,
  });
};

// Delete all recipe rows for a given menu item
export const deleteRecipe = async (menuItemId: number): Promise<void> => {
  const { data }: { data: BackendRecipeRow[] } = await api.get(
    `/menus/recipes/?menu_item=${menuItemId}`
  );
  const ids = data.map((r) => r.id);
  if (ids.length > 0) {
    await api.delete('/menus/recipes/bulk_delete/', { data: { recipe_ids: ids } });
  }
};
