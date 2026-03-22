import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { ChevronDown, X, Package, UtensilsCrossed, Building2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchInventoryCategories, fetchBranches } from "../api";
import { fetchAllMenuItems } from "@/components/menus&Recipes/api";
import { INVENTORY_QUERY_KEYS, UOM_OPTIONS, type InventoryItem } from "..";
import { MENU_QUERY_KEYS } from "@/components/menus&Recipes";

export interface BranchStockEntry {
  branch_id: number;
  quantity: string;
  threshold: string;
}

export interface InventoryEditFormData {
  sku: string;
  name: string;
  category: number | null;
  category_name: string;
  uom: string;
  linked_menu_item: number | null;
  branch_stocks_write: BranchStockEntry[];
}

interface InventoryEditProps {
  inventoryItem?: InventoryItem;
  onChange: (data: InventoryEditFormData) => void;
  formData: InventoryEditFormData;
}

const InventoryEdit = ({ inventoryItem: _inventoryItem, onChange, formData }: InventoryEditProps) => {
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.INVENTORY_CATEGORIES,
    queryFn: fetchInventoryCategories,
  });

  const { data: menuItems = [], isLoading: menuItemsLoading } = useQuery({
    queryKey: MENU_QUERY_KEYS.MENU_ITEMS,
    queryFn: fetchAllMenuItems,
  });

  const { data: branches = [] } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.BRANCHES,
    queryFn: fetchBranches,
  });

  // Dropdown state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [menuSearchInput, setMenuSearchInput] = useState('');
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  const [showUomDropdown, setShowUomDropdown] = useState(false);
  const uomDropdownRef = useRef<HTMLDivElement>(null);

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(menuSearchInput.toLowerCase()) ||
    item.sku.toLowerCase().includes(menuSearchInput.toLowerCase())
  );

  const isPreparedItems = formData.category_name === 'Prepared Items';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node))
        setShowCategoryDropdown(false);
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target as Node))
        setShowMenuDropdown(false);
      if (uomDropdownRef.current && !uomDropdownRef.current.contains(event.target as Node))
        setShowUomDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (formData.linked_menu_item) {
      const selected = menuItems.find(item => item.id === formData.linked_menu_item);
      if (selected) setMenuSearchInput(selected.name);
    }
  }, [formData.linked_menu_item, menuItems]);

  const handleChange = (field: keyof InventoryEditFormData, value: string | number | null) => {
    onChange({ ...formData, [field]: value });
  };

  const handleCategorySelect = (categoryId: number, categoryName: string) => {
    onChange({
      ...formData,
      category: categoryId,
      category_name: categoryName,
      linked_menu_item: categoryName !== 'Prepared Items' ? null : formData.linked_menu_item,
    });
    setShowCategoryDropdown(false);
    if (categoryName !== 'Prepared Items') setMenuSearchInput('');
  };

  const handleMenuItemSelect = (menuItemId: number, menuItemName: string) => {
    onChange({ ...formData, linked_menu_item: menuItemId, name: menuItemName });
    setMenuSearchInput(menuItemName);
    setShowMenuDropdown(false);
  };

  const handleUomSelect = (uomValue: string) => {
    onChange({ ...formData, uom: uomValue });
    setShowUomDropdown(false);
  };

  const clearCategory = () => {
    onChange({ ...formData, category: null, category_name: '', linked_menu_item: null, name: '' });
    setMenuSearchInput('');
  };

  const clearMenuItem = () => {
    onChange({ ...formData, linked_menu_item: null, name: '' });
    setMenuSearchInput('');
  };

  // ── Branch stock helpers ──────────────────────────────────────────────────

  const branchStocks = formData.branch_stocks_write ?? [];

  const addBranchStock = (branchId: number) => {
    if (branchStocks.some(bs => bs.branch_id === branchId)) return;
    onChange({
      ...formData,
      branch_stocks_write: [...branchStocks, { branch_id: branchId, quantity: '0', threshold: '0' }],
    });
  };

  const removeBranchStock = (branchId: number) => {
    onChange({
      ...formData,
      branch_stocks_write: branchStocks.filter(bs => bs.branch_id !== branchId),
    });
  };

  const updateBranchStock = (branchId: number, field: 'quantity' | 'threshold', value: string) => {
    onChange({
      ...formData,
      branch_stocks_write: branchStocks.map(bs =>
        bs.branch_id === branchId ? { ...bs, [field]: value } : bs
      ),
    });
  };

  const availableBranches = branches.filter(b => !branchStocks.some(bs => bs.branch_id === b.id));

  const selectedUomLabel = UOM_OPTIONS.find(opt => opt.value === formData.uom)?.label || formData.uom;

  return (
    <div className="space-y-6">
      {/* Category Selection */}
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
                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); clearCategory(); }}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          {showCategoryDropdown && !categoriesLoading && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <div
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${formData.category_name === 'Raw Materials' ? 'bg-amber-50 border-l-4 border-amber-500' : 'hover:bg-gray-50'}`}
                onClick={(e) => { e.stopPropagation(); const cat = categories.find(c => c.name === 'Raw Materials'); handleCategorySelect(cat?.id || 1, 'Raw Materials'); }}
              >
                <Package className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-gray-900">Raw Materials</p>
                  <p className="text-xs text-gray-500">Ingredients and supplies for production</p>
                </div>
              </div>
              <div
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${formData.category_name === 'Prepared Items' ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'hover:bg-gray-50'}`}
                onClick={(e) => { e.stopPropagation(); const cat = categories.find(c => c.name === 'Prepared Items'); handleCategorySelect(cat?.id || 2, 'Prepared Items'); }}
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

      {/* Prepared Items — Link to Menu Item */}
      {isPreparedItems && (
        <div className="space-y-2 relative" ref={menuDropdownRef}>
          <label className="text-sm font-semibold text-gray-700">
            Link to Menu Item <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 -mt-1">Select the menu dish to link this inventory entry to</p>
          <div className="relative">
            <Input
              placeholder="Search menu items..."
              value={menuSearchInput}
              onChange={(e) => { setMenuSearchInput(e.target.value); setShowMenuDropdown(true); }}
              onFocus={() => setShowMenuDropdown(true)}
              className="h-12 pr-16"
              disabled={menuItemsLoading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {menuSearchInput && (
                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={clearMenuItem}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowMenuDropdown(!showMenuDropdown)}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {showMenuDropdown && !menuItemsLoading && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredMenuItems.length > 0 ? filteredMenuItems.map(item => (
                <div key={item.id}
                  className={`px-4 py-3 cursor-pointer transition-colors ${formData.linked_menu_item === item.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'hover:bg-gray-50'}`}
                  onClick={() => handleMenuItemSelect(item.id, item.name)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">₱{parseFloat(item.price).toFixed(2)}</span>
                  </div>
                </div>
              )) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  {menuSearchInput ? 'No matching menu items found' : 'No menu items available'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SKU and Item Name */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">SKU <span className="text-red-500">*</span></label>
          <Input
            placeholder={isPreparedItems ? "e.g., PI-0001" : "e.g., RM-0001"}
            value={formData.sku}
            onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
            className="h-12 font-mono"
          />
          <p className="text-xs text-gray-500">{isPreparedItems ? 'Use PI- prefix' : 'Use RM- prefix'}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Item Name <span className="text-red-500">*</span></label>
          <Input
            placeholder={isPreparedItems ? "Auto-filled from menu item" : "e.g., Chicken Breast"}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="h-12"
          />
        </div>
      </div>

      {/* Unit of Measure */}
      <div className="space-y-2 relative" ref={uomDropdownRef}>
        <label className="text-sm font-semibold text-gray-700">Unit of Measure <span className="text-red-500">*</span></label>
        <div
          className="flex items-center h-12 px-4 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => setShowUomDropdown(!showUomDropdown)}
        >
          <span className={formData.uom ? "text-gray-900 flex-1" : "text-gray-400 flex-1"}>
            {formData.uom ? selectedUomLabel : 'Select unit'}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
        {showUomDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {UOM_OPTIONS.map(option => (
              <div key={option.value}
                className={`px-4 py-2 cursor-pointer transition-colors ${formData.uom === option.value ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                onClick={() => handleUomSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Branch Stock Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <label className="text-sm font-semibold text-gray-700">Branch Stock Levels</label>
          </div>
          {availableBranches.length > 0 && (
            <div className="relative group">
              <Button type="button" variant="outline" size="sm" className="gap-1 text-xs">
                <Plus className="w-3 h-3" /> Add Branch
              </Button>
              <div className="absolute right-0 top-8 z-50 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px]">
                {availableBranches.map(b => (
                  <div key={b.id}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm transition-colors"
                    onMouseDown={(e) => { e.preventDefault(); addBranchStock(b.id); }}
                  >
                    {b.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Set the stock quantity and low-stock threshold for each branch where this item is available.
        </p>

        {branchStocks.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No branches assigned yet.</p>
            <p className="text-xs text-gray-400 mt-1">Use the "Add Branch" button to assign stock to a branch.</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2 text-left">Branch</th>
                  <th className="px-4 py-2 text-right">Quantity</th>
                  <th className="px-4 py-2 text-right">Low-Stock Alert</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {branchStocks.map(bs => {
                  const branch = branches.find(b => b.id === bs.branch_id);
                  if (!branch) return null;
                  return (
                    <tr key={bs.branch_id} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{branch.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{branch.branch_type.replace('_', ' ')}</p>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={bs.quantity}
                          onChange={(e) => updateBranchStock(bs.branch_id, 'quantity', e.target.value)}
                          className="h-9 text-right w-28 ml-auto"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end gap-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={bs.threshold}
                            onChange={(e) => updateBranchStock(bs.branch_id, 'threshold', e.target.value)}
                            className="h-9 text-right w-28"
                          />
                          <span className="text-xs text-gray-400 w-6">{formData.uom}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeBranchStock(bs.branch_id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Tip:</span> The "Low-Stock Alert" threshold is the minimum quantity for that branch before the system flags it as low. Each branch can have a different threshold.
          {isPreparedItems && (
            <span className="block mt-1">
              For <strong>Prepared Items</strong>, this inventory entry will be linked to the selected menu item for consumption tracking.
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default InventoryEdit;
