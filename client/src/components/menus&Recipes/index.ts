export interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MenuItemFormData) => void;
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

// Query keys for React Query
export const MENU_QUERY_KEYS = {
  MENU_ITEMS: ['menuItems'],
  MENU_CATEGORIES: ['menuCategories'],
} as const;