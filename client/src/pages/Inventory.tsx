import { useState } from "react"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"
import { InventoryTabs } from "@/components/ui/tabs"; 
import type { stockData } from "@/components/inventory-components";
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

const Inventory = () => { 

const mockData: stockData[] = [
  {
    sku: 1,
    itemName: "Item 1",
    category: "Category A",
    stockLevel: 50,
    unit: 10,
    status: "In Stock",
    actions: () => { console.log("Editing") }
  },
  {
    sku: 2,
    itemName: "Item 2",
    category: "Category B",
    stockLevel: 0,
    unit: 5,
    status: "Out of Stock",
    actions: () => { console.log("Editing") }
  },
]


const [activeTab, setActiveTab] = useState<string>("inventory");

  return (
    <div className="flex flex-col h-full w-full gap-y-6">

    <div className="rounded-xl p-2 flex gap-x-7">
      <div className="flex flex-col">
        <p className="text-[32px] font-bold"> Inventory </p> 
        <p className="text-md">Manage Your Inventory </p> 
      </div>

      <div className="flex gap-3 items-center">
        <Button variant="outline">Export</Button>
        <Button>Add Product</Button>
      </div>  
    </div>  

      <InventoryTabs
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-4 gap-y-4">

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

            <Select>
              <SelectTrigger className="w-35">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  <SelectItem value="raw">Raw Ingredients</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-30">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Stock</SelectLabel>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="ok">In Stock</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox />
                </TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody> 
                {mockData.map(data => (
                  <TableRow>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-mono">{data.sku}</TableCell>
                    <TableCell>{data.itemName}</TableCell>
                    <TableCell>{data.category}</TableCell>
                    <TableCell>{data.stockLevel}</TableCell>
                    <TableCell>{data.unit}</TableCell>
                    <TableCell>
                      <span className="text-green-600 font-medium">{data.status}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
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

export default Inventory;
