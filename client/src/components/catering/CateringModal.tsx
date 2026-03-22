import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, X, ChefHat, Calendar, Users, MapPin, Phone, FileText,
  UtensilsCrossed, ChevronDown, Loader2, Printer,
} from "lucide-react";
import {
  fetchCateringDishes, fetchKitchenSheet,
  createCateringEvent, updateCateringEvent, deleteCateringEvent,
} from "./api";
import {
  CATERING_QUERY_KEYS, PACKAGE_OPTIONS, STATUS_OPTIONS,
  type CateringEvent, type CateringFormData, type PackageType, type CateringStatus,
} from ".";
import { fetchBranches } from "@/components/inventory/api";
import { INVENTORY_QUERY_KEYS } from "@/components/inventory";

export type CateringModalMode = 'view' | 'edit' | 'add' | 'kitchen_sheet';

interface CateringModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: CateringModalMode;
  event?: CateringEvent;
}

const EMPTY_FORM: CateringFormData = {
  client_name: '',
  contact_number: '',
  event_date: new Date().toISOString().split('T')[0],
  venue: '',
  pax: '1',
  package_type: 'custom',
  items_ordered: [],
  status: 'pending',
  prep_branch: null,
  notes: '',
};

// ── Small helpers ─────────────────────────────────────────────────────────────

const PackageBadge = ({ type }: { type: string }) => {
  const opt = PACKAGE_OPTIONS.find(o => o.value === type);
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${opt?.color ?? 'bg-gray-100 text-gray-600'}`}>
      {opt?.label ?? type}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const opt = STATUS_OPTIONS.find(o => o.value === status);
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${opt?.color ?? 'bg-gray-100 text-gray-600'}`}>
      {opt?.label ?? status}
    </span>
  );
};

// ── Kitchen Sheet sub-view ────────────────────────────────────────────────────

const KitchenSheetView = ({ eventId }: { eventId: number }) => {
  const { data: sheet, isLoading } = useQuery({
    queryKey: [...CATERING_QUERY_KEYS.EVENTS, eventId, 'kitchen_sheet'],
    queryFn: () => fetchKitchenSheet(eventId),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
    </div>
  );
  if (!sheet) return null;

  return (
    <div className="space-y-6 font-sans print:p-8">
      {/* KS Header */}
      <div className="flex items-start justify-between pb-4 border-b-2 border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Kitchen Sheet</h2>
          </div>
          <p className="text-lg font-mono text-gray-500 mt-0.5">{sheet.kitchen_sheet_number}</p>
        </div>
        <StatusBadge status={sheet.status} />
      </div>

      {/* Event Info Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
        <div><span className="text-gray-500">Client</span><p className="font-bold text-lg text-gray-900">{sheet.client_name}</p></div>
        <div><span className="text-gray-500">Contact</span><p className="font-semibold text-gray-900">{sheet.contact_number || '—'}</p></div>
        <div><span className="text-gray-500">Event Date</span><p className="font-semibold text-gray-900">{new Date(sheet.event_date + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
        <div><span className="text-gray-500">Pax</span><p className="font-semibold text-gray-900">{sheet.pax} guests</p></div>
        <div><span className="text-gray-500">Venue</span><p className="font-semibold text-gray-900">{sheet.venue || '—'}</p></div>
        <div><span className="text-gray-500">Package</span><div className="mt-0.5"><PackageBadge type={sheet.package_type} /></div></div>
        <div><span className="text-gray-500">Prep Branch</span><p className="font-semibold text-gray-900">{sheet.prep_branch_name || '—'}</p></div>
      </div>

      {/* Dishes + Ingredients */}
      <div>
        <h3 className="font-bold text-base text-gray-800 mb-3 flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-orange-500" />
          Dishes & Raw Materials Required
        </h3>
        {sheet.items_with_recipes.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No dishes selected.</p>
        ) : (
          <div className="space-y-3">
            {sheet.items_with_recipes.map(dish => (
              <div key={dish.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                  <div>
                    <span className="font-mono text-xs text-gray-400 mr-2">{dish.sku}</span>
                    <span className="font-semibold text-gray-900">{dish.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">₱{parseFloat(dish.price).toFixed(2)}</span>
                </div>
                {dish.recipes.length === 0 ? (
                  <p className="px-4 py-2 text-xs text-gray-400 italic">No recipe on file.</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="text-gray-500 uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-1.5 text-left font-medium">Ingredient</th>
                        <th className="px-4 py-1.5 text-right font-medium">Qty (per serving)</th>
                        <th className="px-4 py-1.5 text-right font-medium">Qty for {sheet.pax} pax</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dish.recipes.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-1.5 font-mono text-gray-700">{r.ingredient_name}</td>
                          <td className="px-4 py-1.5 text-right text-gray-600">{parseFloat(r.quantity_required).toFixed(3)} {r.unit}</td>
                          <td className="px-4 py-1.5 text-right font-semibold text-gray-900">
                            {(parseFloat(r.quantity_required) * sheet.pax).toFixed(2)} {r.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      {sheet.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-amber-700 mb-1">Notes</p>
          <p className="text-sm text-amber-900 whitespace-pre-wrap">{sheet.notes}</p>
        </div>
      )}
    </div>
  );
};

// ── View sub-view ─────────────────────────────────────────────────────────────

const EventView = ({ event }: { event: CateringEvent }) => {
  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <div className="font-semibold text-gray-900 text-sm mt-0.5">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-400 font-mono">{event.kitchen_sheet_number}</p>
          <h3 className="text-xl font-bold text-gray-900">{event.client_name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <PackageBadge type={event.package_type} />
          <StatusBadge status={event.status} />
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-5">
        <InfoRow icon={<Calendar className="w-4 h-4 text-blue-500" />} label="Event Date" value={new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
        <InfoRow icon={<Users className="w-4 h-4 text-emerald-500" />} label="Pax" value={`${event.pax} guests`} />
        <InfoRow icon={<MapPin className="w-4 h-4 text-red-500" />} label="Venue" value={event.venue || '—'} />
        <InfoRow icon={<Phone className="w-4 h-4 text-purple-500" />} label="Contact" value={event.contact_number || '—'} />
        <InfoRow icon={<ChefHat className="w-4 h-4 text-orange-500" />} label="Prep Branch" value={event.prep_branch_name || '—'} />
      </div>

      {/* Dishes */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <UtensilsCrossed className="w-4 h-4 text-gray-500" />
          <p className="font-semibold text-sm text-gray-700">
            Dishes Ordered ({event.items_ordered_details?.length ?? (event.items_ordered_names?.length ?? 0)})
          </p>
        </div>
        {(event.items_ordered_details ?? []).length > 0 ? (
          <div className="space-y-1.5">
            {(event.items_ordered_details ?? []).map(dish => (
              <div key={dish.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-400">{dish.sku}</span>
                  <span className="text-sm font-medium text-gray-800">{dish.name}</span>
                </div>
                <span className="text-xs font-semibold text-emerald-600">₱{parseFloat(dish.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (event.items_ordered_names ?? []).length > 0 ? (
          <div className="space-y-1.5">
            {(event.items_ordered_names ?? []).map((name, i) => (
              <div key={i} className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-700">{name}</div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No dishes selected.</p>
        )}
      </div>

      {event.notes && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-3.5 h-3.5 text-gray-500" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</p>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{event.notes}</p>
        </div>
      )}
    </div>
  );
};

// ── Edit / Add form ───────────────────────────────────────────────────────────

const EventForm = ({
  formData,
  onChange,
  isEdit,
}: {
  formData: CateringFormData;
  onChange: (data: CateringFormData) => void;
  isEdit: boolean;
}) => {
  const { data: dishes = [], isLoading: dishesLoading } = useQuery({
    queryKey: CATERING_QUERY_KEYS.DISHES,
    queryFn: fetchCateringDishes,
  });

  const { data: branches = [] } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.BRANCHES,
    queryFn: fetchBranches,
  });

  const [dishSearch, setDishSearch] = useState('');
  const [showDishDropdown, setShowDishDropdown] = useState(false);
  const dishDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dishDropdownRef.current && !dishDropdownRef.current.contains(e.target as Node))
        setShowDishDropdown(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const filteredDishes = dishes.filter(d =>
    !formData.items_ordered.includes(d.id) &&
    (d.name.toLowerCase().includes(dishSearch.toLowerCase()) ||
     d.sku.toLowerCase().includes(dishSearch.toLowerCase()))
  );

  const addDish = (id: number) => {
    onChange({ ...formData, items_ordered: [...formData.items_ordered, id] });
    setDishSearch('');
  };

  const removeDish = (id: number) => {
    onChange({ ...formData, items_ordered: formData.items_ordered.filter(i => i !== id) });
  };

  const field = (f: keyof CateringFormData, value: string | number | null) =>
    onChange({ ...formData, [f]: value });

  const selectedDishObjects = dishes.filter(d => formData.items_ordered.includes(d.id));

  const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label className="text-sm font-semibold text-gray-700 block mb-1.5">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  return (
    <div className="space-y-5">
      {/* Client info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Client Name</Label>
          <Input placeholder="e.g., Juan dela Cruz" value={formData.client_name} onChange={e => field('client_name', e.target.value)} className="h-10" />
        </div>
        <div>
          <Label>Contact Number</Label>
          <Input placeholder="e.g., 09XX-XXX-XXXX" value={formData.contact_number} onChange={e => field('contact_number', e.target.value)} className="h-10" />
        </div>
      </div>

      {/* Event details */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label required>Event Date</Label>
          <Input type="date" value={formData.event_date} onChange={e => field('event_date', e.target.value)} className="h-10" />
        </div>
        <div>
          <Label required>Pax (guests)</Label>
          <Input type="number" min="1" value={formData.pax} onChange={e => field('pax', e.target.value)} className="h-10" />
        </div>
        <div>
          <Label required>Package</Label>
          <select value={formData.package_type} onChange={e => field('package_type', e.target.value as PackageType)}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {PACKAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Venue + branch */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Venue</Label>
          <Input placeholder="e.g., Grand Ballroom, Makati" value={formData.venue} onChange={e => field('venue', e.target.value)} className="h-10" />
        </div>
        <div>
          <Label>Prep Branch (Kitchen)</Label>
          <select value={formData.prep_branch?.toString() ?? ''} onChange={e => field('prep_branch', e.target.value ? Number(e.target.value) : null)}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Not assigned</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      {/* Status (edit only) */}
      {isEdit && (
        <div className="w-48">
          <Label>Status</Label>
          <select value={formData.status} onChange={e => field('status', e.target.value as CateringStatus)}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )}

      {/* Dish multi-select */}
      <div>
        <Label>Dishes Ordered</Label>
        <p className="text-xs text-gray-500 -mt-1 mb-2">Search and add multiple dishes. Click the × to remove.</p>

        {/* Search dropdown */}
        <div className="relative" ref={dishDropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={dishesLoading ? "Loading dishes..." : "Search and add a dish..."}
              value={dishSearch}
              onChange={e => { setDishSearch(e.target.value); setShowDishDropdown(true); }}
              onFocus={() => setShowDishDropdown(true)}
              className="h-10 pl-9"
              disabled={dishesLoading}
            />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {showDishDropdown && filteredDishes.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
              {filteredDishes.map(dish => (
                <div key={dish.id}
                  className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors border-b last:border-0"
                  onMouseDown={e => { e.preventDefault(); addDish(dish.id); setShowDishDropdown(false); }}
                >
                  <div>
                    <span className="font-mono text-xs text-gray-400 mr-2">{dish.sku}</span>
                    <span className="text-sm text-gray-900">{dish.name}</span>
                    <span className="text-xs text-gray-400 ml-2">({dish.menu_category_name})</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">₱{parseFloat(dish.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected dishes as tags */}
        {selectedDishObjects.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedDishObjects.map(dish => (
              <span key={dish.id} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-sm bg-blue-50 text-blue-800 border border-blue-200">
                <span className="font-mono text-xs text-blue-400">{dish.sku}</span>
                {dish.name}
                <button type="button" onClick={() => removeDish(dish.id)} className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-200 transition-colors">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <Label>Notes / Special Instructions</Label>
        <textarea
          rows={3}
          placeholder="Any special requests, dietary restrictions, or setup notes..."
          value={formData.notes}
          onChange={e => field('notes', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

// ── Main modal ────────────────────────────────────────────────────────────────

const CateringModal = ({ isOpen, onClose, mode, event }: CateringModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CateringFormData>(EMPTY_FORM);

  useEffect(() => {
    if (mode === 'edit' && event) {
      setFormData({
        client_name: event.client_name,
        contact_number: event.contact_number,
        event_date: event.event_date,
        venue: event.venue,
        pax: String(event.pax),
        package_type: event.package_type,
        items_ordered: event.items_ordered,
        status: event.status,
        prep_branch: event.prep_branch,
        notes: event.notes,
      });
    } else if (mode === 'add') {
      setFormData(EMPTY_FORM);
    }
  }, [mode, event, isOpen]);

  const createMutation = useMutation({
    mutationFn: createCateringEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATERING_QUERY_KEYS.EVENTS });
      alert("Catering event created successfully!");
      onClose();
    },
    onError: (e: any) => alert(e.response?.data?.detail || "Failed to create catering event"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateCateringEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATERING_QUERY_KEYS.EVENTS });
      alert("Catering event updated successfully!");
      onClose();
    },
    onError: (e: any) => alert(e.response?.data?.detail || "Failed to update catering event"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCateringEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATERING_QUERY_KEYS.EVENTS });
      onClose();
    },
    onError: (e: any) => alert(e.response?.data?.detail || "Failed to delete event"),
  });

  const handleSave = () => {
    if (!formData.client_name.trim()) { alert("Client name is required"); return; }
    if (!formData.event_date) { alert("Event date is required"); return; }
    if (!formData.pax || Number(formData.pax) < 1) { alert("Pax must be at least 1"); return; }

    const payload = {
      ...formData,
      pax: Number(formData.pax),
    };

    if (mode === 'add') {
      createMutation.mutate(payload as any);
    } else if (mode === 'edit' && event) {
      updateMutation.mutate({ id: event.id, data: payload });
    }
  };

  const handleDelete = () => {
    if (!event) return;
    if (window.confirm(`Delete catering event for "${event.client_name}"? This cannot be undone.`)) {
      deleteMutation.mutate(event.id);
    }
  };

  const title = {
    add: '🍽 New Catering Event',
    edit: '✏️ Edit Catering Event',
    view: '📋 Catering Event Details',
    kitchen_sheet: '👨‍🍳 Kitchen Sheet',
  }[mode];

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[860px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          {mode === 'kitchen_sheet' && event && <KitchenSheetView eventId={event.id} />}
          {mode === 'view' && event && <EventView event={event} />}
          {(mode === 'add' || mode === 'edit') && (
            <EventForm formData={formData} onChange={setFormData} isEdit={mode === 'edit'} />
          )}
        </div>

        <DialogFooter className="gap-2">
          {mode === 'kitchen_sheet' && (
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Print
            </Button>
          )}
          {mode === 'view' && event && (
            <Button
              variant="outline"
              className="gap-2 text-red-500 border-red-200 hover:bg-red-50"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Event'}
            </Button>
          )}
          {(mode === 'add' || mode === 'edit') && (
            <Button onClick={handleSave} disabled={isMutating} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
              {isMutating && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'add' ? 'Create Event' : 'Save Changes'}
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CateringModal;
