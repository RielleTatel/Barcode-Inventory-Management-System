import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { ChevronDown, X, Package, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchInventoryCategories } from "../api";
import { fetchAllMenuItems } from "@/components/menus&Recipes/api";
import { INVENTORY_QUERY_KEYS, UOM_OPTIONS, type InventoryItem } from "..";
import { MENU_QUERY_KEYS } from "@/components/menus&Recipes";

export interface InventoryEditFormData {
  sku: string;
  name: string;
  category: number | null;
  category_name: string;
  uom: string;
  current_stock: string;
  min_stock_level: string;
  linked_menu_item: number | null;
}

interface InventoryEditProps {
  inventoryItem?: InventoryItem;
  onChange: (data: InventoryEditFormData) => void;
  formData: InventoryEditFormData;
}

const InventoryEdit = ({ inventoryItem: _inventoryItem, onChange, formData }: InventoryEditProps) => {
  // Fetch categories from API
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.INVENTORY_CATEGORIES,
    queryFn: fetchInventoryCategories,
  });

  // Fetch menu items for "Prepared Items" category
  const { data: menuItems = [], isLoading: menuItemsLoading } = useQuery({
    queryKey: MENU_QUERY_KEYS.MENU_ITEMS,
    queryFn: fetchAllMenuItems,
  });

  // Category dropdown state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Menu item dropdown state
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [menuSearchInput, setMenuSearchInput] = useState('');
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  // UOM dropdown state
  const [showUomDropdown, setShowUomDropdown] = useState(false);
  const uomDropdownRef = useRef<HTMLDivElement>(null);

  // Filter menu items based on search
  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(menuSearchInput.toLowerCase()) ||
    item.sku.toLowerCase().includes(menuSearchInput.toLowerCase())
  );

  // Check if selected category is "Prepared Items"
  const isPreparedItems = formData.category_name === 'Prepared Items';

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target as Node)) {
        setShowMenuDropdown(false);
      }
      if (uomDropdownRef.current && !uomDropdownRef.current.contains(event.target as Node)) {
        setShowUomDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update menu search input when a menu item is selected
  useEffect(() => {
    if (formData.linked_menu_item) {
      const selectedItem = menuItems.find(item => item.id === formData.linked_menu_item);
      if (selectedItem) {
        setMenuSearchInput(selectedItem.name);
      }
    }
  }, [formData.linked_menu_item, menuItems]);

  const handleChange = (field: keyof InventoryEditFormData, value: string | number | boolean | null) => {
    onChange({
      ...formData,
      [field]: value,
    });
  };

  const handleCategorySelect = (categoryId: number, categoryName: string) => {
    console.log('Category selected:', { categoryId, categoryName });
    onChange({
      ...formData,
      category: categoryId,
      category_name: categoryName,
      // Reset linked menu item if switching away from Prepared Items
      linked_menu_item: categoryName !== 'Prepared Items' ? null : formData.linked_menu_item,
    });
    setShowCategoryDropdown(false);

    // Reset menu search input if switching away from Prepared Items
    if (categoryName !== 'Prepared Items') {
      setMenuSearchInput('');
    }
  };

  const handleMenuItemSelect = (menuItemId: number, menuItemName: string) => {
    onChange({
      ...formData,
      linked_menu_item: menuItemId,
      name: menuItemName, // Auto-fill item name from menu item
    });
    setMenuSearchInput(menuItemName);
    setShowMenuDropdown(false);
  };

  const handleUomSelect = (uomValue: string) => {
    onChange({
      ...formData,
      uom: uomValue,
    });
    setShowUomDropdown(false);
  };

  const clearCategory = () => {
    onChange({
      ...formData,
      category: null,
      category_name: '',
      linked_menu_item: null,
      name: '',
    });
    setMenuSearchInput('');
  };

  const clearMenuItem = () => {
    onChange({
      ...formData,
      linked_menu_item: null,
      name: '',
    });
    setMenuSearchInput('');
  };

  // Get the UOM label for display
  const selectedUomLabel = UOM_OPTIONS.find(opt => opt.value === formData.uom)?.label || formData.uom;

  return (
    <div className="space-y-6">
      {/* Row 1: Category Selection */}
      <div className="space-y-2 relative" ref={categoryDropdownRef}>
        <label className="text-sm font-semibold text-gray-700">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div
            className="flex items-center h-12 px-4 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            {formData.category_name ? (
              <div className="flex items-center gap-2 flex-1">
                {formData.category_name === 'Raw Materials' ? (
                  <Package className="w-5 h-5 text-amber-600" />
                ) : (
                  <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
                )}
                <span className="font-medium">{formData.category_name}</span>
              </div>
            ) : (
              <span className="text-gray-400 flex-1">Select a category</span>
            )}
            <div className="flex items-center gap-1">
              {formData.category_name && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearCategory();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Category Dropdown */}
          {showCategoryDropdown && !categoriesLoading && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {/* Raw Materials Option */}
              <div
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  formData.category_name === 'Raw Materials'
                    ? 'bg-amber-50 border-l-4 border-amber-500'
                    : 'hover:bg-gray-50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  // Find or use default category ID for Raw Materials
                  const rawMaterialsCat = categories.find(c => c.name === 'Raw Materials');
                  handleCategorySelect(rawMaterialsCat?.id || 1, 'Raw Materials');
                }}
              >
                <Package className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-gray-900">Raw Materials</p>
                  <p className="text-xs text-gray-500">Ingredients and supplies for production</p>
                </div>
              </div>

              {/* Prepared Items Option */}
              <div
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  formData.category_name === 'Prepared Items'
                    ? 'bg-emerald-50 border-l-4 border-emerald-500'
                    : 'hover:bg-gray-50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  const preparedItemsCat = categories.find(c => c.name === 'Prepared Items');
                  handleCategorySelect(preparedItemsCat?.id || 2, 'Prepared Items');
                }}
              >
                <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-900">Prepared Items</p>
                  <p className="text-xs text-gray-500">Menu items ready for serving</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conditional: Menu Item Selection (only for Prepared Items) */}
      {isPreparedItems && (
        <div className="space-y-2 relative" ref={menuDropdownRef}>
          <label className="text-sm font-semibold text-gray-700">
            Link to Menu Item <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 -mt-1">
            Select the menu dish to link this inventory entry to
          </p>
          <div className="relative">
            <Input
              placeholder="Search menu items..."
              value={menuSearchInput}
              onChange={(e) => {
                setMenuSearchInput(e.target.value);
                setShowMenuDropdown(true);
              }}
              onFocus={() => setShowMenuDropdown(true)}
              className="h-12 pr-16"
              disabled={menuItemsLoading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {menuSearchInput && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={clearMenuItem}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Menu Items Dropdown */}
          {showMenuDropdown && !menuItemsLoading && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredMenuItems.length > 0 ? (
                filteredMenuItems.map((item) => (
                  <div
                    key={item.id}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      formData.linked_menu_item === item.id
                        ? 'bg-emerald-50 border-l-4 border-emerald-500'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleMenuItemSelect(item.id, item.name)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                      </div>
                      <span className="text-sm font-semibold text-emerald-600">
                        ₱{parseFloat(item.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  {menuSearchInput ? 'No matching menu items found' : 'No menu items available'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Row 2: SKU and Item Name */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            SKU <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder={isPreparedItems ? "e.g., PI-0001" : "e.g., RM-0001"}
            value={formData.sku}
            onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
            className="h-12 font-mono"
          />
          <p className="text-xs text-gray-500">
            {isPreparedItems ? 'Use PI- prefix for prepared items' : 'Use RM- prefix for raw materials'}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Item Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder={isPreparedItems ? "Auto-filled from menu item" : "e.g., Chicken Breast"}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="h-12"
          />
          {isPreparedItems && (
            <p className="text-xs text-gray-500">
              Auto-filled from linked menu item, but can be edited
            </p>
          )}
        </div>
      </div>

      {/* Row 3: Unit of Measure */}
      <div className="space-y-2 relative" ref={uomDropdownRef}>
        <label className="text-sm font-semibold text-gray-700">
          Unit of Measure <span className="text-red-500">*</span>
        </label>
        <div
          className="flex items-center h-12 px-4 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => setShowUomDropdown(!showUomDropdown)}
        >
          <span className={formData.uom ? "text-gray-900 flex-1" : "text-gray-400 flex-1"}>
            {formData.uom ? selectedUomLabel : 'Select unit'}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>

        {/* UOM Dropdown */}
        {showUomDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {UOM_OPTIONS.map((option) => (
              <div
                key={option.value}
                className={`px-4 py-2 cursor-pointer transition-colors ${
                  formData.uom === option.value
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleUomSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Row 4: Current Stock and Minimum Stock Level */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Current Stock <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="e.g., 100"
            value={formData.current_stock}
            onChange={(e) => handleChange('current_stock', e.target.value)}
            className="h-12"
            step="0.01"
            min="0"
          />
          <p className="text-xs text-gray-500">
            How many units you currently have on hand
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Minimum Stock Level <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="e.g., 10"
            value={formData.min_stock_level}
            onChange={(e) => handleChange('min_stock_level', e.target.value)}
            className="h-12"
            step="0.01"
            min="0"
          />
          <p className="text-xs text-gray-500">
            Alert will show when stock falls below this level
          </p>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Note:</span> All fields marked with{" "}
          <span className="text-red-500">*</span> are required.
          {isPreparedItems && (
            <span className="block mt-1">
              For <strong>Prepared Items</strong>, the inventory entry will be linked to the selected menu item for tracking.
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default InventoryEdit;

