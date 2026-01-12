import { useState } from "react"
import { Button } from "@/components/ui/button";
import { InventoryTabs } from "@/components/ui/tabs";
import Inventories from "@/components/inventory-components/Inventories";
import Consumption from "@/components/inventory-components/Consumption";
import Transfer from "@/components/inventory-components/Transfer";

const Inventory = () => {

  const [activeTab, setActiveTab] = useState<string>("inventory"); 

  const renderTabContent = () => {
      switch (activeTab) {
      case "inventories":
        return <Inventories />;
      case "consumption":
        return <Consumption />;
      case "transfer":
        return <Transfer />;
      default:
        return <Inventories />;
    }
  }

  return (
    <div className="flex flex-col h-full w-full gap-y-2.5">
      <div className="rounded-xl p-2 flex gap-x-7">
        <div className="flex flex-col">
          <p className="text-[32px] font-bold"> Inventory </p> 
          <p className="text-md">Manage Your Inventory </p> 
        </div>

        <div className="flex gap-3 items-center">
          <Button variant="outline">Export</Button>
          <Button>Add Product</Button>
        </div>  
      </div>  

        <InventoryTabs
          activeTab={activeTab}
          onChange={setActiveTab}
        />  

        {renderTabContent()}
      </div>
  )
}

export default Inventory