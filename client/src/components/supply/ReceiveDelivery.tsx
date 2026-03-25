import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  PackageCheck, ClipboardList, Plus, Trash2,
  Loader2, CheckCircle2, AlertTriangle,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { fetchSuppliers, receiveDelivery } from "./api";
import { SUPPLY_QUERY_KEYS, type ReceiveItemRow } from "./supplier-types";
import { fetchBranches } from "@/components/inventory/api";
import { INVENTORY_QUERY_KEYS } from "@/components/inventory";

const newRow = (): ReceiveItemRow => ({
  _id: Date.now() + Math.random(),
  item_name: '',
  item_sku: '',
  item_uom: '',
  item_category: '',
  quantity_received: '',
  cost: '',
});

// ── Main component ────────────────────────────────────────────────────────────

const ReceiveDelivery = ({ onDeliverySuccess }: { onDeliverySuccess?: () => void }) => {
  const queryClient = useQueryClient();

  const [supplierId, setSupplierId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [drNumber, setDrNumber] = useState('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [receivedBy, setReceivedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<ReceiveItemRow[]>([newRow()]);
  const [successMsg, setSuccessMsg] = useState('');

  const { data: suppliers = [] } = useQuery({
    queryKey: SUPPLY_QUERY_KEYS.SUPPLIERS,
    queryFn: () => fetchSuppliers(false),
  });

  const { data: branches = [] } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.BRANCHES,
    queryFn: fetchBranches,
  });

  const receiveMutation = useMutation({
    mutationFn: receiveDelivery,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: SUPPLY_QUERY_KEYS.DELIVERIES });
      setSuccessMsg(result.message);
      setSupplierId(''); setBranchId(''); setDrNumber(''); setReceivedBy(''); setNotes('');
      setRows([newRow()]);
      onDeliverySuccess?.();
    },
    onError: (e: any) => {
      alert(e.response?.data?.error || "Failed to receive delivery");
    },
  });

  const addRow = () => setRows(prev => [...prev, newRow()]);

  const removeRow = (id: number) => {
    setRows(prev => prev.length > 1 ? prev.filter(r => r._id !== id) : prev);
  };

  const updateRow = (id: number, field: keyof ReceiveItemRow, value: string) =>
    setRows(prev => prev.map(r => r._id === id ? { ...r, [field]: value } : r));

  const totalCost = rows.reduce((sum, r) => {
    return sum + (parseFloat(r.quantity_received) || 0) * (parseFloat(r.cost) || 0);
  }, 0);

  const handleSubmit = () => {
    if (!supplierId) { alert("Please select a supplier"); return; }
    if (!branchId) { alert("Please select a receiving branch"); return; }
    if (!receivedDate) { alert("Please set the received date"); return; }

    const validRows = rows.filter(r =>
      r.item_name.trim() !== '' &&
      r.item_sku.trim() !== '' &&
      r.item_uom.trim() !== '' &&
      r.quantity_received !== '' &&
      r.cost !== ''
    );
    if (validRows.length === 0) {
      alert("Please add at least one item with name, SKU, UOM, quantity, and cost");
      return;
    }
    if (validRows.find(r => Number(r.quantity_received) <= 0)) {
      alert("Quantity must be greater than 0");
      return;
    }
    if (validRows.find(r => Number(r.cost) < 0)) {
      alert("Cost cannot be negative");
      return;
    }

    receiveMutation.mutate({
      supplier_id: Number(supplierId),
      branch_id: Number(branchId),
      dr_number: drNumber,
      received_date: receivedDate,
      received_by: receivedBy,
      notes,
      items: validRows.map(r => ({
        item_name: r.item_name,
        item_sku: r.item_sku,
        item_uom: r.item_uom,
        item_category: r.item_category,
        quantity_received: Number(r.quantity_received),
        cost: Number(r.cost),
      })),
    });
  };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="text-sm font-semibold text-gray-700 block mb-1.5">{children}</label>
  );

  return (
    <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-6 gap-y-6 border border-[#E5E5E5]">
      {/* Header */}
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-x-3">
          <PackageCheck className="w-7 h-7 text-green-600" />
          <p className="font-bold text-2xl">Log Incoming Delivery</p>
        </div>
        <p className="text-sm text-gray-500">
          Fill in the delivery header, add each item received (as free text), then click Confirm to log the purchase.
        </p>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800 text-sm">Delivery Logged Successfully</p>
            <p className="text-sm text-green-700 mt-0.5">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg('')} className="ml-auto text-green-500 hover:text-green-700">✕</button>
        </div>
      )}

      {/* Delivery header */}
      <div className="bg-[#F9F9F9] rounded-xl p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="col-span-2 md:col-span-1">
          <Label>Supplier *</Label>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Active Suppliers</SelectLabel>
                {suppliers.map(s => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    <span className="font-mono text-xs text-gray-400 mr-1">{s.supplier_code}</span>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Receiving Branch *</Label>
          <Select value={branchId} onValueChange={setBranchId}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>DR / Invoice # (optional)</Label>
          <Input placeholder="e.g., DR-0042" value={drNumber} onChange={e => setDrNumber(e.target.value)} className="h-10" />
        </div>

        <div>
          <Label>Received Date *</Label>
          <Input type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} className="h-10" />
        </div>

        <div>
          <Label>Received By</Label>
          <Input placeholder="Staff name" value={receivedBy} onChange={e => setReceivedBy(e.target.value)} className="h-10" />
        </div>

        <div className="col-span-2 md:col-span-3">
          <Label>Notes (optional)</Label>
          <Input placeholder="Any remarks about this delivery…" value={notes} onChange={e => setNotes(e.target.value)} className="h-10" />
        </div>
      </div>

      {/* Items section */}
      <div className="flex flex-col gap-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-gray-600" />
            <p className="font-bold text-lg">Items Received</p>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {rows.filter(r => r.item_name.trim() !== '').length} item(s) entered
            </span>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={addRow}>
            <Plus className="w-4 h-4" /> Add Row
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader className="bg-[#F9FAFB]">
              <TableRow>
                <TableHead className="text-[#94979F]">Item Name</TableHead>
                <TableHead className="text-[#94979F]">SKU</TableHead>
                <TableHead className="text-[#94979F]">Category</TableHead>
                <TableHead className="text-[#94979F]">UOM</TableHead>
                <TableHead className="text-[#94979F]">Qty Received</TableHead>
                <TableHead className="text-[#94979F]">Unit Cost (₱)</TableHead>
                <TableHead className="text-[#94979F] text-right">Row Total</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => {
                const rowTotal = (parseFloat(row.quantity_received) || 0) * (parseFloat(row.cost) || 0);

                return (
                  <TableRow key={row._id}>
                    <TableCell className="py-2">
                      <Input
                        placeholder="e.g., Fresh Chicken Breast"
                        value={row.item_name}
                        onChange={e => updateRow(row._id, 'item_name', e.target.value)}
                        className="h-9 w-48"
                      />
                    </TableCell>

                    <TableCell className="py-2">
                      <Input
                        placeholder="e.g., SUP-CH-001"
                        value={row.item_sku}
                        onChange={e => updateRow(row._id, 'item_sku', e.target.value)}
                        className="h-9 w-32"
                      />
                    </TableCell>

                    <TableCell className="py-2">
                      <Input
                        placeholder="e.g., Meat"
                        value={row.item_category}
                        onChange={e => updateRow(row._id, 'item_category', e.target.value)}
                        className="h-9 w-32"
                      />
                    </TableCell>

                    <TableCell className="py-2">
                      <Input
                        placeholder="kg"
                        value={row.item_uom}
                        onChange={e => updateRow(row._id, 'item_uom', e.target.value)}
                        className="h-9 w-20"
                      />
                    </TableCell>

                    <TableCell className="py-2">
                      <Input
                        type="number" min="0.01" step="0.01"
                        placeholder="0"
                        value={row.quantity_received}
                        onChange={e => updateRow(row._id, 'quantity_received', e.target.value)}
                        className="h-9 text-right w-24"
                      />
                    </TableCell>

                    <TableCell className="py-2">
                      <Input
                        type="number" min="0" step="0.01"
                        placeholder="0.00"
                        value={row.cost}
                        onChange={e => updateRow(row._id, 'cost', e.target.value)}
                        className="h-9 text-right w-24"
                      />
                    </TableCell>

                    <TableCell className="text-right font-semibold text-sm py-2">
                      {rowTotal > 0 ? `₱ ${rowTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : <span className="text-gray-300">—</span>}
                    </TableCell>

                    <TableCell className="py-2">
                      <button
                        onClick={() => removeRow(row._id)}
                        className="p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-500 transition-colors"
                        title="Remove row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Grand total */}
        <div className="flex justify-end items-center gap-3 pt-2 border-t">
          <span className="font-semibold text-gray-600">Delivery Total:</span>
          <span className="font-bold text-xl text-gray-900">
            ₱ {totalCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Hint */}
      {(!supplierId || !branchId) && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Select a supplier and receiving branch before submitting.
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={receiveMutation.isPending}
        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-base gap-2"
      >
        {receiveMutation.isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
          : <><PackageCheck className="w-5 h-5" /> Confirm Delivery</>
        }
      </Button>
    </div>
  );
};

export default ReceiveDelivery;
