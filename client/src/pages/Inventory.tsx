import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"
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
  return (
    <div className="flex flex-col h-full w-full gap-y-4">

    <div className="rounded-xl p-2 flex gap-x-7">
      <div className="flex flex-col">
        <p className="text-[32px] font-bold">Inventory</p> 
        <p className="text-md">Manage Your Inventory </p> 
      </div>

      <div className="flex gap-3 items-center">
        <Button variant="outline">Export</Button>
        <Button>Add Product</Button>
      </div> 
    </div>

      <div className="bg-white rounded-xl flex-1 flex flex-col p-4 gap-y-4">

        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            <Input placeholder="Search product" className="w-64" />
            <Button>Search</Button>
          </div>

          <div className="flex gap-3">
            <Select>
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[140px]">
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
              <SelectTrigger className="w-[120px]">
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
                <TableHead className="w-[40px]">
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
              <TableRow>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell className="font-mono">SKU-001</TableCell>
                <TableCell>Chicken Breast</TableCell>
                <TableCell>Raw Ingredients</TableCell>
                <TableCell>120</TableCell>
                <TableCell>kg</TableCell>
                <TableCell>
                  <span className="text-green-600 font-medium">In Stock</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell className="font-mono">SKU-002</TableCell>
                <TableCell>Cooking Oil</TableCell>
                <TableCell>Raw Ingredients</TableCell>
                <TableCell>8</TableCell>
                <TableCell>L</TableCell>
                <TableCell>
                  <span className="text-red-600 font-medium">Low Stock</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
