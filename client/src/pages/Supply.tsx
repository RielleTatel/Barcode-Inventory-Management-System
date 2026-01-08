import { useState } from "react"
import { Button } from "@/components/ui/button";
import { SupplyTabs } from "@/components/ui/tabs";
import ReceiveDelivery from "@/components/supply-components/ReceiveDelivery";
import SupplierDirectory from "@/components/supply-components/SuppilerDirectory";
import PurchaseHistory from "@/components/supply-components/PurchaseHistory";

const Supply = () => { 
  const [activeTab, setActiveTab] = useState<string>("receive-delivery");

  const renderTabContent = () => {
    switch (activeTab) {
      case "receive-delivery":
        return <ReceiveDelivery />;
      case "supplier-directory":
        return <SupplierDirectory />;
      case "purchase-history":
        return <PurchaseHistory />;
      default:
        return <ReceiveDelivery />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full gap-y-6">

    <div className="rounded-xl p-2 flex flex-col gap-y-4">
      <div className="flex flex-col">
        <p className="text-[32px] font-bold"> Supply Management </p> 
        <p className="text-md">Manage Your Supplies </p> 
      </div>

      <div className="flex gap-3 items-center">
        <Button variant="outline">Export</Button>
        <Button>Add Product</Button>
      </div>  
    </div>  

      <SupplyTabs
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {renderTabContent()}
    </div>
  );
};

export default Supply;
