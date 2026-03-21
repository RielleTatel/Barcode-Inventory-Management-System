import { useQuery } from "@tanstack/react-query";
import { Loader2, ClipboardList, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { fetchBOMEntries } from "./api";
import { INVENTORY_QUERY_KEYS } from ".";

const BOM = () => {
  const [search, setSearch] = useState("");

  const { data: rows = [], isLoading, isError } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.BOM_ENTRIES,
    queryFn: fetchBOMEntries,
  });

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.menu_item_name.toLowerCase().includes(q) ||
      r.menu_item_sku.toLowerCase().includes(q) ||
      r.ingredient_name.toLowerCase().includes(q) ||
      r.branch_name.toLowerCase().includes(q) ||
      r.date.includes(q)
    );
  });

  return (
    <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-4 gap-y-4 border border-[#E5E5E5]">
      {/* Header */}
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-x-2">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          <p className="font-bold text-2xl">Bill of Materials (BOM)</p>
        </div>
        <p className="text-sm text-gray-500">
          All raw material deductions calculated from submitted consumption entries.
        </p>
      </div>

      {/* Search */}
      <div className="flex justify-between items-center gap-4">
        <Input
          placeholder="Search by menu item, ingredient, branch or date…"
          className="w-80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="text-sm text-gray-400">
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-[#F9FAFB]">
            <TableRow>
              <TableHead className="text-[#94979F]">Date</TableHead>
              <TableHead className="text-[#94979F]">Branch</TableHead>
              <TableHead className="text-[#94979F]">Menu Item (SKU)</TableHead>
              <TableHead className="text-[#94979F] text-right">Units Sold</TableHead>
              <TableHead className="text-[#94979F]">Ingredient</TableHead>
              <TableHead className="text-[#94979F] text-right">Qty Deducted</TableHead>
              <TableHead className="text-[#94979F]">Unit</TableHead>
              <TableHead className="text-[#94979F]">Inv. SKU</TableHead>
              <TableHead className="text-[#94979F]">Matched</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-red-500">
                  Failed to load BOM data. Please refresh.
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-gray-400">
                  {search ? "No records match your search." : "No BOM entries yet. Submit a consumption entry to see records here."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-sm">{row.date}</TableCell>
                  <TableCell className="text-sm text-gray-500">{row.branch_name || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{row.menu_item_name}</span>
                      <span className="text-xs text-gray-400">{row.menu_item_sku}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm">{parseFloat(row.units_sold).toFixed(2)}</TableCell>
                  <TableCell className="text-sm font-mono">{row.ingredient_name}</TableCell>
                  <TableCell className="text-right text-sm font-semibold text-red-600">
                    -{parseFloat(row.quantity_deducted).toFixed(3)}
                  </TableCell>
                  <TableCell className="text-sm uppercase text-gray-500">{row.unit || "—"}</TableCell>
                  <TableCell className="text-xs font-mono text-gray-500">
                    {row.inventory_item_sku || "—"}
                  </TableCell>
                  <TableCell>
                    {row.inventory_matched ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Matched
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1" variant="outline">
                        <AlertCircle className="w-3 h-3" />
                        Unmatched
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Legend */}
      <p className="text-xs text-gray-400 italic">
        "Unmatched" means the ingredient name in the recipe did not match any inventory item's SKU or name.
        Ensure recipe ingredient names start with the inventory SKU (e.g. "RM-005 Longanisa") for automatic stock deduction.
      </p>
    </div>
  );
};

export default BOM;
