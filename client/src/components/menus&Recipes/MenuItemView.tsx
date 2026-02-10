import InfoField from "@/components/ui/modal/InfoField";
import { Badge } from "@/components/ui/badge";
import type { MenuItem } from ".";

interface MenuItemViewProps {
  menuItem: MenuItem;
}

const MenuItemView = ({ menuItem }: MenuItemViewProps) => {
  return (
    <div className="space-y-6">
      {/* Main Information Card */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-5">
        <div className="grid grid-cols-2 gap-6">
          <InfoField 
            label="Menu Item Name" 
            value={menuItem.name} 
          />
          <InfoField 
            label="Menu SKU" 
            value={menuItem.sku} 
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <InfoField 
            label="Category" 
            value={menuItem.menu_category_name} 
          />
          <InfoField 
            label="Selling Price" 
            value={`₱${parseFloat(menuItem.price).toFixed(2)}`} 
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <InfoField 
            label="Unit" 
            value="serving" 
          />
          <InfoField 
            label="Availability" 
            value={
              <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                menuItem.is_available_cafe
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {menuItem.is_available_cafe ? "Available in Cafe" : "Not Available"}
              </span>
            } 
          />
        </div>
      </div>

      {/* Additional Info Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Additional Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <InfoField 
            label="Menu ID" 
            value={`#${menuItem.id}`} 
          />
          <InfoField 
            label="Status" 
            value={
              <Badge variant={menuItem.is_available_cafe ? "default" : "secondary"}>
                {menuItem.is_available_cafe ? "Active" : "Inactive"}
              </Badge>
            } 
          />
        </div>
      </div>
    </div>
  );
};

export default MenuItemView;
