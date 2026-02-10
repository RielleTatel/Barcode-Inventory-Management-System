import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { createMenuItem, fetchMenuCategories } from "./api";
import type { AddMenuItemModalProps, MenuItemFormData } from ".";import { MENU_QUERY_KEYS } from ".";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; 
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; 

const AddMenuItemModal = ({ isOpen, onClose }: AddMenuItemModalProps) => {
  const [formData, setFormData] = useState<MenuItemFormData>({
    itemName: "",
    sku: "",
    salesCategory: "",
    servingType: "",
    sellingPrice: "0.00",
    estimatedCost: "",
    rawIngredients: [],
    availability: {
      restaurantBranch1: false,
      restaurantBranch2: false,
      restoCafe: false,
    },
  });

  const [selectedIngredient, setSelectedIngredient] = useState(""); 

  const { data: categories = [] } = useQuery({
    queryKey: MENU_QUERY_KEYS.MENU_CATEGORIES,
    queryFn: fetchMenuCategories,
  });

  const availableIngredients = [
    { id: "ING-001", name: "Beef Chuck" },
    { id: "ING-002", name: "Onions" },
    { id: "ING-003", name: "Garlic" },
    { id: "ING-004", name: "Tomatoes" },
    { id: "ING-005", name: "Potatoes" },
    { id: "ING-006", name: "Carrots" },
    { id: "ING-007", name: "Rice" },
    { id: "ING-008", name: "Soy Sauce" },
    { id: "ING-009", name: "Cooking Oil" },
    { id: "ING-010", name: "Salt" },
  ];

  const handleAddIngredient = (ingredientId: string) => {
    if (ingredientId && !formData.rawIngredients.includes(ingredientId)) {
      setFormData({
        ...formData,
        rawIngredients: [...formData.rawIngredients, ingredientId],
      });
      setSelectedIngredient("");
    }
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setFormData({
      ...formData,
      rawIngredients: formData.rawIngredients.filter(id => id !== ingredientId),
    });
  };

  const handleSubmit = async () => {

    if (!formData.sku.trim()) {
      alert("SKU is required");
      return;
    }
    if (!formData.itemName.trim()) {
      alert("Item name is required");
      return;
    }
    if (!formData.salesCategory) {
      alert("Please select a category");
      return;
    }
    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0) {
      alert("Valid selling price is required");
      return;
    }

    try {
      const payload = {
        sku: formData.sku.trim(),
        name: formData.itemName.trim(),
        menu_category: Number(formData.salesCategory), 
        price: Number(formData.sellingPrice),
        is_available_cafe: formData.availability.restoCafe,
      };

      const newItem = await createMenuItem(payload);
      
      onClose();
    } catch (error: any) {
      let errorMessages: string[] = ["Failed to create menu item:"];
      const errorMessage = errorMessages.join("\n");
      alert(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <span>🍽️</span>
            Add New Menu Item
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Row 1: Item Name and SKU */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Menu Item Name
              </label>
              <Input
                placeholder="e.g. Beef Curry Platter"
                value={formData.itemName}
                onChange={(e) =>
                  setFormData({ ...formData, itemName: e.target.value })
                }
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Menu SKU
              </label>
              <Input
                placeholder="MN-XXXX"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="h-12"
              />
            </div>
          </div>

          {/* Row 2: Sales Category and Serving Type */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Sales Category *
              </label>
              <Select
                value={formData.salesCategory}
                onValueChange={(value) =>
                  setFormData({ ...formData, salesCategory: value })
                }
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
                Serving Type
              </label>
              <Select
                value={formData.servingType}
                onValueChange={(value) =>
                  setFormData({ ...formData, servingType: value })
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Single Serving" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="single-serving">Single Serving</SelectItem>
                    <SelectItem value="family-size">Family Size</SelectItem>
                    <SelectItem value="bulk">Bulk</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Selling Price and Est. Cost Price */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Selling Price (₱)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.sellingPrice}
                onChange={(e) =>
                  setFormData({ ...formData, sellingPrice: e.target.value })
                }
                className="h-12"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Est. Cost Price (₱)
              </label>
              <Input
                type="number"
                placeholder="Optional"
                value={formData.estimatedCost}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedCost: e.target.value })
                }
                className="h-12"
                step="0.01"
              />
            </div>
          </div>

          {/* Raw Ingredients Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">
              Raw Ingredients (Recipe Components)
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Select
                  value={selectedIngredient}
                  onValueChange={(value) => {
                    setSelectedIngredient(value);
                    handleAddIngredient(value);
                  }}
                >
                  <SelectTrigger className="h-12 flex-1">
                    <SelectValue placeholder="Select ingredients to add..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {availableIngredients
                        .filter(ing => !formData.rawIngredients.includes(ing.id))
                        .map((ingredient) => (
                          <SelectItem key={ingredient.id} value={ingredient.id}>
                            {ingredient.name} ({ingredient.id})
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Selected Ingredients Display */}
              {formData.rawIngredients.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-2">Selected Ingredients:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.rawIngredients.map((ingredientId) => {
                      const ingredient = availableIngredients.find(ing => ing.id === ingredientId);
                      return (
                        <Badge
                          key={ingredientId}
                          variant="secondary"
                          className="pl-3 pr-2 py-1 text-sm flex items-center gap-2"
                        >
                          {ingredient?.name || ingredientId}
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(ingredientId)}
                            className="hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu Availability Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">
              Menu Availability (Where is this sold?)
            </label>
            <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="branch1"
                  checked={formData.availability.restaurantBranch1}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      availability: {
                        ...formData.availability,
                        restaurantBranch1: checked as boolean,
                      },
                    })
                  }
                />
                <label
                  htmlFor="branch1"
                  className="text-base font-medium cursor-pointer"
                >
                  Restaurant Branch 1
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="branch2"
                  checked={formData.availability.restaurantBranch2}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      availability: {
                        ...formData.availability,
                        restaurantBranch2: checked as boolean,
                      },
                    })
                  }
                />
                <label
                  htmlFor="branch2"
                  className="text-base font-medium cursor-pointer"
                >
                  Restaurant Branch 2
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="cafe"
                  checked={formData.availability.restoCafe}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      availability: {
                        ...formData.availability,
                        restoCafe: checked as boolean,
                      },
                    })
                  }
                />
                <label
                  htmlFor="cafe"
                  className="text-base font-medium cursor-pointer"
                >
                  Resto Café
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="px-8">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-8 bg-green-600 hover:bg-green-700"
          >
            Save & Setup Recipe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMenuItemModal;
