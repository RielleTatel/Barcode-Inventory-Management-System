import InfoField from "@/components/ui/modal/InfoField";
import { Badge } from "@/components/ui/badge";
import type { Recipe } from "..";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RecipeViewProps {
  recipe: Recipe;
}

const RecipeView = ({ recipe }: RecipeViewProps) => {
  return (
    <div className="space-y-6">
      {/* Main Information Card */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-5">
        <div className="grid grid-cols-2 gap-6">
          <InfoField 
            label="Menu Item Name" 
            value={recipe.menu_item_name} 
          />
          <InfoField 
            label="Menu SKU" 
            value={recipe.menu_item_sku} 
          />
        </div>

        {recipe.total_cost && (
          <div className="grid grid-cols-2 gap-6">
            <InfoField 
              label="Total Recipe Cost" 
              value={`₱${parseFloat(recipe.total_cost).toFixed(2)}`} 
            />
          </div>
        )}
      </div>

      {/* Ingredients Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
          Recipe Ingredients
        </h3>
        
        {recipe.ingredients && recipe.ingredients.length > 0 ? (
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader className="bg-[#F9FAFB]">
                <TableRow>
                  <TableHead className="text-bold text-[#94979F]">Ingredient Name</TableHead>
                  <TableHead className="text-bold text-[#94979F]">Quantity</TableHead>
                  <TableHead className="text-bold text-[#94979F]">Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipe.ingredients.map((ingredient) => (
                  <TableRow key={ingredient.id}>
                    <TableCell className="font-medium">{ingredient.ingredient_name}</TableCell>
                    <TableCell>{ingredient.quantity}</TableCell>
                    <TableCell>{ingredient.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No ingredients added yet.
          </div>
        )}
      </div>

      {/* Additional Info Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
          Additional Information
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <InfoField 
            label="Recipe ID" 
            value={`#${recipe.id}`} 
          />
          <InfoField 
            label="Status" 
            value={
              <Badge variant="default">
                Active
              </Badge>
            } 
          />
        </div>
      </div>
    </div>
  );
};

export default RecipeView;
