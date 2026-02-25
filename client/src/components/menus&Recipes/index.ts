export interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface MenuItemFormData {
  itemName: string;
  sku: string;
  salesCategory: string;
  servingType: string;
  sellingPrice: string;
  estimatedCost: string;
  rawIngredients: string[];
  availability: {
    restaurantBranch1: boolean;
    restaurantBranch2: boolean;
    restoCafe: boolean;
  };
}

// API response interface
export interface MenuItem {
  id: number;
  name: string;
  sku: string;
  menu_category_name: string;
  price: string;
  is_available_cafe: boolean;
}

// Recipe interfaces
export interface RecipeIngredient {
  id: number;
  ingredient_name: string;
  quantity: string;
  unit: string;
}

export interface Recipe {
  id: number;
  menu_item_id: number;
  menu_item_name: string;
  menu_item_sku: string;
  ingredients: RecipeIngredient[];
  total_cost?: string;
}

export interface RecipeFormData {
  menu_item_id: number;
  ingredients: {
    ingredient_name: string;
    quantity: string;
    unit: string;
  }[];
}

// Query keys for React Query
export const MENU_QUERY_KEYS = {
  MENU_ITEMS: ['menuItems'],
  MENU_CATEGORIES: ['menuCategories'],
  RECIPES: ['recipes'],
} as const;