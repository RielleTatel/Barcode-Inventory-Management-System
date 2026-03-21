import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus, X, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAllMenuItems } from "@/components/menus&Recipes/api";
import { MENU_QUERY_KEYS } from "@/components/menus&Recipes";
import { fetchAllInventoryItems, submitConsumption } from "./api";
import { INVENTORY_QUERY_KEYS } from ".";

type SoldRow = {
  id: number;
  menuItemId: string;
  unitsSold: string;
};

type ManualAdjustment = {
  id: number;
  itemName: string;
  amountUsed: string;
  unit: string;
  reason: string;
};

const Consumption = () => {
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading: menuLoading } = useQuery({
    queryKey: MENU_QUERY_KEYS.MENU_ITEMS,
    queryFn: fetchAllMenuItems,
  });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.INVENTORY_ITEMS,
    queryFn: fetchAllInventoryItems,
  });

  // Only menu items that have a registered Prepared Items inventory entry
  const linkedMenuItemIds = new Set(
    inventoryItems
      .filter((item) => item.category_name === 'Prepared Items' && item.linked_menu_item_details)
      .map((item) => item.linked_menu_item_details!.id)
  );
  const preparedMenuItems = menuItems.filter((m) => linkedMenuItemIds.has(m.id));

  const [branch, setBranch] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const [soldRows, setSoldRows] = useState<SoldRow[]>([
    { id: Date.now(), menuItemId: "", unitsSold: "" },
  ]);

  const [manualAdjustments, setManualAdjustments] = useState<ManualAdjustment[]>([]);

  const submitMutation = useMutation({
    mutationFn: submitConsumption,
    onSuccess: (result) => {
      // Refresh inventory and BOM tables
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.INVENTORY_ITEMS });
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.BOM_ENTRIES });

      let msg = result.message;
      if (result.unmatched?.length) {
        msg += `\n\nWarning — the following ingredients were NOT matched to any inventory item (no stock was deducted):\n• ${result.unmatched.join("\n• ")}`;
        msg += `\n\nTip: Start ingredient names with the inventory SKU, e.g. "RM-005 Longanisa".`;
      }
      alert(msg);

      // Reset form
      setSoldRows([{ id: Date.now(), menuItemId: "", unitsSold: "" }]);
      setManualAdjustments([]);
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || "Failed to submit consumption entry.");
    },
  });

  const handleSubmit = () => {
    if (!date) {
      alert("Please select a reporting date.");
      return;
    }
    const validRows = soldRows.filter((r) => r.menuItemId && r.unitsSold && Number(r.unitsSold) > 0);
    if (validRows.length === 0) {
      alert("Please add at least one menu item with a valid quantity sold.");
      return;
    }

    submitMutation.mutate({
      date,
      branch_name: branch,
      menu_items_sold: validRows.map((r) => ({
        menu_item_id: Number(r.menuItemId),
        units_sold: Number(r.unitsSold),
      })),
    });
  };

  // ── Sold rows helpers ──────────────────────────────────────────
  const addSoldRow = () => {
    setSoldRows((prev) => [...prev, { id: Date.now(), menuItemId: "", unitsSold: "" }]);
  };

  const removeSoldRow = (id: number) => {
    setSoldRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateSoldRow = (id: number, field: keyof Omit<SoldRow, "id">, value: string) => {
    setSoldRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // ── Manual adjustment helpers ──────────────────────────────────
  const addManualAdjustment = () => {
    setManualAdjustments((prev) => [
      ...prev,
      { id: Date.now(), itemName: "", amountUsed: "", unit: "", reason: "" },
    ]);
  };

  const removeManualAdjustment = (id: number) => {
    setManualAdjustments((prev) => prev.filter((r) => r.id !== id));
  };

  const updateManualAdjustment = (
    id: number,
    field: keyof Omit<ManualAdjustment, "id">,
    value: string
  ) => {
    setManualAdjustments((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  return (
    <>
      <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-4 gap-y-10 border border-[#E5E5E5]">
        {/* Header */}
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-row gap-x-2 items-center">
            <span className="text-2xl">📋</span>
            <p>
              <span className="font-bold text-3xl">End-of-Shift Consumption Entry</span>
            </p>
          </div>
          <p>Log today's sales and usage to update inventory levels.</p>
        </div>

        {/* Branch and Date Selection */}
        <div className="gap-4 bg-[#F9F9F9] flex flex-row py-4 px-6 gap-x-28 justify-start items-center rounded-[12px]">
          <div className="flex flex-col gap-y-2 w-64">
            <label className="font-semibold">Branch Name</label>
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Restaurant Branch 1">Restaurant Branch 1</SelectItem>
                  <SelectItem value="Restaurant Branch 2">Restaurant Branch 2</SelectItem>
                  <SelectItem value="Restaurant Branch 3">Restaurant Branch 3</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-y-2 w-64">
            <label className="font-semibold">Reporting Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Menu Items Sold Section */}
        <div className="flex flex-col gap-y-3">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-y-1">
              <p className="font-bold text-xl">Menu Items Sold (Auto-Calculates Raw Materials)</p>
              <p className="text-sm text-gray-500">
                Select each menu item sold this shift and enter the quantity.
              </p>
            </div>
            <Button onClick={addSoldRow} variant="outline" className="gap-x-2">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>

          {preparedMenuItems.length === 0 && !menuLoading ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              No prepared dishes are registered in Inventory Management yet. Go to
              <span className="font-semibold"> Inventories → Add Inventory</span>, choose
              category <span className="font-semibold">Prepared Items</span>, and link it
              to the corresponding menu item.
            </div>
          ) : (
          <div className="rounded-tl-xl rounded-tr-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-[#F9FAFB]">
                <TableRow>
                  <TableHead className="text-bold text-[#94979F]">Prepared Dish</TableHead>
                  <TableHead className="text-bold text-[#94979F]">Category</TableHead>
                  <TableHead className="text-bold text-[#94979F] w-32">Units Sold</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {soldRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                      No items added yet. Click "Add Item" to start.
                    </TableCell>
                  </TableRow>
                ) : (
                  soldRows.map((row) => {
                    const selected = preparedMenuItems.find(
                      (m) => m.id.toString() === row.menuItemId
                    );
                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Select
                            value={row.menuItemId}
                            onValueChange={(val) => updateSoldRow(row.id, "menuItemId", val)}
                            disabled={menuLoading}
                          >
                            <SelectTrigger className="w-64">
                              <SelectValue
                                placeholder={
                                  menuLoading ? (
                                    <span className="flex items-center gap-1 text-gray-400">
                                      <Loader2 className="w-3 h-3 animate-spin" /> Loading…
                                    </span>
                                  ) : (
                                    "Select prepared dish"
                                  )
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Registered Prepared Dishes</SelectLabel>
                                {preparedMenuItems.map((item) => (
                                  <SelectItem key={item.id} value={item.id.toString()}>
                                    {item.sku} — {item.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {selected?.menu_category_name ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={row.unitsSold}
                            onChange={(e) =>
                              updateSoldRow(row.id, "unitsSold", e.target.value)
                            }
                            placeholder="0"
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => removeSoldRow(row.id)}
                            className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600"
                            title="Remove row"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          )}

          <p className="text-sm text-gray-600 italic">
            * The system will use the recipe (BOM) to deduct raw materials automatically.
          </p>
        </div>

        {/* Manual Raw Material Adjustment Section */}
        <div className="flex flex-col gap-y-3">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-y-1">
              <p className="font-bold text-xl">Manual Raw Material Adjustment</p>
              <p className="text-sm text-gray-600 italic">
                Use this only for items not tied to a recipe (e.g., cleaning supplies, bulk oil usage).
              </p>
            </div>
            <Button onClick={addManualAdjustment} variant="outline" className="gap-x-2">
              <Plus className="w-4 h-4" />
              Add Row
            </Button>
          </div>

          <div className="rounded-tl-xl rounded-tr-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-[#F9FAFB]">
                <TableRow>
                  <TableHead className="text-bold text-[#94979F]">Item Name</TableHead>
                  <TableHead className="text-bold text-[#94979F]">Amount Used</TableHead>
                  <TableHead className="text-bold text-[#94979F]">Unit</TableHead>
                  <TableHead className="text-bold text-[#94979F]">Reason</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {manualAdjustments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                      No manual adjustments added yet. Click "Add Row" to start.
                    </TableCell>
                  </TableRow>
                ) : (
                  manualAdjustments.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.itemName}
                          onChange={(e) =>
                            updateManualAdjustment(item.id, "itemName", e.target.value)
                          }
                          placeholder="e.g., Cooking Oil"
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.amountUsed}
                          onChange={(e) =>
                            updateManualAdjustment(item.id, "amountUsed", e.target.value)
                          }
                          step="0.1"
                          placeholder="0.0"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.unit}
                          onChange={(e) =>
                            updateManualAdjustment(item.id, "unit", e.target.value)
                          }
                          placeholder="e.g., L, kg"
                          className="w-28"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.reason}
                          onChange={(e) =>
                            updateManualAdjustment(item.id, "reason", e.target.value)
                          }
                          placeholder="Enter reason"
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => removeManualAdjustment(item.id)}
                          className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600"
                          title="Remove row"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base"
          >
            {submitMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting…
              </span>
            ) : (
              "Submit Consumption Data"
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Consumption;