import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, Boxes, Truck, XCircle,
  ChevronRight, RefreshCw, Loader2,
  TrendingDown, ShieldCheck, ShieldAlert, ShieldX,
  Package,
} from "lucide-react";
import { fetchGlobalDashboard } from "@/components/dashboard/api";
import { DASHBOARD_QUERY_KEYS, type BranchHealth } from "@/components/dashboard";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString();
const moneyFmt = (n: number) =>
  n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const HEALTH_STYLES: Record<BranchHealth, { bg: string; text: string; border: string; Icon: typeof ShieldCheck }> = {
  healthy:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200', Icon: ShieldCheck  },
  warning:  { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200', Icon: ShieldAlert  },
  critical: { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',   Icon: ShieldX      },
};

// ── KPI card ──────────────────────────────────────────────────────────────────

const StatCard = ({
  label, value, sub, Icon, color,
}: { label: string; value: number | string; sub?: string; Icon: React.ElementType; color: string }) => (
  <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm flex flex-col gap-y-3">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400">{sub}</p>}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const DashboardPage1 = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.GLOBAL,
    queryFn: fetchGlobalDashboard,
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
        <p className="font-semibold">Failed to load dashboard data</p>
        <button onClick={() => refetch()} className="text-sm text-blue-600 underline">Retry</button>
      </div>
    );
  }

  const { totals, branch_breakdown, critical_items, recent_deliveries } = data;

  return (
    <div className="flex flex-col gap-y-6 w-full">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Company-wide stock health across all branches</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Inventory Items"  value={fmt(totals.total_items)}        sub="Unique SKUs in stock across all branches"  Icon={Boxes}          color="text-blue-600" />
        <StatCard label="Low Stock Alerts"        value={fmt(totals.low_stock_count)}    sub="Items below their branch threshold"        Icon={AlertTriangle}  color="text-amber-500" />
        <StatCard label="Out of Stock"            value={fmt(totals.out_of_stock_count)} sub="Items with zero quantity"                  Icon={XCircle}        color="text-red-500" />
        <StatCard label="Pending Transfers"       value={fmt(totals.pending_transfers)}  sub="Initiated or in-transit movements"         Icon={Truck}          color="text-purple-500" />
      </div>

      {/* Branch health cards */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400 mb-3">Branch Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {branch_breakdown.map(branch => {
            const style = HEALTH_STYLES[branch.health];
            const HealthIcon = style.Icon;
            return (
              <button
                key={branch.id}
                onClick={() => navigate(`/dashboard/branch/${branch.id}`)}
                className={`text-left rounded-xl border-2 ${style.border} ${style.bg} p-4 hover:shadow-md transition-shadow group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{branch.name}</p>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">
                      {branch.branch_type === 'kitchen' ? 'Full-Service Restaurant' : 'Resto Café'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HealthIcon className={`w-4 h-4 ${style.text}`} />
                    <span className={`text-xs font-semibold capitalize ${style.text}`}>{branch.health}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{branch.total_items}</p>
                    <p className="text-xs text-gray-400">Items</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${branch.low_stock_count > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{branch.low_stock_count}</p>
                    <p className="text-xs text-gray-400">Low Stock</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${(branch.pending_in + branch.pending_out) > 0 ? 'text-purple-600' : 'text-gray-900'}`}>
                      {branch.pending_in + branch.pending_out}
                    </p>
                    <p className="text-xs text-gray-400">Transfers</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-1 text-xs text-gray-400 group-hover:text-blue-600 transition-colors">
                  View Branch Dashboard <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom panels — critical items + recent deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Critical low-stock items */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b">
            <TrendingDown className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-gray-700">Critical Low Stock — All Branches</h3>
          </div>
          {critical_items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-300 gap-2">
              <ShieldCheck className="w-8 h-8 text-green-400" />
              <p className="text-sm text-green-600 font-medium">All items above threshold</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-[#94979F] text-xs">Item</TableHead>
                    <TableHead className="text-[#94979F] text-xs">Branch</TableHead>
                    <TableHead className="text-right text-[#94979F] text-xs">Qty / Threshold</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {critical_items.map((item, i) => (
                    <TableRow key={i} className="hover:bg-amber-50">
                      <TableCell>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="font-mono text-xs text-gray-400">{item.sku}</p>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{item.branch}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-bold text-amber-600">{item.quantity}</span>
                        <span className="text-xs text-gray-400"> / {item.threshold} {item.uom}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Recent deliveries */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b">
            <Package className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-sm text-gray-700">Recent Deliveries</h3>
          </div>
          {recent_deliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-300 gap-2">
              <Package className="w-8 h-8" />
              <p className="text-sm text-gray-400">No recent deliveries</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-[#94979F] text-xs">Supplier</TableHead>
                    <TableHead className="text-[#94979F] text-xs">Branch</TableHead>
                    <TableHead className="text-[#94979F] text-xs">Date</TableHead>
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
                      <TableCell className="text-sm text-gray-600">{d.branch}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(d.received_date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold">
                        ₱{moneyFmt(d.total_cost)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardPage1;
