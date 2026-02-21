import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MenuItemView from "./MenuItemView";
import MenuItemEdit, { type MenuItemEditFormData } from "./MenuItemEdit";
import ModalActions from "@/components/ui/modal/ModalActions";
import { createMenuItem, updateMenuItem, deleteMenuItem } from "./api";
import { MENU_QUERY_KEYS } from ".";
import type { MenuItem } from ".";

export type ModalMode = 'view' | 'edit' | 'add';

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  menuItem?: MenuItem; 
}

const MenuItemModal = ({ isOpen, onClose, mode, menuItem }: MenuItemModalProps) => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<MenuItemEditFormData>({
    sku: '',
    name: '',
    menu_category: '',
    price: '0.00',
    is_available_cafe: false,
  });

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && menuItem) {
      setFormData({
        sku: menuItem.sku,
        name: menuItem.name,
        menu_category: '', // Will need to be populated from API if available
        price: menuItem.price,
        is_available_cafe: menuItem.is_available_cafe,
      });
    } else if (mode === 'add') {
      // Reset form for add mode
      setFormData({
        sku: '',
        name: '',
        menu_category: '',
        price: '0.00',
        is_available_cafe: false,
      });
    }
  }, [mode, menuItem, isOpen]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.MENU_ITEMS });
      alert("Menu item created successfully");
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to create menu item");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MenuItemEditFormData> }) =>
      updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.MENU_ITEMS });
      alert("Menu item updated successfully");
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to update menu item");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.MENU_ITEMS });
      alert("Menu item deleted successfully");
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to delete menu item");
    },
  });

  const handleSave = () => {
    // Validation
    if (!formData.sku.trim()) {
      alert("SKU is required");
      return;
    }
    if (!formData.name.trim()) {
      alert("Item name is required");
      return;
    }
    if (!formData.menu_category) {
      alert("Please select a category");
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      alert("Valid selling price is required");
      return;
    }

    const payload = {
      sku: formData.sku.trim(),
      name: formData.name.trim(),
      menu_category: Number(formData.menu_category),
      price: Number(formData.price),
      is_available_cafe: formData.is_available_cafe,
    };

    if (mode === 'add') {
      createMutation.mutate(payload);
    } else if (mode === 'edit' && menuItem) {
      updateMutation.mutate({ id: menuItem.id, data: payload as any });
    }
  };

  const handleDelete = () => {
    if (!menuItem) return;
    
    if (window.confirm(`Are you sure you want to delete "${menuItem.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(menuItem.id);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'view':
        return '🍽️ View Menu Item';
      case 'edit':
        return '✏️ Edit Menu Item';
      case 'add':
        return '🍽️ Add New Menu Item';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {mode === 'view' && menuItem ? (
            <MenuItemView menuItem={menuItem} />
          ) : (
            <MenuItemEdit
              menuItem={menuItem}
              formData={formData}
              onChange={setFormData}
            />
          )}
        </div>

        <DialogFooter>
          <ModalActions
            mode={mode}
            onClose={onClose}
            onSave={handleSave}
            onDelete={mode === 'view' ? handleDelete : undefined}
            isSaving={createMutation.isPending || updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemModal;
