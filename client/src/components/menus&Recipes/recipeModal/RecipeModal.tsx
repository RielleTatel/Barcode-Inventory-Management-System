import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RecipeView from "./RecipeView";
import RecipeEdit, { type RecipeEditFormData } from "./RecipeEdit";
import ModalActions from "@/components/ui/modal/ModalActions";
import { createRecipe, updateRecipe, deleteRecipe } from "../api";
import { MENU_QUERY_KEYS } from "..";
import type { Recipe } from "..";

export type ModalMode = 'view' | 'edit' | 'add';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  recipe?: Recipe; 
}

const RecipeModal = ({ isOpen, onClose, mode, recipe }: RecipeModalProps) => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<RecipeEditFormData>({
    menu_item_id: '',
    ingredients: [],
  });

  // Populate form when editing or viewing
  useEffect(() => {
    if (mode === 'edit' && recipe) {
      setFormData({
        menu_item_id: recipe.menu_item_id.toString(),
        ingredients: recipe.ingredients.map(ing => ({
          id: ing.id,
          ingredient_name: ing.ingredient_name,
          quantity: ing.quantity,
          unit: ing.unit,
        })),
      });
    } else if (mode === 'add') {
      // Reset form for add mode
      setFormData({
        menu_item_id: '',
        ingredients: [],
      });
    }
  }, [mode, recipe, isOpen]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.RECIPES });
      alert("Recipe created successfully");
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to create recipe");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateRecipe(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.RECIPES });
      alert("Recipe updated successfully");
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to update recipe");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.RECIPES });
      alert("Recipe deleted successfully");
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to delete recipe");
    },
  });

  const handleSave = () => {
    // Validation
    if (!formData.menu_item_id) {
      alert("Please select a menu item");
      return;
    }
    if (formData.ingredients.length === 0) {
      alert("Please add at least one ingredient");
      return;
    }

    // Validate each ingredient
    for (const ingredient of formData.ingredients) {
      if (!ingredient.ingredient_name.trim()) {
        alert("All ingredients must have a name");
        return;
      }
      if (!ingredient.quantity || Number(ingredient.quantity) <= 0) {
        alert("All ingredients must have a valid quantity");
        return;
      }
      if (!ingredient.unit) {
        alert("All ingredients must have a unit");
        return;
      }
    }

    const payload = {
      menu_item_id: Number(formData.menu_item_id),
      ingredients: formData.ingredients.map(ing => ({
        ingredient_name: ing.ingredient_name.trim(),
        quantity: ing.quantity,
        unit: ing.unit,
      })),
    };

    if (mode === 'add') {
      createMutation.mutate(payload);
    } else if (mode === 'edit' && recipe) {
      updateMutation.mutate({ id: recipe.id, data: payload });
    }
  };

  const handleDelete = () => {
    if (!recipe) return;
    
    if (window.confirm(`Are you sure you want to delete the recipe for "${recipe.menu_item_name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(recipe.id);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'view':
        return '📋 View Recipe';
      case 'edit':
        return '✏️ Edit Recipe';
      case 'add':
        return '📋 Add New Recipe';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {mode === 'view' && recipe ? (
            <RecipeView recipe={recipe} />
          ) : (
            <RecipeEdit
              recipe={recipe}
              formData={formData}
              onChange={setFormData}
            />
          )}
        </div>

        <DialogFooter>
          <ModalActions
            mode={mode}
            onClose={onClose}
            onSave={handleSave}
            onDelete={mode === 'view' ? handleDelete : undefined}
            isSaving={createMutation.isPending || updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeModal;
