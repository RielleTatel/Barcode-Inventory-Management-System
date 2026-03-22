import { Package, UtensilsCrossed, AlertTriangle, Link2, GitBranch } from "lucide-react";
import type { InventoryItem } from "..";
import InfoField from "@/components/ui/modal/InfoField";

interface InventoryViewProps {
  inventoryItem: InventoryItem;
}

const InventoryView = ({ inventoryItem }: InventoryViewProps) => {
  const isPreparedItem = inventoryItem.category_name === 'Prepared Items';

  const getStatusBadge = () => {
    const status = inventoryItem.status || 'Unknown';
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1";
    
    switch (status) {
      case 'In Stock':
        return <span className={`${baseClasses} bg-emerald-100 text-emerald-700`}>✓ In Stock</span>;
      case 'Low Stock':
        return <span className={`${baseClasses} bg-amber-100 text-amber-700`}><AlertTriangle className="w-3 h-3" /> Low Stock</span>;
      case 'Out of Stock':
        return <span className={`${baseClasses} bg-red-100 text-red-700`}>✕ Out of Stock</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Category Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${isPreparedItem ? 'bg-emerald-100' : 'bg-amber-100'}`}>
            {isPreparedItem ? (
              <UtensilsCrossed className="w-6 h-6 text-emerald-600" />
            ) : (
              <Package className="w-6 h-6 text-amber-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{inventoryItem.name}</h3>
            <p className="text-sm text-gray-500">{inventoryItem.category_name}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-6">
        <InfoField
          label="SKU"
          value={<span className="font-mono">{inventoryItem.sku}</span>}
        />
        <InfoField
          label="Unit of Measure"
          value={inventoryItem.uom}
        />
      </div>

      {/* Stock Information */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h4 className="font-semibold text-gray-700">Stock Information</h4>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Current Stock</p>
            <p className="text-2xl font-bold text-gray-900">
              {parseFloat(inventoryItem.current_stock ?? '0')} <span className="text-sm font-normal text-gray-500">{inventoryItem.uom}</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Minimum Stock Level</p>
            <p className="text-2xl font-bold text-gray-900">
              {inventoryItem.min_stock_level} <span className="text-sm font-normal text-gray-500">{inventoryItem.uom}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Linked Menu Item (for Prepared Items) */}
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

      {/* Branch Availability */}
      <div className="bg-blue-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-blue-700">
          <GitBranch className="w-4 h-4" />
          <h4 className="font-semibold text-sm">Branch Availability</h4>
        </div>
        {inventoryItem.branches && inventoryItem.branches.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {inventoryItem.branches.map((branch) => (
              <span
                key={branch.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                {branch.name}
                <span className="text-blue-500">
                  ({branch.branch_type === 'kitchen' ? 'Restaurant' : 'Café'})
                </span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-blue-600 italic">Available at all branches</p>
        )}
      </div>

      {/* Timestamps */}
      <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
        <div className="flex justify-between">
          <span>Created: {new Date(inventoryItem.created_at).toLocaleDateString()}</span>
          <span>Last Updated: {new Date(inventoryItem.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default InventoryView;

