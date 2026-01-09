import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Pencil, Eye, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Supplier } from "./supplier-types";


const mockSuppliers: Supplier[] = [
  {
    id: "SUP-001",
    supplierName: "Zamboanga Meat Market",
    primaryCategory: "Meats (Beef/Pork)",
    contactPerson: "Mr. Tan",
    phoneEmail: "0917-555-0101\nsales@zbmeat.ph",
    paymentTerms: "COD (Cash on Delivery)",
    status: "Active",
  },
  {
    id: "SUP-002",
    supplierName: "Vegetable City Supplier",
    primaryCategory: "Fresh Produce",
    contactPerson: "Ms. Cruz",
    phoneEmail: "0998-123-4567\norders@vegcity.com",
    paymentTerms: "Net 15 Days",
    status: "Active",
  },
  {
    id: "SUP-003",
    supplierName: "Beverage Center Inc.",
    primaryCategory: "Drinks & Bottled Water",
    contactPerson: "Sales Dept.",
    phoneEmail: "(062) 991-2000",
    paymentTerms: "Net 30 Days",
    status: "Inactive",
  },
];

const SupplierDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSuppliers = mockSuppliers.filter(
    (supplier) =>
      supplier.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.primaryCategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-2 gap-y-4">

      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search Supplier Name or Category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">+ Add New Supplier</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Supplier Name</TableHead>
              <TableHead>Primary Category</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Phone / Email</TableHead>
              <TableHead>Payment Terms</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.id}</TableCell>
                  <TableCell className="font-semibold">{supplier.supplierName}</TableCell>
                  <TableCell>{supplier.primaryCategory}</TableCell>
                  <TableCell>{supplier.contactPerson}</TableCell>
                  <TableCell className="whitespace-pre-line text-sm">
                    {supplier.phoneEmail}
                  </TableCell>
                  <TableCell>{supplier.paymentTerms}</TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        supplier.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {supplier.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => console.log('View', supplier.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => console.log('Edit', supplier.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => console.log('Delete', supplier.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No suppliers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SupplierDirectory;
