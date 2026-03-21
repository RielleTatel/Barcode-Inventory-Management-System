import { Button } from "@/components/ui/button";
import { useState } from "react";
import { InventoryTabs } from "@/components/ui/tabs";
import { useTabWithUrl } from "@/hooks/useTabWithUrl";
import Inventories from "@/components/inventory/Inventories";
import Consumption from "@/components/inventory/Consumption";
import Transfer from "@/components/inventory/Transfer";
import BOM from "@/components/inventory/BOM";
import type { ModalMode } from "@/components/inventory/inventoryModal/InventoryItemModal";

import type { InventoryItem } from "@/components/inventory";
import InventoryItemModal from "@/components/inventory/inventoryModal/InventoryItemModal";

const Inventory = () => {
  const [modalState, setModalState] = useState<{
      isOpen: boolean;
    mode: ModalMode; 
      inventoryData?: InventoryItem;
    }>({
      isOpen: false,
      mode: 'add',
    });
    
  const [activeTab, handleTabChange] = useTabWithUrl("inventories"); 

  const renderTabContent = () => {
      switch (activeTab) { 
      case "inventories":  
        return <Inventories onView={openViewModal} onEdit={openEditModal} />;
      case "consumption":
        return <Consumption/>;
      case "bom":
        return <BOM />;
      case "transfer":
        return <Transfer/>;
      default:
        return <Inventories onView={openViewModal} onEdit={openEditModal} />;
    }
  } 

    const openAddModal = () => {
      setModalState({
        isOpen: true,
        mode: 'add',
      });
    };
  
    const openViewModal = (item: InventoryItem) => {
      setModalState({
        isOpen: true,
        mode: 'view',
        inventoryData: item,
      });
    };
  
    const openEditModal = (item: InventoryItem) => {
      setModalState({
        isOpen: true,
        mode: 'edit',
        inventoryData: item,
      });
    };
  
    const closeModal = () => {
      setModalState({
        isOpen: false,
        mode: 'add',
      });
    };

  return (
    <div className="flex flex-col h-full w-full gap-y-2.5">
        <div className="rounded-xl p-2 flex flex-row gap-x-7">
          <div className="flex flex-col">
            <p className="text-[32px] font-bold"> Inventory Management</p> 
            <p className="text-md">Manage Your Inventory </p>  
          </div> 

                  <div className="flex gap-3 items-center">
          <Button variant="outline"> Export </Button>
          <Button onClick={openAddModal}> Add Inventory </Button>
        </div>  
        </div>  
 

        <InventoryTabs
          activeTab={activeTab}
          onChange={handleTabChange}
        />  

        {renderTabContent()} 

        <InventoryItemModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          mode={modalState.mode}
          inventoryData={modalState.inventoryData}
        />   
      </div>
  )
}

export default Inventory