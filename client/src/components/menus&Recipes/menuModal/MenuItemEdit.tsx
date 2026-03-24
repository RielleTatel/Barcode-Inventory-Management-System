import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, X } from "lucide-react";
import { fetchMenuCategories } from "../api";
import { MENU_QUERY_KEYS } from "..";
import type { MenuItem } from "..";

export interface MenuItemEditFormData {
  sku: string;
  name: string;
  menu_category: string;
  price: string;
  is_available_cafe: boolean;
}

interface MenuItemEditProps {
  menuItem?: MenuItem; // undefined for add mode, present for edit mode
  onChange: (data: MenuItemEditFormData) => void;
  formData: MenuItemEditFormData;
}

const MenuItemEdit = ({ onChange, formData }: MenuItemEditProps) => {
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: MENU_QUERY_KEYS.MENU_CATEGORIES,
    queryFn: fetchMenuCategories,
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Update filtered categories when input changes
  useEffect(() => {
    if (categoryInput) {
      const filtered = categories.filter(cat => 
        cat.name.toLowerCase().includes(categoryInput.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [categoryInput, categories]);

  // Set initial category input based on formData
  useEffect(() => {
    if (formData.menu_category) {
      const category = categories.find(cat => cat.id.toString() === formData.menu_category);
      if (category) {
        setCategoryInput(category.name);
      }
    }
  }, [formData.menu_category, categories]);

  const handleChange = (field: keyof MenuItemEditFormData, value: string | boolean) => {
    onChange({
      ...formData,
      [field]: value,
    });
  };

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    handleChange('menu_category', categoryId);
    setCategoryInput(categoryName);
    setShowDropdown(false);
  };

  const handleCategoryInputChange = (value: string) => {
    setCategoryInput(value);
    setShowDropdown(true);
    // If typing, clear the selected category ID (allows custom input)
    if (!categories.find(cat => cat.name.toLowerCase() === value.toLowerCase())) {
      handleChange('menu_category', value); // Store custom category name
    }
  };

  const clearCategory = () => {
    setCategoryInput('');
    handleChange('menu_category', '');
    setShowDropdown(false);
  };

  return (
    <div className="space-y-6">
      {/* Row 1: Item Name and SKU */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Menu Item Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. Beef Curry Platter"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Menu SKU <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="MN-XXXX"
            value={formData.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
            className="h-12"
          />
        </div>
      </div>

      {/* Row 2: Category and Price */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2 relative" ref={dropdownRef}>
          <label className="text-sm font-semibold text-gray-700">
            Sales Category <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              placeholder="Select a category"
              value={categoryInput}
              onChange={(e) => handleCategoryInputChange(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              className="h-12 pr-20"
              disabled={categoriesLoading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {categoryInput && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={clearCategory}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Dropdown List */}
          {showDropdown && !categoriesLoading && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleCategorySelect(category.id.toString(), category.name)}
                  >
                    {category.name}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  {categoryInput ? (
                    <>
                      No matching categories. Press Enter to use <strong>"{categoryInput}"</strong> as custom category.
                    </>
                  ) : (
                    'No categories available'
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Selling Price (₱) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => handleChange('price', e.target.value)}
            className="h-12"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      {/* Row 3: Availability */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700">
          Menu Availability
        </label>
        <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="cafe-availability"
              checked={formData.is_available_cafe}
              onCheckedChange={(checked) => handleChange('is_available_cafe', checked as boolean)}
            />
            <label
              htmlFor="cafe-availability"
              className="text-base font-medium cursor-pointer"
            >
              Available in Cafe
            </label>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Note:</span> All fields marked with{" "}
          <span className="text-red-500">*</span> are required.
        </p>
      </div>
    </div>
  );
};

export default MenuItemEdit;
