import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const Transfer = () => {
  return (
    <>
      <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-4 gap-y-10 border border-[#E5E5E5]">
        {/* Header */}
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-row gap-x-2 items-center">
            <span className="text-2xl">📦</span>
            <p>
              <span className="font-bold text-3xl">Add New Inventory Item</span>
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex flex-col gap-y-6">
          {/* Row 1: Item Name and SKU */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-y-2">
              <label className="font-semibold">Item Name</label>
              <Input placeholder="e.g. Beef Sirloin (Premium)" />
            </div>
            <div className="flex flex-col gap-y-2">
              <label className="font-semibold">SKU / Code</label>
              <Input placeholder="RM-XXXX" />
            </div>
          </div>

          {/* Row 2: Stock Category and Unit */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-y-2">
              <label className="font-semibold">Stock Category</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Raw Ingredients (Meats)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="meats">Raw Ingredients (Meats)</SelectItem>
                    <SelectItem value="vegetables">Raw Ingredients (Vegetables)</SelectItem>
                    <SelectItem value="grains">Grains & Rice</SelectItem>
                    <SelectItem value="condiments">Condiments & Sauces</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-y-2">
              <label className="font-semibold">Unit (UOM)</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Kilograms (kg)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="liters">Liters (L)</SelectItem>
                    <SelectItem value="pieces">Pieces (pcs)</SelectItem>
                    <SelectItem value="grams">Grams (g)</SelectItem>
                    <SelectItem value="ml">Milliliters (mL)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Low Stock Alert and Standard Cost */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-y-2">
              <label className="font-semibold">Low Stock Alert Level</label>
              <Input type="number" placeholder="e.g. 5" />
              <p className="text-sm text-gray-500">System alerts when stock dips below this.</p>
            </div>
            <div className="flex flex-col gap-y-2">
              <label className="font-semibold">Standard Cost (₱)</label>
              <Input type="number" step="0.01" placeholder="0.00" />
            </div>
          </div>

          {/* Branch Availability */}
          <div className="flex flex-col gap-y-3">
            <label className="font-semibold">
              Branch Availability (Where is this stored?)
            </label>
            <div className="border rounded-lg p-4 flex flex-col gap-y-3 bg-[#F9F9F9]">
              <div className="flex items-center gap-x-2">
                <Checkbox id="branch1" defaultChecked />
                <label htmlFor="branch1" className="text-sm font-medium cursor-pointer">
                  Restaurant Branch 1
                </label>
              </div>
              <div className="flex items-center gap-x-2">
                <Checkbox id="branch2" defaultChecked />
                <label htmlFor="branch2" className="text-sm font-medium cursor-pointer">
                  Restaurant Branch 2
                </label>
              </div>
              <div className="flex items-center gap-x-2">
                <Checkbox id="branch3" />
                <label htmlFor="branch3" className="text-sm font-medium cursor-pointer">
                  Resto Café (No Cooking)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" className="px-8">
            Cancel
          </Button>
          <Button className="px-8">
            Save Product
          </Button>
        </div>
      </div>
    </>
  );
};

export default Transfer;