import { Input } from "../ui/input";
import { Button } from "../ui/button"; 
import { PackageCheck, ClipboardCopy, UserStar} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table" 
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReceivedItem, ActiveSupplier } from "./supplier-types";

// Mock data for items received
const mockReceivedItems: ReceivedItem[] = [
  {
    productName: "Chicken Breast",
    category: "Meat",
    quantity: 20,
    unit: "kg",
    unitCost: 280,
    totalCost: 5600,
  },
  {
    productName: "Beef Sirloin",
    category: "Meat",
    quantity: 10,
    unit: "kg",
    unitCost: 450,
    totalCost: 4500,
  },
];

const mockActiveSuppliers: ActiveSupplier[] = [
  {
    supplierName: "Zamboanga Meat Market",
    category: "Meats (Beef/Pork)",
    contactPerson: "Mr. Tan",
    leadTime: "2-3 days",
    status: "Active",
  },
  {
    supplierName: "Vegetable City Supplier",
    category: "Fresh Produce",
    contactPerson: "Ms. Cruz",
    leadTime: "1-2 days",
    status: "Active",
  },
  {
    supplierName: "Beverage Center Inc.",
    category: "Drinks & Bottled Water",
    contactPerson: "Sales Dept.",
    leadTime: "3-5 days",
    status: "Active",
  },
];

const ReceiveDelivery = () => { 
    return (
      <>
      <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-4 gap-y-10">
        <div className="flex flex-col gap-y-2"> 
          <div className="flex flex-row gap-x-2 items-center">
            <span className="w-10 h-10"> <PackageCheck className="w-full h-full" /> </span>
            <p> <span className="font-bold text-3xl"> Log Incoming Delivery </span> </p>
          </div>
          <p> Use this to increase stock levels when a supplier delivery arrives at a branch </p> 
        </div> 

        <div className="gap-4 bg-[#F9F9F9] flex flex-row py-4 gap-x-28 justify-center items-center rounded-[12px]"> 

          <div className="flex flex-col gap-y-2">
            <label className="font-semibold">Receiving Branch</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Restaurant Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="branch1">Restaurant Branch</SelectItem>
                  <SelectItem value="branch2">Branch 2</SelectItem>
                  <SelectItem value="branch3">Branch 3</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-y-2">
            <label className="font-semibold">Supplier</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Restaurant Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="supplier1">Restaurant Branch</SelectItem>
                  <SelectItem value="supplier2">Supplier 2</SelectItem>
                  <SelectItem value="supplier3">Supplier 3</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-y-2">
            <label className="font-semibold">Delivery Receipt #DR</label>
            <Input/> 
          </div>
        </div>

        <div className="flex flex-col gap-y-3">
          <div className="flex flex-row gap-x-3 items-center"> 
            <div className="flex flex-row font-bold gap-x-2 items-center"> 
              <span> <ClipboardCopy/> </span> 
              <p> Items Received </p>
            </div>
            <Button>Add Product</Button>
          </div>

          <div className="rounded-tl-xl rounded-tr-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-[#92AEF9]">
                <TableRow>
                  <TableHead className="text-white">Product Name</TableHead>
                  <TableHead className="text-white">Category</TableHead>
                  <TableHead className="text-white">Quantity</TableHead>
                  <TableHead className="text-white">Unit</TableHead>
                  <TableHead className="text-white">Unit Cost</TableHead>
                  <TableHead className="text-white">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReceivedItems.length > 0 ? (
                  mockReceivedItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-semibold">{item.productName}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>₱ {item.unitCost.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">₱ {item.totalCost.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No items added yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table> 
          </div> 
        </div> 
    </div> 

      <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-4 gap-y-4">

        <div className="flex flex-row gap-x-2 items-center">
          <span className="w-10 h-10"> <UserStar className="w-full h-full" /> </span>
          <p> <span className="font-bold text-3xl"> Active Supplier List </span> </p>
        </div>

      <div className="rounded-tl-xl rounded-tr-xl border overflow-hidden">
        <Table>
          <TableHeader className="bg-[#92AEF9]">
            <TableRow>
              <TableHead className="text-white">Supplier Name</TableHead>
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white">Contact Person</TableHead>
              <TableHead className="text-white">Lead Time</TableHead>
              <TableHead className="text-white">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {mockActiveSuppliers.map((supplier, index) => (
              <TableRow key={index}>
                <TableCell className="font-semibold">
                  {supplier.supplierName}
                </TableCell>
                <TableCell>{supplier.category}</TableCell>
                <TableCell>{supplier.contactPerson}</TableCell>
                <TableCell>{supplier.leadTime}</TableCell>
                <TableCell>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    {supplier.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div> 
        
      </div> 
    </>
    )
}

export default ReceiveDelivery