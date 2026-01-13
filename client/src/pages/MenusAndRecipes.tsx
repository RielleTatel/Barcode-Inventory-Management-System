import { useState } from "react"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Eye, Trash2 } from "lucide-react";
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table" 

interface MenuItem {
  sku: string;
  itemName: string;
  category: string;
  price: number;
  unit: string;
  availability: string;
}

const mockMenuData: MenuItem[] = [
  {
    sku: "MENU-001",
    itemName: "Beef Wellington",
    category: "Main Course",
    price: 450.00,
    unit: "serving",
    availability: "Available"
  },
  {
    sku: "MENU-002",
    itemName: "Caesar Salad",
    category: "Appetizer",
    price: 180.00,
    unit: "serving",
    availability: "Available"
  },
  {
    sku: "MENU-003",
    itemName: "Chocolate Lava Cake",
    category: "Dessert",
    price: 220.00,
    unit: "piece",
    availability: "Available"
  },
  {
    sku: "MENU-004",
    itemName: "Grilled Salmon",
    category: "Main Course",
    price: 520.00,
    unit: "serving",
    availability: "Out of Stock"
  },
];

const MenusAndRecipes = () => { 

  return (
    <div className="flex flex-col h-full w-full gap-y-6">

    <div className="rounded-xl p-2 flex flex-row gap-x-4">
      <div className="flex flex-col">
        <p className="text-[32px] font-bold"> Menu Master List & Recipe Management </p> 
        <p className="text-md">Manage Your Food Menu </p> 
      </div>

      <div className="flex gap-3 items-center">
        <Button variant="outline">Export</Button>
        <Button>Add Product</Button>
      </div>  
    </div>  

      <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-4 gap-y-4 border border-[#E5E5E5]">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            <Input placeholder="Search product" className="w-64" />
            <Button>Search</Button>
          </div>

          <div className="flex gap-3">
            <Select>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Branch</SelectLabel>
                  <SelectItem value="1">Branch 1</SelectItem>
                  <SelectItem value="2">Branch 2</SelectItem>
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
              {mockMenuData.map((item) => (
                <TableRow key={item.sku}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell className="font-mono">{item.sku}</TableCell>
                  <TableCell className="font-semibold">{item.itemName}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>₱{item.price.toFixed(2)}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.availability === "Available"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {item.availability}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => console.log('View', item.sku)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => console.log('Edit', item.sku)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => console.log('Delete', item.sku)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table> 
        </div>
       </div>
    </div>
  );
};

export default MenusAndRecipes;
