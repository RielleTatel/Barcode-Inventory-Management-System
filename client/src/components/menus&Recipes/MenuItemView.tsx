import InfoField from "@/components/ui/modal/InfoField";
import { Badge } from "@/components/ui/badge";
import type { MenuItem } from ".";

interface MenuItemViewProps {
  menuItem: MenuItem;
}

const MenuItemView = ({ menuItem }: MenuItemViewProps) => {
  return (
    <div className="space-y-6">
      {/* Row 1: Item Name and SKU */}
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

      {/* Row 2: Category and Price */}
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

      {/* Row 3: Unit and Availability */}
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

      {/* Additional Info Section */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Additional Information</h3>
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
