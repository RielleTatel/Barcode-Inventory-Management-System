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