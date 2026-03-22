import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { FileText, Loader2, Package, X } from "lucide-react";
import { fetchDeliveries, fetchDeliveryById } from "./api";
import { fetchSuppliers } from "./api";
import { SUPPLY_QUERY_KEYS, type Delivery } from "./supplier-types";
import { fetchBranches } from "@/components/inventory/api";
import { INVENTORY_QUERY_KEYS } from "@/components/inventory";

// ── Detail modal ──────────────────────────────────────────────────────────────

const DeliveryDetailModal = ({ delivery }: { delivery: Delivery | null }) => {
  if (!delivery) return null;

  return (
    <div className="space-y-5">
      {/* Summary header */}
      <div className="grid grid-cols-2 gap-4 pb-4 border-b">
        {[
          ['Supplier', delivery.supplier_name],
          ['Branch', delivery.branch_name],
          ['DR / Invoice #', delivery.dr_number || '—'],
          ['Received Date', new Date(delivery.received_date + 'T00:00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })],
          ['Received By', delivery.received_by || '—'],
        ].map(([label, val]) => (
          <div key={label}>
            <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
            <p className="font-semibold text-gray-900 text-sm">{val}</p>
          </div>
        ))}
      </div>

      {/* Items table */}
      <div>
        <p className="text-sm font-bold text-gray-700 mb-2">Items Received</p>
        <div className="rounded-md border text-sm">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="text-[#94979F]">SKU</TableHead>
                <TableHead className="text-[#94979F]">Item Name</TableHead>
                <TableHead className="text-[#94979F]">Category</TableHead>
                <TableHead className="text-right text-[#94979F]">Qty</TableHead>
                <TableHead className="text-right text-[#94979F]">Unit Cost</TableHead>
                <TableHead className="text-right text-[#94979F]">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {delivery.delivery_items.map(di => (
                <TableRow key={di.id}>
                  <TableCell className="font-mono text-xs text-gray-400">{di.item_sku}</TableCell>
                  <TableCell className="font-medium">{di.item_name}</TableCell>
                  <TableCell className="text-gray-500">{di.item_category}</TableCell>
                  <TableCell className="text-right">{di.quantity_received} {di.item_uom}</TableCell>
                  <TableCell className="text-right">₱ {parseFloat(di.cost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right font-semibold">₱ {parseFloat(di.total_cost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Grand total */}
      <div className="flex justify-end items-center gap-3 pt-2 border-t">
        <span className="text-gray-600 font-semibold">Total Delivery Cost:</span>
        <span className="text-xl font-bold text-gray-900">
          ₱ {parseFloat(delivery.total_cost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {delivery.notes && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{delivery.notes}</p>
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const PurchaseHistory = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  // Pending (not-yet-applied) filters — applied on button click
  const [appliedFilters, setAppliedFilters] = useState<{
    supplier?: number | string; branch?: number | string;
    date_from?: string; date_to?: string;
  }>({});

  // Detail modal
  const [detailId, setDetailId] = useState<number | null>(null);

  const { data: suppliers = [] } = useQuery({
    queryKey: SUPPLY_QUERY_KEYS.SUPPLIERS_ALL,
    queryFn: () => fetchSuppliers(true),
  });

  const { data: branches = [] } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.BRANCHES,
    queryFn: fetchBranches,
  });

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: [SUPPLY_QUERY_KEYS.DELIVERIES, appliedFilters],
    queryFn: () => fetchDeliveries(appliedFilters),
  });

  const { data: detailDelivery, isLoading: detailLoading } = useQuery({
    queryKey: ['delivery-detail', detailId],
    queryFn: () => fetchDeliveryById(detailId!),
    enabled: detailId !== null,
  });

  const handleFilter = () => {
    setAppliedFilters({
      supplier: supplierFilter !== 'all' ? supplierFilter : undefined,
      branch: branchFilter !== 'all' ? branchFilter : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });
  };

  const handleClear = () => {
    setDateFrom(''); setDateTo('');
    setSupplierFilter('all'); setBranchFilter('all');
    setAppliedFilters({});
  };

  const totalSpend = deliveries.reduce((sum, d) => sum + parseFloat(d.total_cost || '0'), 0);

  return (
    <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-6 gap-y-6 border border-[#E5E5E5]">

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 bg-[#F9F9F9] rounded-xl p-4">
        {/* Date range */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Date Range</label>
          <div className="flex items-center gap-2">
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40 h-9" />
            <span className="text-gray-400 text-sm">to</span>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40 h-9" />
          </div>
        </div>

        {/* Supplier */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Supplier</label>
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-52 h-9">
              <SelectValue placeholder="All Suppliers" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Branch */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Branch</label>
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-52 h-9">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleFilter} className="bg-blue-600 hover:bg-blue-700 text-white h-9">Apply Filters</Button>
          {Object.keys(appliedFilters).length > 0 && (
            <Button variant="outline" onClick={handleClear} className="h-9 gap-1"><X className="w-3.5 h-3.5" />Clear</Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Delivery Logs</h2>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-[#F9FAFB]">
              <TableRow>
                <TableHead className="text-[#94979F]">Date Received</TableHead>
                <TableHead className="text-[#94979F]">DR / Invoice #</TableHead>
                <TableHead className="text-[#94979F]">Supplier</TableHead>
                <TableHead className="text-[#94979F]">Branch</TableHead>
                <TableHead className="text-[#94979F]">Items</TableHead>
                <TableHead className="text-right text-[#94979F]">Total Cost</TableHead>
                <TableHead className="text-[#94979F]">Received By</TableHead>
                <TableHead className="text-center text-[#94979F]">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></TableCell></TableRow>
              ) : deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">No delivery records found.</p>
                    {Object.keys(appliedFilters).length > 0 && <p className="text-xs text-gray-400 mt-1">Try clearing the filters.</p>}
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map(d => (
                  <TableRow key={d.id} className="hover:bg-gray-50">
                    <TableCell className="text-sm">
                      {new Date(d.received_date + 'T00:00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{d.dr_number || <span className="text-gray-400 italic">—</span>}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-sm">{d.supplier_name}</p>
                        <p className="text-xs font-mono text-gray-400">{d.supplier_code}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{d.branch_name}</TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-600 space-y-0.5">
                        {d.items_summary.slice(0, 2).map((s, i) => <div key={i}>{s}</div>)}
                        {d.items_summary.length > 2 && <div className="text-gray-400">+{d.items_summary.length - 2} more…</div>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm">
                      ₱ {parseFloat(d.total_cost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-sm">{d.received_by || <span className="text-gray-400 italic">—</span>}</TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => setDetailId(d.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:bg-blue-50 rounded px-2.5 py-1 mx-auto"
                      >
                        <FileText className="w-3.5 h-3.5" />View
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Total spend */}
        {!isLoading && deliveries.length > 0 && (
          <div className="flex justify-end items-center gap-4 pt-3 border-t">
            <span className="font-bold text-gray-600">
              TOTAL SPEND {Object.keys(appliedFilters).length > 0 ? '(Filtered)' : '(All Time)'}:
            </span>
            <span className="font-bold text-xl text-gray-900">
              ₱ {totalSpend.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={detailId !== null} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Delivery Receipt Detail
            </DialogTitle>
          </DialogHeader>
          {detailLoading
            ? <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            : <DeliveryDetailModal delivery={detailDelivery ?? null} />
          }
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseHistory;
