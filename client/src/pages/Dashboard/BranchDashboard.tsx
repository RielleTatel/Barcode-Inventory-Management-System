import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle, Boxes, Truck, XCircle, Package,
  ArrowLeft, RefreshCw, Loader2, Utensils,
  ArrowDownCircle, ArrowUpCircle, ShieldX,
} from "lucide-react";
import { fetchBranchDashboard } from "@/components/dashboard/api";
import { DASHBOARD_QUERY_KEYS } from "@/components/dashboard";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString();
const moneyFmt = (n: number) =>
  n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── KPI card ──────────────────────────────────────────────────────────────────

const KpiCard = ({
  label, value, sub, Icon, color, accent,
}: {
  label: string; value: number | string; sub?: string;
  Icon: React.ElementType; color: string; accent?: string;
}) => (
  <div className={`bg-white border-2 rounded-xl p-5 shadow-sm flex flex-col gap-y-2 ${accent ?? 'border-[#E5E5E5]'}`}>
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <div className={`p-2 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-').split('-').slice(0, 2).join('-') + '-50'}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
    </div>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400">{sub}</p>}
  </div>
);

// ── Status badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'In Stock':     'bg-green-100 text-green-700',
    'Low Stock':    'bg-amber-100 text-amber-700',
    'Out of Stock': 'bg-red-100 text-red-700',
    'initiated':    'bg-blue-100 text-blue-700',
    'in_transit':   'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const BranchDashboard = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.BRANCH(branchId!),
    queryFn: () => fetchBranchDashboard(branchId!),
    enabled: !!branchId,
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-600">
        <ShieldX className="w-10 h-10" />
        <p className="font-semibold">Failed to load branch data</p>
        <button onClick={() => refetch()} className="text-sm text-blue-600 underline">Retry</button>
      </div>
    );
  }

  const {
    branch, total_items, items_in_stock, out_of_stock_count,
    low_stock_count, prepared_food_count,
    pending_transfers_in, pending_transfers_out,
    low_stock_items, pending_transfers, recent_deliveries,
  } = data;

  const branchTypeLabel = branch.branch_type === 'kitchen' ? 'Full-Service Restaurant' : 'Resto Café';

  return (
    <div className="flex flex-col gap-y-6 w-full">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-0.5"
            title="Back to Global Overview"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button> 
          <div>
            <div className="flex items-center gap-2">
              <h1 className="m-0 text-2xl font-bold text-gray-900 leading-tight">{branch.name}</h1>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{branchTypeLabel}</span>
            </div>
            <p className="m-0 text-sm text-gray-400 leading-snug">{branch.address || 'Branch Dashboard'}</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-600 transition-colors shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Items"
          value={fmt(total_items)}
          sub={`${fmt(items_in_stock)} in stock`}
          Icon={Boxes}
          color="text-blue-600"
        />
        <KpiCard
          label="Low Stock Alerts"
          value={fmt(low_stock_count)}
          sub="Items below threshold"
          Icon={AlertTriangle}
          color={low_stock_count > 0 ? 'text-amber-500' : 'text-gray-400'}
          accent={low_stock_count > 0 ? 'border-amber-200' : undefined}
        />
        <KpiCard
          label="Out of Stock"
          value={fmt(out_of_stock_count)}
          sub="Items at zero quantity"
          Icon={XCircle}
          color={out_of_stock_count > 0 ? 'text-red-500' : 'text-gray-400'}
          accent={out_of_stock_count > 0 ? 'border-red-200' : undefined}
        />
        <KpiCard
          label="Prepared Food"
          value={fmt(prepared_food_count)}
          sub="Finished goods ready for sale"
          Icon={Utensils}
          color="text-green-600"
        />
      </div>

      {/* Transfers alert banner */}
      {(pending_transfers_in + pending_transfers_out) > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
          <Truck className="w-5 h-5 text-purple-500 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-purple-800 text-sm">
              {pending_transfers_in + pending_transfers_out} Pending Transfer{pending_transfers_in + pending_transfers_out !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-purple-600 mt-0.5">
              {pending_transfers_in > 0 && `${pending_transfers_in} incoming`}
              {pending_transfers_in > 0 && pending_transfers_out > 0 && ' · '}
              {pending_transfers_out > 0 && `${pending_transfers_out} outgoing`}
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
          >
            Manage <ArrowLeft className="w-3 h-3 rotate-180" />
          </button>
        </div>
      )}

      {/* Lower panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Low stock items */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-gray-700">Low Stock Alerts</h3>
            </div>
            {low_stock_items.length > 0 && (
              <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {low_stock_items.length} item{low_stock_items.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {low_stock_items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Boxes className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-green-700">All items above threshold</p>
              <p className="text-xs text-gray-400">No restocking needed right now</p>
            </div>
          ) : (
            <div className="overflow-auto max-h-72">
              <Table>
                <TableHeader className="bg-gray-50 sticky top-0">
                  <TableRow>
                    <TableHead className="text-[#94979F] text-xs">Item</TableHead>
                    <TableHead className="text-right text-[#94979F] text-xs">Stock</TableHead>
                    <TableHead className="text-right text-[#94979F] text-xs">Threshold</TableHead>
                    <TableHead className="text-center text-[#94979F] text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {low_stock_items.map(item => (
                    <TableRow key={item.item_id} className="hover:bg-amber-50">
                      <TableCell>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="font-mono text-xs text-gray-400">{item.sku} · {item.category}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-amber-600 text-sm">{item.quantity}</span>
                        <span className="text-xs text-gray-400 ml-1">{item.uom}</span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-500">{item.threshold}</TableCell>
                      <TableCell className="text-center"><StatusBadge status={item.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Right column: Pending transfers + Recent deliveries */}
        <div className="flex flex-col gap-5">

          {/* Pending transfers */}
          {pending_transfers.length > 0 && (
            <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b">
                <Truck className="w-4 h-4 text-purple-500" />
                <h3 className="font-bold text-sm text-gray-700">Pending Transfers</h3>
              </div>
              <div className="overflow-auto max-h-52">
                <Table>
                  <TableHeader className="bg-gray-50 sticky top-0">
                    <TableRow>
                      <TableHead className="text-[#94979F] text-xs">Dir.</TableHead>
                      <TableHead className="text-[#94979F] text-xs">Item</TableHead>
                      <TableHead className="text-[#94979F] text-xs">Branch</TableHead>
                      <TableHead className="text-right text-[#94979F] text-xs">Qty</TableHead>
                      <TableHead className="text-center text-[#94979F] text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending_transfers.map(t => (
                      <TableRow key={`${t.id}-${t.direction}`} className="hover:bg-purple-50">
                        <TableCell>
                          {t.direction === 'in'
                            ? <ArrowDownCircle className="w-4 h-4 text-green-500" />
                            : <ArrowUpCircle className="w-4 h-4 text-amber-500" />
                          }
                        </TableCell>
                        <TableCell className="text-sm font-medium max-w-32 truncate">{t.item}</TableCell>
                        <TableCell className="text-sm text-gray-500">{t.other_branch}</TableCell>
                        <TableCell className="text-right text-sm">{t.quantity} <span className="text-xs text-gray-400">{t.uom}</span></TableCell>
                        <TableCell className="text-center"><StatusBadge status={t.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Recent deliveries */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm overflow-hidden flex-1">
            <div className="flex items-center gap-2 px-5 py-4 border-b">
              <Package className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-sm text-gray-700">Recent Deliveries</h3>
            </div>
            {recent_deliveries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-300">
                <Package className="w-7 h-7" />
                <p className="text-sm text-gray-400">No deliveries recorded yet</p>
              </div>
            ) : (
              <div className="overflow-auto max-h-52">
                <Table>
                  <TableHeader className="bg-gray-50 sticky top-0">
                    <TableRow>
                      <TableHead className="text-[#94979F] text-xs">Supplier</TableHead>
                      <TableHead className="text-[#94979F] text-xs">Date</TableHead>
                      <TableHead className="text-[#94979F] text-xs">Items</TableHead>
                      <TableHead className="text-right text-[#94979F] text-xs">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recent_deliveries.map(d => (
                      <TableRow key={d.id} className="hover:bg-blue-50">
                        <TableCell>
                          <p className="font-semibold text-sm">{d.supplier}</p>
                          {d.dr_number && <p className="font-mono text-xs text-gray-400">#{d.dr_number}</p>}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(d.received_date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{d.item_count} item{d.item_count !== 1 ? 's' : ''}</TableCell>
                        <TableCell className="text-right text-sm font-semibold">₱{moneyFmt(d.total_cost)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default BranchDashboard;
