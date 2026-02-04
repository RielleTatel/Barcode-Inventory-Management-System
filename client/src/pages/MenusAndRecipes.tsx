import { useState } from "react"; 
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Eye, Trash2 } from "lucide-react";
import AddMenuItemModal from "@/components/menus&Recipes/AddMenuItemModal";
import type { MenuItemFormData } from "@/components/menus&Recipes";
import { fetchAllMenuItems } from "@/components/menus&Recipes/api";
import { MENU_QUERY_KEYS } from "@/components/menus&Recipes";
import LoadingState from "@/components/ui/loadingState";

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
} from "@/components/ui/table" 

const MenusAndRecipes = () => { 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");

  // Fetch menu items using React Query
  const { data: menuItems = [], isLoading, error, refetch } = useQuery({
    queryKey: MENU_QUERY_KEYS.MENU_ITEMS,
    queryFn: fetchAllMenuItems,
  });

  // Filter menu items based on search query and branch
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.menu_category_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBranch = selectedBranch === "all" || 
      (selectedBranch === "cafe" && item.is_available_cafe);
    
    return matchesSearch && matchesBranch;
  });

  const openModal = () => {
    setIsAddModalOpen(true); 
  }

  const handleSaveMenuItem = (data: MenuItemFormData) => {
    console.log('Saving menu item:', data);
    // TODO: Add API call to save menu item
  }

  return (
    <div className="flex flex-col h-full w-full gap-y-6">

    <div className="rounded-xl p-2 flex flex-row gap-x-4">
      <div className="flex flex-col">
        <p
          onClick={openModal}
          className="text-[32px] font-bold"
        >
          Menu Master List & Recipe Management
        </p>
      </div>

      <div className="flex gap-3 items-center">
        <Button variant="outline">Export</Button>
        <Button onClick={openModal}>Add Product</Button>
      </div>  
    </div>  

      <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-4 gap-y-4 border border-[#E5E5E5]">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            <Input 
              placeholder="Search product" 
              className="w-64" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={() => refetch()}>Refresh</Button>
          </div>

          <div className="flex gap-3">
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Branch</SelectLabel>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="cafe">Cafe Only</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
         </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-[#F9FAFB]">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox />
                </TableHead>
                <TableHead className="text-bold text-[#94979F]">SKU</TableHead>
                <TableHead className="text-bold text-[#94979F]">Item Name</TableHead>
                <TableHead className="text-bold text-[#94979F]">Category</TableHead>
                <TableHead className="text-bold text-[#94979F]">Price</TableHead>
                <TableHead className="text-bold text-[#94979F]">Unit</TableHead>
                <TableHead className="text-bold text-[#94979F]">Availability</TableHead>
                <TableHead className="text-righ text-bold text-[#94979F]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <LoadingState />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-red-500">
                    Error loading menu items. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredMenuItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No menu items found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMenuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-mono">{item.sku}</TableCell>
                  <TableCell className="font-semibold">{item.name}</TableCell>
                  <TableCell>{item.menu_category_name}</TableCell>
                  <TableCell>₱{parseFloat(item.price).toFixed(2)}</TableCell>
                  <TableCell>serving</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.is_available_cafe
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {item.is_available_cafe ? "Available" : "Not Available"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => console.log('View', item.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => console.log('Edit', item.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => console.log('Delete', item.id)}
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

      <AddMenuItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveMenuItem}
      /> 
      
    </div>
  );
};

export default MenusAndRecipes;
