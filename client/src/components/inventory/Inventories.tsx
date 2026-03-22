import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Eye, Trash2, Loader2, PackageX } from "lucide-react";
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchAllInventoryItems, fetchInventoryCategories, deleteInventoryItem, fetchBranches } from "./api";
import { INVENTORY_QUERY_KEYS, type InventoryItem } from ".";

interface InventoriesProps {
  onView: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
}

const STATUS_COLORS: Record<string, string> = {
  "In Stock": "text-emerald-600 bg-emerald-50",
  "Low Stock": "text-amber-600 bg-amber-50",
  "Out of Stock": "text-red-600 bg-red-50",
};

const Inventories = ({ onView, onEdit }: InventoriesProps) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.INVENTORY_ITEMS,
    queryFn: fetchAllInventoryItems,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.INVENTORY_ITEMS });
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string; detail?: string } } };
      const message =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.detail ||
        "Failed to delete inventory item. Please try again.";
      alert(message);
    },
  });

  const handleDelete = (item: InventoryItem) => {
    if (window.confirm(`Delete "${item.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const { data: categories = [] } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.INVENTORY_CATEGORIES,
    queryFn: fetchInventoryCategories,
  });

  const { data: branches = [] } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.BRANCHES,
    queryFn: fetchBranches,
  });

  const filtered = items.filter((item) => {
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      item.category_name === categoryFilter;

    const matchesStock =
      stockFilter === "all" ||
      item.stock_status === stockFilter;

    const matchesBranch =
      branchFilter === "all" ||
      (item.branch_stocks ?? []).some((bs) => bs.branch.toString() === branchFilter);

    return matchesSearch && matchesCategory && matchesStock && matchesBranch;
  });

  return (
    <>
      <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-4 gap-y-4 border border-[#E5E5E5]">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or SKU"
              className="w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Stock Status</SelectLabel>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Branch</SelectLabel>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                  ))}
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
                <TableHead className="text-bold text-[#94979F]">Stock Level</TableHead>
                <TableHead className="text-bold text-[#94979F]">Unit</TableHead>
                <TableHead className="text-bold text-[#94979F]">Status</TableHead>
                <TableHead className="text-right text-bold text-[#94979F]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    <p className="text-sm text-gray-400 mt-2">Loading inventory...</p>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-red-500">
                    Failed to load inventory data. Please try again.
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <PackageX className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">No inventory items found.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-gray-600">{item.category_name}</TableCell>
                    <TableCell>{parseFloat(item.total_stock ?? '0')}</TableCell>
                    <TableCell className="text-gray-500 uppercase text-xs">{item.uom}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.stock_status ?? ""] ?? "text-gray-600 bg-gray-100"}`}>
                        {item.stock_status ?? "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onView(item)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1 hover:bg-red-50 rounded"
                          title="Delete"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && !isError && (
          <p className="text-xs text-gray-400 text-right">
            {filtered.length} of {items.length} item{items.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </>
  );
};

export default Inventories;
