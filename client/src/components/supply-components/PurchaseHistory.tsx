import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
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
import type { PurchaseLog } from "./supplier-types";

// Mock data - replace with actual data from API
const mockPurchaseLogs: PurchaseLog[] = [
  {
    dateReceived: "Dec 20, 2025",
    refNumber: "DR-5501",
    supplier: "Zamboanga Meat Market",
    itemsSummary: "Chicken (20kg), Beef (10kg)",
    receivingBranch: "Resto Branch 1",
    totalCost: 8500.0,
    receivedBy: "Chef John",
  },
  {
    dateReceived: "Dec 18, 2025",
    refNumber: "DR-9920",
    supplier: "Vegetable City Supplier",
    itemsSummary: "Onions (5kg), Garlic (2kg), Potatoes...",
    receivingBranch: "Resto Branch 2",
    totalCost: 1250.0,
    receivedBy: "Mgr. Sarah",
  },
  {
    dateReceived: "Dec 15, 2025",
    refNumber: "INV-0045",
    supplier: "Beverage Center Inc.",
    itemsSummary: "Coke (10 cases), Sprite (5 cases)",
    receivingBranch: "Resto Branch 1",
    totalCost: 5400.0,
    receivedBy: "Chef John",
  },
];

const PurchaseHistory = () => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");

  const totalSpend = mockPurchaseLogs.reduce((sum, log) => sum + log.totalCost, 0);

  return (
    <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-6 gap-y-6">
      {/* Filters Section */}
      <div className="flex items-end gap-4">
        {/* Date Range */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-sm">Date Range:</label>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              placeholder="mm/dd/yyyy"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-40"
            />
            <span className="text-gray-500">to</span>
            <Input
              type="date"
              placeholder="mm/dd/yyyy"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-40"
            />
          </div>
        </div>

        {/* Branch Filter */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-sm">Branch:</label>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="branch1">Resto Branch 1</SelectItem>
                <SelectItem value="branch2">Resto Branch 2</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Supplier Filter */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-sm">Supplier:</label>
          <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Suppliers" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Suppliers</SelectItem>
                <SelectItem value="supplier1">Zamboanga Meat Market</SelectItem>
                <SelectItem value="supplier2">Vegetable City Supplier</SelectItem>
                <SelectItem value="supplier3">Beverage Center Inc.</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Button */}
        <Button className="bg-blue-600 hover:bg-blue-700">Filter</Button>
      </div>

      {/* Delivery Logs Section */}
      <div className="flex flex-col gap-y-4">
        <h2 className="text-lg font-bold">Delivery Logs (Past 30 Days)</h2>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Received</TableHead>
                <TableHead>Ref # (DR)</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Receiving Branch</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Received By</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPurchaseLogs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell>{log.dateReceived}</TableCell>
                  <TableCell className="font-medium">{log.refNumber}</TableCell>
                  <TableCell className="font-semibold">{log.supplier}</TableCell>
                  <TableCell>{log.receivingBranch}</TableCell>
                  <TableCell className="font-semibold">
                    ₱ {log.totalCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>{log.receivedBy}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="bg-gray-500 text-white hover:bg-gray-600">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Total Spend */}
        <div className="flex justify-end items-center gap-4 pt-4 border-t">
          <span className="font-bold text-lg">TOTAL SPEND (Filtered):</span>
          <span className="font-bold text-xl">
            ₱ {totalSpend.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PurchaseHistory;
