import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchMenuCategories } from "./api";
import { MENU_QUERY_KEYS } from ".";
import type { MenuItem } from ".";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const MenuItemEdit = ({ menuItem, onChange, formData }: MenuItemEditProps) => {
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: MENU_QUERY_KEYS.MENU_CATEGORIES,
    queryFn: fetchMenuCategories,
  });

  const handleChange = (field: keyof MenuItemEditFormData, value: string | boolean) => {
    onChange({
      ...formData,
      [field]: value,
    });
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
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Sales Category <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.menu_category}
            onValueChange={(value) => handleChange('menu_category', value)}
            disabled={categoriesLoading}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
