import { Button } from "@/components/ui/button";
import { MenuAndRecipesTabs } from "@/components/ui/tabs";
import { useTabWithUrl } from "@/hooks/useTabWithUrl";
import { useState } from "react";
import type { MenuItem } from "@/components/menus&Recipes";
import MenuItemModal, { type ModalMode } from "@/components/menus&Recipes/menuModal/MenuItemModal";

import Menus from "@/components/menus&Recipes/Menus";
import Recipes from "@/components/menus&Recipes/Recipes";

const MenusAndRecipes = () => {  
    const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: ModalMode;
    menuItem?: MenuItem;
  }>({
    isOpen: false,
    mode: 'add',
  });
  const [activeTab, handleTabChange] = useTabWithUrl("menu"); 

  const renderTabContent = () => {
      switch (activeTab) {
      case "menu":
        return <Menus/>;
      case "recipe":
        return <Recipes/>
      case "recipe": 
      default:
        return <Menus/>;
    }
  } 

    const openAddModal = () => {
    setModalState({
      isOpen: true,
      mode: 'add',
    });
  };

  const openViewModal = (item: MenuItem) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      menuItem: item,
    });
  };

  const openEditModal = (item: MenuItem) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      menuItem: item,
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
      <div className="rounded-xl p-2 flex flex-row gap-x-4">
        <div className="flex flex-col">
          <p className="text-[32px] font-bold">
            Menu Master List & Recipe Management
          </p>
        </div> 

        <div className="flex gap-3 items-center">
          <Button variant="outline">Export</Button>
          <Button onClick={openAddModal}>Add Product</Button>
        </div>  
      </div> 

        <MenuAndRecipesTabs
          activeTab={activeTab}
          onChange={handleTabChange}
        />  

        {renderTabContent()} 

        <MenuItemModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          mode={modalState.mode}
          menuItem={modalState.menuItem}
        />  
      </div>
  )  
};

export default MenusAndRecipes;
 
