import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  PackageCheck, ClipboardList, Plus, Trash2, Search,
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
import { fetchAllInventoryItems, fetchBranches } from "@/components/inventory/api";
import { INVENTORY_QUERY_KEYS } from "@/components/inventory";

const newRow = (): ReceiveItemRow => ({
  _id: Date.now() + Math.random(),
  item_id: '',
  quantity_received: '',
  cost: '',
});

// ── Searchable item picker (portal-based so it escapes table overflow) ────────

interface ItemPickerProps {
  rowId: number;
  value: string;
  displayValue: string;
  inventoryItems: ReturnType<typeof fetchAllInventoryItems> extends Promise<infer T> ? T : never;
  usedItemIds: string[];
  onSelect: (itemId: string, itemName: string) => void;
  onClear: () => void;
}

const ItemPicker = ({
  rowId, value, displayValue, inventoryItems, usedItemIds, onSelect, onClear,
}: ItemPickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // Sync display when a value is selected externally (e.g., row reset)
  useEffect(() => {
    if (!value) setSearch('');
  }, [value]);

  const openDropdown = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 320),
        zIndex: 9999,
      });
    }
    setOpen(true);
  };

  const closeDropdown = () => setOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    onClear();
    openDropdown();
  };

  const handleFocus = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    openDropdown();
  };

  const handleBlur = () => {
    blurTimer.current = setTimeout(() => closeDropdown(), 150);
  };

  const handleItemClick = (itemId: string, itemName: string) => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setSearch(itemName);
    onSelect(itemId, itemName);
    closeDropdown();
    inputRef.current?.blur();
  };

  const filtered = inventoryItems.filter(item => {
    if (usedItemIds.includes(String(item.id))) return false;
    if (!search) return true;
    return (
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Show item name when already selected (not searching)
  const inputValue = value && !open ? (displayValue || search) : search;

  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none z-10" />
      <input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Search item by name or SKU…"
        className="w-full h-9 pl-7 pr-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        autoComplete="off"
      />
      {value && !open && (
        <button
          onMouseDown={e => { e.preventDefault(); onClear(); setSearch(''); openDropdown(); inputRef.current?.focus(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          tabIndex={-1}
        >✕</button>
      )}

      {open && typeof window !== 'undefined' && createPortal(
        <div
          style={dropdownStyle}
          className="bg-white border border-gray-200 rounded-lg shadow-xl max-h-52 overflow-auto"
        >
          {filtered.length === 0
            ? <div className="px-3 py-3 text-xs text-gray-400 text-center">No inventory items found</div>
            : filtered.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm border-b last:border-0"
                onClick={() => handleItemClick(String(item.id), item.name)}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-gray-900 truncate">{item.name}</span>
                  <span className="font-mono text-xs text-gray-400">{item.sku}</span>
                </div>
                <span className={`ml-2 shrink-0 text-xs px-1.5 py-0.5 rounded-full ${
                  item.stock_status === 'Low Stock' ? 'bg-amber-100 text-amber-700' :
                  item.stock_status === 'Out of Stock' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-500'
                }`}>{item.total_stock} {item.uom}</span>
              </div>
            ))
          }
        </div>,
        document.body
      )}
    </div>
  );
};

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
  // Display names for each row's selected item (separate from rows state for cleanliness)
  const [rowLabels, setRowLabels] = useState<Record<number, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  const { data: suppliers = [] } = useQuery({
    queryKey: SUPPLY_QUERY_KEYS.SUPPLIERS,
    queryFn: () => fetchSuppliers(false),
  });

  const { data: branches = [] } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.BRANCHES,
    queryFn: fetchBranches,
  });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.INVENTORY_ITEMS,
    queryFn: fetchAllInventoryItems,
  });

  const receiveMutation = useMutation({
    mutationFn: receiveDelivery,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.INVENTORY_ITEMS });
      queryClient.invalidateQueries({ queryKey: SUPPLY_QUERY_KEYS.DELIVERIES });
      setSuccessMsg(result.message);
      setSupplierId(''); setBranchId(''); setDrNumber(''); setReceivedBy(''); setNotes('');
      setRows([newRow()]); setRowLabels({});
      onDeliverySuccess?.();
    },
    onError: (e: any) => {
      alert(e.response?.data?.error || "Failed to receive delivery");
    },
  });

  const addRow = () => setRows(prev => [...prev, newRow()]);

  const removeRow = (id: number) => {
    setRows(prev => prev.length > 1 ? prev.filter(r => r._id !== id) : prev);
    setRowLabels(prev => { const next = { ...prev }; delete next[id]; return next; });
  };

  const updateRow = (id: number, field: keyof ReceiveItemRow, value: string) =>
    setRows(prev => prev.map(r => r._id === id ? { ...r, [field]: value } : r));

  const selectItem = (rowId: number, itemId: string, itemName: string) => {
    updateRow(rowId, 'item_id', itemId);
    setRowLabels(prev => ({ ...prev, [rowId]: itemName }));
  };

  const clearItem = (rowId: number) => {
    updateRow(rowId, 'item_id', '');
    setRowLabels(prev => { const next = { ...prev }; delete next[rowId]; return next; });
  };

  const totalCost = rows.reduce((sum, r) => {
    return sum + (parseFloat(r.quantity_received) || 0) * (parseFloat(r.cost) || 0);
  }, 0);

  const handleSubmit = () => {
    if (!supplierId) { alert("Please select a supplier"); return; }
    if (!branchId) { alert("Please select a receiving branch"); return; }
    if (!receivedDate) { alert("Please set the received date"); return; }

    const validRows = rows.filter(r => r.item_id !== '' && r.quantity_received !== '' && r.cost !== '');
    if (validRows.length === 0) { alert("Please add at least one item — select it from the dropdown, then enter quantity and cost"); return; }
    if (validRows.find(r => Number(r.quantity_received) <= 0)) { alert("Quantity must be greater than 0"); return; }
    if (validRows.find(r => Number(r.cost) < 0)) { alert("Cost cannot be negative"); return; }

    receiveMutation.mutate({
      supplier_id: Number(supplierId),
      branch_id: Number(branchId),
      dr_number: drNumber,
      received_date: receivedDate,
      received_by: receivedBy,
      notes,
      items: validRows.map(r => ({
        item_id: Number(r.item_id),
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
          Fill in the delivery header, add each item received, then click Confirm. Stock levels update instantly.
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
              {rows.filter(r => r.item_id !== '').length} item(s) selected
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
                <TableHead className="text-[#94979F] w-72">Inventory Item</TableHead>
                <TableHead className="text-[#94979F] w-28">Category</TableHead>
                <TableHead className="text-[#94979F] w-32">Qty Received</TableHead>
                <TableHead className="text-[#94979F] w-12 text-xs">UOM</TableHead>
                <TableHead className="text-[#94979F] w-32">Unit Cost (₱)</TableHead>
                <TableHead className="text-[#94979F] text-right">Row Total</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => {
                const selectedItem = inventoryItems.find(i => String(i.id) === row.item_id);
                const usedIds = rows.filter(r => r._id !== row._id).map(r => r.item_id).filter(Boolean);
                const rowTotal = (parseFloat(row.quantity_received) || 0) * (parseFloat(row.cost) || 0);

                return (
                  <TableRow key={row._id}>
                    {/* Item picker — portal-based to escape table overflow */}
                    <TableCell className="py-2">
                      <ItemPicker
                        rowId={row._id}
                        value={row.item_id}
                        displayValue={rowLabels[row._id] ?? ''}
                        inventoryItems={inventoryItems}
                        usedItemIds={usedIds}
                        onSelect={(itemId, itemName) => selectItem(row._id, itemId, itemName)}
                        onClear={() => clearItem(row._id)}
                      />
                    </TableCell>

                    <TableCell className="text-sm text-gray-500 py-2">
                      {selectedItem?.category_name ?? <span className="text-gray-300">—</span>}
                    </TableCell>

                    <TableCell className="py-2">
                      <Input
                        type="number" min="0.01" step="0.01"
                        placeholder="0"
                        value={row.quantity_received}
                        onChange={e => updateRow(row._id, 'quantity_received', e.target.value)}
                        className="h-9 text-right w-28"
                      />
                    </TableCell>

                    <TableCell className="text-xs text-gray-400 uppercase py-2">
                      {selectedItem?.uom ?? <span className="text-gray-300">—</span>}
                    </TableCell>

                    <TableCell className="py-2">
                      <Input
                        type="number" min="0" step="0.01"
                        placeholder="0.00"
                        value={row.cost}
                        onChange={e => updateRow(row._id, 'cost', e.target.value)}
                        className="h-9 text-right w-28"
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
          : <><PackageCheck className="w-5 h-5" /> Confirm Delivery &amp; Update Stock</>
        }
      </Button>
    </div>
  );
};

export default ReceiveDelivery;
