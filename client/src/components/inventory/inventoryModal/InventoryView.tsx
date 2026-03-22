import { Package, UtensilsCrossed, AlertTriangle, Link2, Building2 } from "lucide-react";
import type { InventoryItem } from "..";
import InfoField from "@/components/ui/modal/InfoField";

interface InventoryViewProps {
  inventoryItem: InventoryItem;
}

const STATUS_CONFIG = {
  'In Stock':     { classes: 'bg-emerald-100 text-emerald-700', icon: '✓' },
  'Low Stock':    { classes: 'bg-amber-100 text-amber-700',   icon: '⚠' },
  'Out of Stock': { classes: 'bg-red-100 text-red-700',       icon: '✕' },
} as const;

const branchStatusConfig = {
  'In Stock':     'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Low Stock':    'bg-amber-50 text-amber-700 border border-amber-200',
  'Out of Stock': 'bg-red-50 text-red-700 border border-red-200',
} as const;

const InventoryView = ({ inventoryItem }: InventoryViewProps) => {
  const isPreparedItem = inventoryItem.category_name === 'Prepared Items';
  const statusKey = inventoryItem.stock_status ?? 'Out of Stock';
  const statusCfg = STATUS_CONFIG[statusKey as keyof typeof STATUS_CONFIG] ?? { classes: 'bg-gray-100 text-gray-700', icon: '?' };

  const totalStock = parseFloat(inventoryItem.total_stock ?? '0');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${isPreparedItem ? 'bg-emerald-100' : 'bg-amber-100'}`}>
            {isPreparedItem
              ? <UtensilsCrossed className="w-6 h-6 text-emerald-600" />
              : <Package className="w-6 h-6 text-amber-600" />
            }
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{inventoryItem.name}</h3>
            <p className="text-sm text-gray-500">{inventoryItem.category_name}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 ${statusCfg.classes}`}>
          {statusKey === 'Low Stock' && <AlertTriangle className="w-3 h-3" />}
          {statusCfg.icon} {statusKey}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-6">
        <InfoField label="SKU" value={<span className="font-mono">{inventoryItem.sku}</span>} />
        <InfoField label="Unit of Measure" value={inventoryItem.uom} />
      </div>

      {/* Total Stock Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 mb-2">Total Stock (All Branches)</h4>
        <p className="text-3xl font-bold text-gray-900">
          {totalStock} <span className="text-sm font-normal text-gray-500">{inventoryItem.uom}</span>
        </p>
      </div>

      {/* Per-Branch Stock Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-700">
          <Building2 className="w-4 h-4 text-blue-600" />
          <h4 className="font-semibold text-sm">Stock by Branch</h4>
        </div>

        {!inventoryItem.branch_stocks || inventoryItem.branch_stocks.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400 italic">No branch stock records yet.</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2 text-left">Branch</th>
                  <th className="px-4 py-2 text-right">Quantity</th>
                  <th className="px-4 py-2 text-right">Threshold</th>
                  <th className="px-4 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventoryItem.branch_stocks.map(bs => {
                  const bStatusCfg = branchStatusConfig[bs.status as keyof typeof branchStatusConfig] ?? 'bg-gray-50 text-gray-600 border border-gray-200';
                  return (
                    <tr key={bs.id} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{bs.branch_name}</p>
                          <p className="text-xs text-gray-400 capitalize">{bs.branch_type.replace('_', ' ')}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {parseFloat(bs.quantity)} <span className="text-xs font-normal text-gray-400">{inventoryItem.uom}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">
                        {parseFloat(bs.threshold)} <span className="text-xs text-gray-400">{inventoryItem.uom}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bStatusCfg}`}>
                          {bs.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Linked Menu Item */}
      {isPreparedItem && inventoryItem.linked_menu_item_details && (
        <div className="bg-emerald-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <Link2 className="w-4 h-4" />
            <h4 className="font-semibold">Linked Menu Item</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-emerald-600">Menu Item Name</p>
              <p className="font-medium text-gray-900">{inventoryItem.linked_menu_item_details.name}</p>
            </div>
            <div>
              <p className="text-sm text-emerald-600">Menu SKU</p>
              <p className="font-mono text-gray-900">{inventoryItem.linked_menu_item_details.sku}</p>
            </div>
            <div>
              <p className="text-sm text-emerald-600">Selling Price</p>
              <p className="font-semibold text-emerald-700">₱{parseFloat(inventoryItem.linked_menu_item_details.price).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="pt-4 border-t border-gray-200 text-sm text-gray-500 flex justify-between">
        <span>Created: {new Date(inventoryItem.created_at).toLocaleDateString()}</span>
        <span>Last Updated: {new Date(inventoryItem.updated_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default InventoryView;
