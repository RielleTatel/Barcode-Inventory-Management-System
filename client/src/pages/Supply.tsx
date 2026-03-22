import { SupplyTabs } from "@/components/ui/tabs";
import { useTabWithUrl } from "@/hooks/useTabWithUrl";
import ReceiveDelivery from "@/components/supply/ReceiveDelivery";
import SupplierDirectory from "@/components/supply/SuppilerDirectory";
import PurchaseHistory from "@/components/supply/PurchaseHistory";

const Supply = () => { 
  const [activeTab, handleTabChange] = useTabWithUrl("receive-delivery");

  const renderTabContent = () => {
    switch (activeTab) {
      case "receive-delivery":
        return (
          <ReceiveDelivery
            onDeliverySuccess={() => handleTabChange("purchase-history")}
          />
        );
      case "supplier-directory":
        return <SupplierDirectory />;
      case "purchase-history":
        return <PurchaseHistory />;
      default:
        return <ReceiveDelivery />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full gap-y-2.5">

      <div className="rounded-xl p-2 flex flex-col gap-y-1">
        <p className="text-[32px] font-bold">Supply Management</p>
        <p className="text-sm text-gray-500">Manage suppliers, receive deliveries, and review purchase history.</p>
      </div>

      <SupplyTabs
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {renderTabContent()}
    </div>
  );
};

export default Supply;
