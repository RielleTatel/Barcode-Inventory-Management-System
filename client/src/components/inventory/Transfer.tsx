import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, ArrowRight, CheckCircle2, Clock, XCircle, Send, PackageCheck, Ban, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchAllInventoryItems, fetchBranches, submitTransfer, receiveTransfer, cancelTransfer, fetchTransferLogs } from "./api";
import { INVENTORY_QUERY_KEYS, type InventoryItem } from ".";

const STATUS_BADGE: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
  initiated:  { label: 'Initiated',  classes: 'bg-blue-100 text-blue-700',   icon: <Clock className="w-3 h-3" /> },
  in_transit: { label: 'In Transit', classes: 'bg-amber-100 text-amber-700', icon: <ArrowRight className="w-3 h-3" /> },
  received:   { label: 'Received',   classes: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-3 h-3" /> },
  cancelled:  { label: 'Cancelled',  classes: 'bg-gray-100 text-gray-500',   icon: <XCircle className="w-3 h-3" /> },
};

const Transfer = () => {
  const queryClient = useQueryClient();

  const { data: allItems = [] } = useQuery({
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

  // ── Form state ────────────────────────────────────────────────────────────
  const [itemSearch, setItemSearch] = useState('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [fromBranchId, setFromBranchId] = useState('');
  const [toBranchId, setToBranchId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const itemDropdownRef = useRef<HTMLDivElement>(null);

  // ── Log filter ────────────────────────────────────────────────────────────
  const [logSearch, setLogSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(e.target as Node))
        setShowItemDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = allItems.filter(item =>
    item.sku.toLowerCase().includes(itemSearch.toLowerCase()) ||
    item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setItemSearch(`${item.sku} — ${item.name}`);
    setShowItemDropdown(false);
    setFromBranchId('');
    setToBranchId('');
    setQuantity('');
  };

  // Source branch options: only branches that have stock for this item
  const sourceBranches = selectedItem
    ? branches.filter(b => selectedItem.branch_stocks?.some(bs => bs.branch === b.id))
    : [];

  const destBranches = branches.filter(b => b.id !== Number(fromBranchId));

  const selectedSourceStock = selectedItem && fromBranchId
    ? selectedItem.branch_stocks?.find(bs => bs.branch === Number(fromBranchId))
    : null;

  // ── Submit transfer ───────────────────────────────────────────────────────
  const submitMutation = useMutation({
    mutationFn: submitTransfer,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.TRANSFER_LOGS });
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.INVENTORY_ITEMS });
      alert(result.message);
      setSelectedItem(null);
      setItemSearch('');
      setFromBranchId('');
      setToBranchId('');
      setQuantity('');
      setNotes('');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Transfer failed");
    },
  });

  const receiveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) => receiveTransfer(id, notes),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.TRANSFER_LOGS });
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.INVENTORY_ITEMS });
      alert(result.message);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Failed to confirm receipt");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelTransfer,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.TRANSFER_LOGS });
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.INVENTORY_ITEMS });
      alert(result.message);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Failed to cancel transfer");
    },
  });

  const handleSubmit = () => {
    if (!selectedItem) { alert("Please select an inventory item"); return; }
    if (!fromBranchId) { alert("Please select a source branch"); return; }
    if (!toBranchId) { alert("Please select a destination branch"); return; }
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) { alert("Please enter a valid quantity"); return; }
    if (!date) { alert("Please enter a date"); return; }

    submitMutation.mutate({
      item_id: selectedItem.id,
      from_branch_id: Number(fromBranchId),
      to_branch_id: Number(toBranchId),
      quantity: Number(quantity),
      date,
      notes,
    });
  };

  // ── Filtered logs ─────────────────────────────────────────────────────────
  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      !logSearch ||
      log.item_sku.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.item_name.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.from_branch_name.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.to_branch_name.toLowerCase().includes(logSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const inTransitLogs = logs.filter(l => l.status === 'initiated' || l.status === 'in_transit');

  return (
    <div className="space-y-8">
      {/* ── In-Transit Alert Banner ──────────────────────────────────────── */}
      {inTransitLogs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">
              {inTransitLogs.length} transfer{inTransitLogs.length > 1 ? 's' : ''} awaiting confirmation
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Stock is in transit and reserved until destination confirms receipt. Scroll down to confirm or cancel.
            </p>
          </div>
        </div>
      )}

      {/* ── Initiate Transfer Form ──────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Initiate Stock Transfer</h2>
        <p className="text-sm text-gray-500 -mt-3">
          Stock is immediately deducted from the source branch and held in transit until the destination confirms receipt.
        </p>

        {/* Item Search */}
        <div className="space-y-1 relative" ref={itemDropdownRef}>
          <label className="text-sm font-semibold text-gray-700">Inventory Item <span className="text-red-500">*</span></label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by SKU or name..."
              value={itemSearch}
              onChange={(e) => { setItemSearch(e.target.value); setShowItemDropdown(true); if (!e.target.value) setSelectedItem(null); }}
              onFocus={() => setShowItemDropdown(true)}
              className="h-11 pl-9"
            />
          </div>
          {showItemDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
              {filteredItems.length === 0
                ? <div className="px-4 py-3 text-sm text-gray-400">No items found</div>
                : filteredItems.map(item => (
                  <div key={item.id}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b last:border-0"
                    onMouseDown={(e) => { e.preventDefault(); handleSelectItem(item); }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{item.sku}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.stock_status === 'In Stock' ? 'bg-emerald-100 text-emerald-700' :
                        item.stock_status === 'Low Stock' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.total_stock} {item.uom}
                      </span>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* From → To Branch */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">From Branch <span className="text-red-500">*</span></label>
            <select
              value={fromBranchId}
              onChange={(e) => { setFromBranchId(e.target.value); setToBranchId(''); }}
              className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedItem}
            >
              <option value="">Select source branch</option>
              {sourceBranches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {selectedSourceStock && (
              <p className="text-xs text-gray-500">
                Available: <span className={`font-semibold ${Number(selectedSourceStock.quantity) <= Number(selectedSourceStock.threshold) ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {parseFloat(selectedSourceStock.quantity)} {selectedItem?.uom}
                </span>
              </p>
            )}
          </div>

          <div className="pb-2.5 text-gray-400">
            <ArrowRight className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">To Branch <span className="text-red-500">*</span></label>
            <select
              value={toBranchId}
              onChange={(e) => setToBranchId(e.target.value)}
              className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!fromBranchId}
            >
              <option value="">Select destination branch</option>
              {destBranches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity + Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Quantity {selectedItem && <span className="text-gray-400 font-normal">({selectedItem.uom})</span>}
              <span className="text-red-500"> *</span>
            </label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g., 10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Transfer Date <span className="text-red-500">*</span></label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11" />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Notes</label>
          <Input placeholder="Optional reason or remarks..." value={notes} onChange={(e) => setNotes(e.target.value)} className="h-11" />
        </div>

        <Button
          className="w-full h-11 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
        >
          <Send className="w-4 h-4" />
          {submitMutation.isPending ? 'Initiating Transfer...' : 'Initiate Transfer'}
        </Button>
      </div>

      {/* ── Pending Confirmations ───────────────────────────────────────── */}
      {inTransitLogs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h2 className="font-semibold text-amber-800">Pending Confirmations ({inTransitLogs.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {inTransitLogs.map(log => (
              <div key={log.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm text-gray-500">{log.item_sku}</span>
                    <span className="font-semibold text-gray-900 truncate">{log.item_name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 flex-wrap">
                    <span className="font-medium text-blue-700">{log.from_branch_name}</span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="font-medium text-emerald-700">{log.to_branch_name}</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-semibold text-gray-700">{parseFloat(log.quantity)} {log.item_uom}</span>
                    <span className="text-gray-400">•</span>
                    <span>{new Date(log.transferred_at).toLocaleDateString()}</span>
                  </div>
                  {log.notes && <p className="text-xs text-gray-400 mt-1 italic">"{log.notes}"</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                    onClick={() => {
                      if (window.confirm(`Confirm receipt of ${parseFloat(log.quantity)} ${log.item_uom} of "${log.item_name}" at ${log.to_branch_name}?`)) {
                        receiveMutation.mutate({ id: log.id });
                      }
                    }}
                    disabled={receiveMutation.isPending}
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    Confirm Receipt
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50 text-xs"
                    onClick={() => {
                      if (window.confirm(`Cancel this transfer? Stock will be returned to ${log.from_branch_name}.`)) {
                        cancelMutation.mutate(log.id);
                      }
                    }}
                    disabled={cancelMutation.isPending}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Transfer History ─────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-semibold text-gray-900">Transfer History</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Search..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="h-8 pl-8 text-sm w-48"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="initiated">Initiated</option>
              <option value="in_transit">In Transit</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {logsLoading ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">Loading transfer history...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">No transfers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-left">Route</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map(log => {
                  const badge = STATUS_BADGE[log.status] ?? STATUS_BADGE.initiated;
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{log.item_name}</p>
                        <p className="text-xs text-gray-400 font-mono">{log.item_sku}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="text-blue-700 font-medium">{log.from_branch_name}</span>
                          <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="text-emerald-700 font-medium">{log.to_branch_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {parseFloat(log.quantity)} <span className="text-xs font-normal text-gray-400">{log.item_uom}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.classes}`}>
                          {badge.icon} {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{log.date}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {log.received_at ? new Date(log.received_at).toLocaleString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transfer;
