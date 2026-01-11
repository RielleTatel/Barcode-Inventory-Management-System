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

interface CateringOrder {
  id: string;
  eventDate: string;
  clientName: string;
  packageName: string;
  itemsOrdered: string;
  status: string;
  kitchenSheet: string;
}

const mockCateringData: CateringOrder[] = [
  {
    id: "CAT-001",
    eventDate: "2026-01-15",
    clientName: "John Smith",
    packageName: "Premium Wedding Package",
    itemsOrdered: "Beef Wellington, Caesar Salad, Chocolate Cake",
    status: "Confirmed",
    kitchenSheet: "KS-001"
  },
  {
    id: "CAT-002",
    eventDate: "2026-01-20",
    clientName: "Maria Santos",
    packageName: "Corporate Event Package",
    itemsOrdered: "Pasta, Sandwiches, Fresh Juice",
    status: "Pending",
    kitchenSheet: "KS-002"
  },
  {
    id: "CAT-003",
    eventDate: "2026-01-18",
    clientName: "ABC Corporation",
    packageName: "Business Lunch Package",
    itemsOrdered: "Grilled Chicken, Rice, Vegetables",
    status: "Confirmed",
    kitchenSheet: "KS-003"
  },
];

const Catering = () => { 

  return (
    <div className="flex flex-col h-full w-full gap-y-6 ">

      <div className="rounded-xl p-2 flex gap-x-7">
        <div className="flex flex-col">
          <p className="text-[32px] font-bold"> Catering Management </p> 
          <p className="text-md">Manage Your Catering Orders </p> 
        </div>

        <div className="flex gap-3 items-center">
          <Button variant="outline">Export</Button>
          <Button>Add Product</Button>
        </div>  
      </div>  

      <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-4 gap-y-4 overflow-auto border border-[#E5E5E5]">

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
                <TableHead className="text-bold text-[#94979F]">Event Date</TableHead>
                <TableHead className="text-bold text-[#94979F]">Client Name</TableHead>
                <TableHead className="text-bold text-[#94979F]">Package Name</TableHead>
                <TableHead className="max-w-xs text-bold text-[#94979F]">Items Ordered</TableHead>
                <TableHead className="text-bold text-[#94979F]">Status</TableHead>
                <TableHead className="text-bold text-[#94979F]">Kitchen Sheet</TableHead>
                <TableHead className="text-right text-bold text-[#94979F]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCateringData.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>{order.eventDate}</TableCell>
                  <TableCell className="font-semibold">{order.clientName}</TableCell>
                  <TableCell>{order.packageName}</TableCell>
                  <TableCell className="max-w-xs whitespace-normal break-words">{order.itemsOrdered}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono">{order.kitchenSheet}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => console.log('View', order.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => console.log('Edit', order.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => console.log('Delete', order.id)}
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

export default Catering;
