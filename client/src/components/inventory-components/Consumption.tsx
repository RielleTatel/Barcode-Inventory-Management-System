import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button"; 
import { ClipboardList, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockMenuItems = [
  {
    menuCategory: "Beef Viands",
    itemName: "Beef Curry",
    unitsSold: 0,
  },
  {
    menuCategory: "Silog Express",
    itemName: "Tapsilog",
    unitsSold: 0,
  },
];

type ManualAdjustment = {
  id: number;
  itemName: string;
  amountUsed: number;
  unit: string;
  reason: string;
};

const Consumption = () => {
  const [manualAdjustments, setManualAdjustments] = useState<ManualAdjustment[]>([
    {
      id: 1,
      itemName: "Cooking Oil",
      amountUsed: -0.1,
      unit: "Liters",
      reason: "General Cooking",
    },
  ]);

  const addManualAdjustment = () => {
    const newAdjustment: ManualAdjustment = {
      id: Date.now(),
      itemName: "",
      amountUsed: 0,
      unit: "",
      reason: "",
    };
    setManualAdjustments([...manualAdjustments, newAdjustment]);
  };

  return (
    <>
      <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-4 gap-y-10 border border-[#E5E5E5]">
        {/* Header */}
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-row gap-x-2 items-center">
            <span className="text-2xl">📋</span>
            <p>
              <span className="font-bold text-3xl">End-of-Shift Consumption Entry</span>
            </p>
          </div>
          <p>Log today's sales and usage to update inventory levels.</p>
        </div>

        {/* Branch and Date Selection */}
        <div className="gap-4 bg-[#F9F9F9] flex flex-row py-4 px-6 gap-x-28 justify-start items-center rounded-[12px]">
          <div className="flex flex-col gap-y-2 w-64">
            <label className="font-semibold">Branch Name</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Restaurant Branch 1" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="branch1">Restaurant Branch 1</SelectItem>
                  <SelectItem value="branch2">Restaurant Branch 2</SelectItem>
                  <SelectItem value="branch3">Restaurant Branch 3</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-y-2 w-64">
            <label className="font-semibold">Reporting Date</label>
            <Input type="date" placeholder="mm/dd/yyyy" />
          </div>
        </div>

        {/* Menu Items Sold Section */}
        <div className="flex flex-col gap-y-3">
          <div className="flex flex-col gap-y-1">
            <p className="font-bold text-xl">Menu Items Sold (Auto-Calculates Raw Materials)</p>
          </div>

          <div className="rounded-tl-xl rounded-tr-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-[#F9FAFB]">
                <TableRow>
                  <TableHead className="text-bold text-[#94979F]">Menu Category</TableHead>
                  <TableHead className="text-bold text-[#94979F]">Item Name</TableHead>
                  <TableHead className="text-bold text-[#94979F]">Units Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMenuItems.length > 0 ? (
                  mockMenuItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-semibold">{item.menuCategory}</TableCell>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          defaultValue={item.unitsSold} 
                          className="w-24"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                      No menu items available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-sm text-gray-600 italic">
            * The system will use the recipe (BOM) to deduct meat, grains, and packaging automatically.
          </p>
        </div>

        {/* Manual Raw Material Adjustment Section */}
        <div className="flex flex-col gap-y-3">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-y-1">
              <p className="font-bold text-xl">Manual Raw Material Adjustment</p>
              <p className="text-sm text-gray-600 italic">
                Use this only for items not tied to a recipe (e.g., cleaning supplies, bulk oil usage).
              </p>
            </div>
            <Button onClick={addManualAdjustment} className="gap-x-2">
              <Plus className="w-4 h-4" />
              Add Row
            </Button>
          </div>

          <div className="rounded-tl-xl rounded-tr-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-[#F9FAFB]">
                <TableRow>
                  <TableHead className="text-bold text-[#94979F]">Item Name</TableHead>
                  <TableHead className="text-bold text-[#94979F]">Amount Used</TableHead>
                  <TableHead className="text-bold text-[#94979F]">Unit</TableHead>
                  <TableHead className="text-bold text-[#94979F]">Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manualAdjustments.length > 0 ? (
                  manualAdjustments.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input 
                          type="text" 
                          defaultValue={item.itemName} 
                          placeholder="Enter item name"
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          defaultValue={item.amountUsed} 
                          step="0.1"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="text" 
                          defaultValue={item.unit} 
                          placeholder="Unit"
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="text" 
                          defaultValue={item.reason} 
                          placeholder="Enter reason"
                          className="w-full"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No manual adjustments added yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base"
          >
            Submit Consumption Data
          </Button>
        </div>
      </div>
    </>
  );
};

export default Consumption;