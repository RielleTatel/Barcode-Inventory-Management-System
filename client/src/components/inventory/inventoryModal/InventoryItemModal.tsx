import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import ModalActions from "@/components/ui/modal/ModalActions";
import InventoryEdit, { type InventoryEditFormData } from "./InventoryEdit";
import InventoryView from "./InventoryView";
import { createInventoryItem, updateInventoryItem, deleteInventoryItem } from "../api";
import { INVENTORY_QUERY_KEYS, type InventoryItem } from "..";

export type ModalMode = 'view' | 'edit' | 'add';

export interface inventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  inventoryData?: InventoryItem;
}

const InventoryItemModal = ({ isOpen, onClose, mode, inventoryData }: inventoryModalProps) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<InventoryEditFormData>({
    sku: '',
    name: '',
    category: null,
    category_name: '',
    uom: '',
    current_stock: '0',
    min_stock_level: '0',
    linked_menu_item: null,
  });

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && inventoryData) {
      setFormData({
        sku: inventoryData.sku,
        name: inventoryData.name,
        category: inventoryData.category,
        category_name: inventoryData.category_name,
        uom: inventoryData.uom,
        current_stock: inventoryData.current_stock,
        min_stock_level: inventoryData.min_stock_level,
        linked_menu_item: inventoryData.linked_menu_item_details?.id || null,
      });
    } else if (mode === 'add') {
      setFormData({
        sku: '',
        name: '',
        category: null,
        category_name: '',
        uom: '',
        current_stock: '0',
        min_stock_level: '0',
        linked_menu_item: null,
      });
    }
  }, [mode, inventoryData, isOpen]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.INVENTORY_ITEMS });
      alert("Inventory item created successfully");
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || error.response?.data?.sku?.[0] || "Failed to create inventory item");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InventoryEditFormData> }) =>
      updateInventoryItem(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.INVENTORY_ITEMS });
      alert("Inventory item updated successfully");
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to update inventory item");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.INVENTORY_ITEMS });
      alert("Inventory item deleted successfully");
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to delete inventory item");
    },
  });

  const handleSave = () => {
    // Validation
    if (!formData.category) {
      alert("Please select a category");
      return;
    }
    if (!formData.sku.trim()) {
      alert("SKU is required");
      return;
    }
    if (!formData.name.trim()) {
      alert("Item name is required");
      return;
    }
    if (!formData.uom) {
      alert("Please select a unit of measure");
      return;
    }
    if (!formData.min_stock_level || Number(formData.min_stock_level) < 0) {
      alert("Valid minimum stock level is required");
      return;
    }
    // If Prepared Items, linked menu item is required
    if (formData.category_name === 'Prepared Items' && !formData.linked_menu_item) {
      alert("Please select a menu item to link");
      return;
    }

    const payload = {
      sku: formData.sku.trim().toUpperCase(),
      name: formData.name.trim(),
      category: formData.category,
      uom: formData.uom,
      current_stock: formData.current_stock,
      min_stock_level: formData.min_stock_level,
      linked_menu_item: formData.linked_menu_item,
    };

    if (mode === 'add') {
      createMutation.mutate(payload as any);
    } else if (mode === 'edit' && inventoryData) {
      updateMutation.mutate({ id: inventoryData.id, data: payload as any });
    }
  };

  const handleDelete = () => {
    if (!inventoryData) return;

    if (window.confirm(`Are you sure you want to delete "${inventoryData.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(inventoryData.id);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'view':
        return '📦 View Inventory Item';
      case 'edit':
        return '✏️ Edit Inventory Item';
      case 'add':
        return '📦 Add New Inventory Item';
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
          {mode === 'view' && inventoryData ? (
            <InventoryView inventoryItem={inventoryData} />
          ) : (
            <InventoryEdit
              inventoryItem={inventoryData}
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

export default InventoryItemModal;
