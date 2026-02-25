
import { useState } from "react"; 
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Eye, Trash2 } from "lucide-react";
import RecipeModal, { type ModalMode } from "@/components/menus&Recipes/recipeModal/RecipeModal";
import type { Recipe } from "@/components/menus&Recipes";
import { fetchAllRecipes } from "@/components/menus&Recipes/api";
import { MENU_QUERY_KEYS } from "@/components/menus&Recipes";
import LoadingState from "@/components/ui/loadingState";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table" 

const Recipes = () => { 
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<ModalMode>("view");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Fetch recipes using React Query
  const { data: recipes = [], isLoading, error, refetch } = useQuery({
    queryKey: MENU_QUERY_KEYS.RECIPES,
    queryFn: fetchAllRecipes,
  });

  // Modal handlers
  const openViewModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const openEditModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedRecipe(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
  }; 

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = 
      recipe.menu_item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.menu_item_sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some(ing => 
        ing.ingredient_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full w-full gap-y-6"> 

      <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-4 gap-y-4 border border-[#E5E5E5]">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            <Input 
              placeholder="Search by item name, SKU, or ingredient" 
              className="w-80" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={() => refetch()}>Refresh</Button>
          </div>

          <div className="flex flex-row gap-x-2"> 
            <Button onClick={openAddModal}> 
              Add Recipe
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-[#F9FAFB]">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox />
                </TableHead>
                <TableHead className="text-bold text-[#94979F]">Menu SKU</TableHead>
                <TableHead className="text-bold text-[#94979F]">Item Name</TableHead>
                <TableHead className="text-bold text-[#94979F]">Recipes/Ingredients</TableHead>
                <TableHead className="text-right text-bold text-[#94979F]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <LoadingState />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-red-500">
                    Error loading recipes. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredRecipes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No recipes found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecipes.map((recipe) => (
                  <TableRow key={recipe.id}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-mono">{recipe.menu_item_sku}</TableCell>
                    <TableCell className="font-semibold">{recipe.menu_item_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                          >
                            {ingredient.ingredient_name}
                          </span>
                        ))}
                        {recipe.ingredients.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                            +{recipe.ingredients.length - 3} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openViewModal(recipe)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => openEditModal(recipe)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => openViewModal(recipe)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Recipe Modal */}
      <RecipeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        mode={modalMode}
        recipe={selectedRecipe ?? undefined}
      />
    </div>
  );
};

export default Recipes;
