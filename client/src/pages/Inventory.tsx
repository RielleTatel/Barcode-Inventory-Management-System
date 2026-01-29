import { Button } from "@/components/ui/button";
import { InventoryTabs } from "@/components/ui/tabs";
import { useTabWithUrl } from "@/hooks/useTabWithUrl";
import Inventories from "@/components/inventory/Inventories";
import Consumption from "@/components/inventory/Consumption";
import Transfer from "@/components/inventory/Transfer";

const Inventory = () => {
  const [activeTab, handleTabChange] = useTabWithUrl("inventories"); 

  const renderTabContent = () => {
      switch (activeTab) {
      case "inventories":
        return <Inventories/>;
      case "consumption":
        return <Consumption/>;
      case "transfer":
        return <Transfer/>;
      default:
        return <Inventories/>;
    }
  }

  return (
    <div className="flex flex-col h-full w-full gap-y-2.5">
      <div className="rounded-xl p-2 flex gap-x-7">
        <div className="flex flex-col">
          <p className="text-[32px] font-bold"> Inventory Management</p> 
          <p className="text-md">Manage Your Inventory </p> 
        </div>

        <div className="flex gap-3 items-center">
          <Button variant="outline">Export</Button>
          <Button>Add Inventory </Button>
        </div>  
      </div>  

        <InventoryTabs
          activeTab={activeTab}
          onChange={handleTabChange}
        />  

        {renderTabContent()}
      </div>
  )
}

export default Inventory