import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ArrowRight, Loader2, Search, ArrowLeftRight, ClipboardList } from "lucide-react";
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
import {
  fetchAllInventoryItems,
  fetchBranches,
  submitTransfer,
  fetchTransferLogs,
} from "./api";
import { INVENTORY_QUERY_KEYS } from ".";

const Transfer = () => {
  const queryClient = useQueryClient();

  // ── form state ────────────────────────────────────────────────────────────
  const [itemSearch, setItemSearch] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [fromBranchId, setFromBranchId] = useState("");
  const [toBranchId, setToBranchId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  // ── data queries ──────────────────────────────────────────────────────────
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.INVENTORY_ITEMS,
    queryFn: fetchAllInventoryItems,
  });

  const { data: branches = [] } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.BRANCHES,
    queryFn: fetchBranches,
  });

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.TRANSFER_LOGS,
    queryFn: fetchTransferLogs,
  });

  // ── filtered item list for search ─────────────────────────────────────────
  const filteredItems = items.filter((i) => {
    if (!itemSearch) return true;
    const q = itemSearch.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q);
  });

  const selectedItem = items.find((i) => i.id === selectedItemId) ?? null;

  // ── mutation ──────────────────────────────────────────────────────────────
  const transferMutation = useMutation({
    mutationFn: submitTransfer,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.INVENTORY_ITEMS });
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.TRANSFER_LOGS });
      alert(result.message);
      // reset form
      setSelectedItemId(null);
      setItemSearch("");
      setFromBranchId("");
      setToBranchId("");
      setQuantity("");
      setNotes("");
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || "Transfer failed. Please try again.");
    },
  });

  const handleSubmit = () => {
    if (!selectedItemId) { alert("Please select an inventory item."); return; }
    if (!fromBranchId) { alert("Please select the source branch."); return; }
    if (!toBranchId) { alert("Please select the destination branch."); return; }
    if (!quantity || Number(quantity) <= 0) { alert("Please enter a valid quantity."); return; }
    if (!date) { alert("Please select a transfer date."); return; }

    transferMutation.mutate({
      item_id: selectedItemId,
      from_branch_id: Number(fromBranchId),
      to_branch_id: Number(toBranchId),
      quantity: Number(quantity),
      date,
      notes,
    });
  };

  const availableToBranches = branches.filter((b) => b.id.toString() !== fromBranchId);

  return (
    <div className="flex flex-col gap-y-6">
      {/* ── Transfer Form ─────────────────────────────────────────────────── */}
      <div className="shadow-md bg-white rounded-xl flex flex-col p-6 gap-y-6 border border-[#E5E5E5]">
        <div className="flex items-center gap-x-3">
          <ArrowLeftRight className="w-6 h-6 text-blue-600" />
          <div>
            <p className="font-bold text-2xl">Stock Transfer</p>
            <p className="text-sm text-gray-500">Move inventory from one branch to another.</p>
          </div>
        </div>

        {/* Item Search */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Inventory Item <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by item name or SKU…"
              className="pl-9"
              value={itemSearch}
              onChange={(e) => {
                setItemSearch(e.target.value);
                setSelectedItemId(null);
              }}
            />
          </div>

          {/* Item results */}
          {itemSearch && !selectedItemId && (
            <div className="border rounded-lg bg-white shadow-sm max-h-48 overflow-auto">
              {itemsLoading ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading…
                </div>
              ) : filteredItems.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400">No items match your search.</p>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-blue-50 border-b last:border-0"
                    onClick={() => {
                      setSelectedItemId(item.id);
                      setItemSearch(`${item.sku} — ${item.name}`);
                    }}
                  >
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{item.sku}</p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <p>{parseFloat(item.current_stock ?? "0")} {item.uom}</p>
                      <p className="text-gray-400">{item.category_name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Selected item chip */}
          {selectedItem && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex-1">
                <p className="font-semibold text-sm text-blue-900">{selectedItem.name}</p>
                <p className="text-xs text-blue-600 font-mono">{selectedItem.sku}</p>
              </div>
              <div className="text-right text-xs text-blue-700">
                <p className="font-semibold">{parseFloat(selectedItem.current_stock ?? "0")} {selectedItem.uom} on hand</p>
                <p>{selectedItem.category_name}</p>
              </div>
            </div>
          )}
        </div>

        {/* From / To Branches + Quantity in one row */}
        <div className="grid grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              From Branch <span className="text-red-500">*</span>
            </label>
            <Select value={fromBranchId} onValueChange={(v) => { setFromBranchId(v); setToBranchId(""); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select source branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Branches</SelectLabel>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center pb-2">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              To Branch <span className="text-red-500">*</span>
            </label>
            <Select value={toBranchId} onValueChange={setToBranchId} disabled={!fromBranchId}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Branches</SelectLabel>
                  {availableToBranches.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quantity + Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Quantity to Transfer <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={selectedItem ? `Max: ${parseFloat(selectedItem.current_stock ?? "0")} ${selectedItem.uom}` : "e.g. 10"}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Transfer Date <span className="text-red-500">*</span>
            </label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Weekly replenishment for Branch 2"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={transferMutation.isPending}
            className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {transferMutation.isPending ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Processing…</span>
            ) : (
              <span className="flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" />Confirm Transfer</span>
            )}
          </Button>
        </div>
      </div>

      {/* ── Transfer Log ──────────────────────────────────────────────────── */}
      <div className="shadow-md bg-white rounded-xl flex flex-col p-6 gap-y-4 border border-[#E5E5E5]">
        <div className="flex items-center gap-x-2">
          <ClipboardList className="w-5 h-5 text-gray-500" />
          <p className="font-bold text-lg">Transfer History</p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-[#F9FAFB]">
              <TableRow>
                <TableHead className="text-[#94979F]">Date</TableHead>
                <TableHead className="text-[#94979F]">Item (SKU)</TableHead>
                <TableHead className="text-[#94979F]">From</TableHead>
                <TableHead className="text-[#94979F]">To</TableHead>
                <TableHead className="text-[#94979F] text-right">Qty</TableHead>
                <TableHead className="text-[#94979F]">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                    No transfers recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">{log.date}</TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{log.item_name}</p>
                      <p className="text-xs text-gray-400 font-mono">{log.item_sku}</p>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{log.from_branch_name}</TableCell>
                    <TableCell className="text-sm text-gray-600">{log.to_branch_name}</TableCell>
                    <TableCell className="text-right text-sm font-semibold">{parseFloat(log.quantity)}</TableCell>
                    <TableCell className="text-sm text-gray-500">{log.notes || "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
