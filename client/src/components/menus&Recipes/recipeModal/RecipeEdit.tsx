import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { fetchAllMenuItems } from "../api";
import { MENU_QUERY_KEYS } from "..";
import type { Recipe } from "..";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface RecipeEditFormData {
  menu_item_id: string;
  ingredients: {
    id?: number;
    ingredient_name: string;
    quantity: string;
    unit: string;
  }[];
}

interface RecipeEditProps {
  recipe?: Recipe; // undefined for add mode, present for edit mode
  onChange: (data: RecipeEditFormData) => void;
  formData: RecipeEditFormData;
}

const RecipeEdit = ({ recipe, onChange, formData }: RecipeEditProps) => {
  const { data: menuItems = [], isLoading: menuItemsLoading } = useQuery({
    queryKey: MENU_QUERY_KEYS.MENU_ITEMS,
    queryFn: fetchAllMenuItems,
  });

  const handleChange = (field: keyof RecipeEditFormData, value: any) => {
    onChange({
      ...formData,
      [field]: value,
    });
  };

  const handleIngredientChange = (index: number, field: string, value: string) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value,
    };
    handleChange('ingredients', updatedIngredients);
  };

  const addIngredient = () => {
    handleChange('ingredients', [
      ...formData.ingredients,
      { ingredient_name: '', quantity: '', unit: '' },
    ]);
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = formData.ingredients.filter((_, i) => i !== index);
    handleChange('ingredients', updatedIngredients);
  };

  const selectedMenuItem = menuItems.find(
    item => item.id.toString() === formData.menu_item_id
  );

  return (
    <div className="space-y-6">
      {/* Main Information Card */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-5">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Menu Item *
            </label>
            <Select 
              value={formData.menu_item_id} 
              onValueChange={(value) => handleChange('menu_item_id', value)}
              disabled={!!recipe} // Disable when editing
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a menu item" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Menu Items</SelectLabel>
                  {menuItemsLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    menuItems.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.sku} - {item.name}
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {selectedMenuItem && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Menu SKU
              </label>
              <Input 
                value={selectedMenuItem.sku} 
                disabled
                className="bg-gray-100"
              />
            </div>
          )}
        </div>
      </div>

      {/* Ingredients Card */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Recipe Ingredients
          </h3>
          <Button 
            type="button" 
            onClick={addIngredient}
            size="sm"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Ingredient
          </Button>
        </div>

        {formData.ingredients.length > 0 ? (
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader className="bg-[#F9FAFB]">
                <TableRow>
                  <TableHead className="text-bold text-[#94979F]">Ingredient Name</TableHead>
                  <TableHead className="text-bold text-[#94979F]">Quantity</TableHead>
                  <TableHead className="text-bold text-[#94979F]">Unit</TableHead>
                  <TableHead className="text-bold text-[#94979F] w-20">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.ingredients.map((ingredient, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={ingredient.ingredient_name}
                        onChange={(e) => handleIngredientChange(index, 'ingredient_name', e.target.value)}
                        placeholder="e.g., Flour, Sugar"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={ingredient.quantity}
                        onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ingredient.unit}
                        onValueChange={(value) => handleIngredientChange(index, 'unit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Units</SelectLabel>
                            <SelectItem value="kg">kg (Kilograms)</SelectItem>
                            <SelectItem value="g">g (Grams)</SelectItem>
                            <SelectItem value="L">L (Liters)</SelectItem>
                            <SelectItem value="mL">mL (Milliliters)</SelectItem>
                            <SelectItem value="pcs">pcs (Pieces)</SelectItem>
                            <SelectItem value="cups">cups</SelectItem>
                            <SelectItem value="tbsp">tbsp (Tablespoons)</SelectItem>
                            <SelectItem value="tsp">tsp (Teaspoons)</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-white rounded-md border">
            No ingredients added yet. Click "Add Ingredient" to start.
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeEdit;
