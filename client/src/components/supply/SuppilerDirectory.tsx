import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Search, Pencil, Eye, Archive, RotateCcw, Plus, Loader2, Building2,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  fetchSuppliers, createSupplier, updateSupplier, archiveSupplier, restoreSupplier,
} from "./api";
import { SUPPLY_QUERY_KEYS, type Supplier, type SupplierFormData } from "./supplier-types";

// ── Supplier modal ────────────────────────────────────────────────────────────

type ModalMode = 'add' | 'edit' | 'view';

const EMPTY_FORM: SupplierFormData = {
  name: '', category: '', contact_person: '',
  phone: '', email: '', payment_terms: '',
  lead_time_days: '1', notes: '',
};

const SupplierModal = ({
  isOpen, onClose, mode, supplier,
}: { isOpen: boolean; onClose: () => void; mode: ModalMode; supplier?: Supplier }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SupplierFormData>(EMPTY_FORM);

  useState(() => {
    if (mode === 'edit' && supplier) {
      setForm({
        name: supplier.name,
        category: supplier.category,
        contact_person: supplier.contact_person,
        phone: supplier.phone,
        email: supplier.email,
        payment_terms: supplier.payment_terms,
        lead_time_days: String(supplier.lead_time_days),
        notes: supplier.notes,
      });
    } else if (mode === 'add') {
      setForm(EMPTY_FORM);
    }
  });

  // Reset form when modal opens
  const [_init, setInit] = useState(false);
  if (!_init && isOpen) {
    setInit(true);
    if (mode === 'edit' && supplier) {
      setForm({
        name: supplier.name, category: supplier.category,
        contact_person: supplier.contact_person, phone: supplier.phone,
        email: supplier.email, payment_terms: supplier.payment_terms,
        lead_time_days: String(supplier.lead_time_days), notes: supplier.notes,
      });
    } else if (mode === 'add') {
      setForm(EMPTY_FORM);
    }
  }
  if (!isOpen && _init) setInit(false);

  const createMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: SUPPLY_QUERY_KEYS.SUPPLIERS }); alert("Supplier created!"); onClose(); },
    onError: (e: any) => alert(e.response?.data?.name?.[0] || "Failed to create supplier"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateSupplier(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: SUPPLY_QUERY_KEYS.SUPPLIERS }); alert("Supplier updated!"); onClose(); },
    onError: (e: any) => alert(e.response?.data?.detail || "Failed to update supplier"),
  });

  const handleSave = () => {
    if (!form.name.trim()) { alert("Supplier name is required"); return; }
    const payload = { ...form, lead_time_days: Number(form.lead_time_days) || 1 };
    if (mode === 'add') createMutation.mutate(payload as any);
    else if (mode === 'edit' && supplier) updateMutation.mutate({ id: supplier.id, data: payload });
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;
  const f = (key: keyof SupplierFormData, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label className="text-sm font-semibold text-gray-700 block mb-1">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? '➕ New Supplier' : mode === 'edit' ? '✏️ Edit Supplier' : '🏭 Supplier Details'}</DialogTitle>
        </DialogHeader>

        {mode === 'view' && supplier ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <p className="text-xs font-mono text-gray-400">{supplier.supplier_code}</p>
                <h3 className="text-xl font-bold">{supplier.name}</h3>
                {supplier.category && <p className="text-sm text-gray-500">{supplier.category}</p>}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${supplier.is_archived ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                {supplier.is_archived ? 'Archived' : 'Active'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Contact Person', supplier.contact_person],
                ['Phone', supplier.phone],
                ['Email', supplier.email],
                ['Payment Terms', supplier.payment_terms],
                ['Lead Time', `${supplier.lead_time_days} day(s)`],
                ['Total Deliveries', String(supplier.deliveries_count)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                  <p className="font-medium text-gray-900">{value || '—'}</p>
                </div>
              ))}
            </div>
            {supplier.notes && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{supplier.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label required>Supplier Name</Label>
                <Input placeholder="e.g., Zamboanga Meat Market" value={form.name} onChange={e => f('name', e.target.value)} className="h-10" />
              </div>
              <div>
                <Label>Category</Label>
                <Input placeholder="e.g., Meat Supplier" value={form.category} onChange={e => f('category', e.target.value)} className="h-10" />
              </div>
              <div>
                <Label>Contact Person</Label>
                <Input placeholder="e.g., Mr. Tan" value={form.contact_person} onChange={e => f('contact_person', e.target.value)} className="h-10" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input placeholder="e.g., 0917-555-0101" value={form.phone} onChange={e => f('phone', e.target.value)} className="h-10" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="e.g., sales@supplier.com" value={form.email} onChange={e => f('email', e.target.value)} className="h-10" />
              </div>
              <div>
                <Label>Payment Terms</Label>
                <Input placeholder='e.g., COD or "Net 15 Days"' value={form.payment_terms} onChange={e => f('payment_terms', e.target.value)} className="h-10" />
              </div>
              <div>
                <Label>Lead Time (days)</Label>
                <Input type="number" min="1" value={form.lead_time_days} onChange={e => f('lead_time_days', e.target.value)} className="h-10" />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <textarea rows={3} placeholder="Any additional notes..." value={form.notes} onChange={e => f('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {(mode === 'add' || mode === 'edit') && (
            <Button onClick={handleSave} disabled={isMutating} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              {isMutating && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'add' ? 'Add Supplier' : 'Save Changes'}
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const SupplierDirectory = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [selected, setSelected] = useState<Supplier | undefined>(undefined);

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: showArchived ? SUPPLY_QUERY_KEYS.SUPPLIERS_ALL : SUPPLY_QUERY_KEYS.SUPPLIERS,
    queryFn: () => fetchSuppliers(showArchived),
  });

  const archiveMutation = useMutation({
    mutationFn: archiveSupplier,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUPPLY_QUERY_KEYS.SUPPLIERS }),
    onError: (e: any) => alert(e.response?.data?.error || "Failed to archive"),
  });

  const restoreMutation = useMutation({
    mutationFn: restoreSupplier,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: SUPPLY_QUERY_KEYS.SUPPLIERS }); queryClient.invalidateQueries({ queryKey: SUPPLY_QUERY_KEYS.SUPPLIERS_ALL }); },
    onError: (e: any) => alert(e.response?.data?.error || "Failed to restore"),
  });

  const openModal = (mode: ModalMode, supplier?: Supplier) => {
    setModalMode(mode);
    setSelected(supplier);
    setModalOpen(true);
  };

  const filtered = suppliers.filter(s =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    s.contact_person.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-4 gap-y-4 border border-[#E5E5E5]">

      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search name, category or contact..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-72" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} className="rounded" />
            Show archived
          </label>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openModal('add')}>
          <Plus className="w-4 h-4" /> Add Supplier
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-[#F9FAFB]">
            <TableRow>
              <TableHead className="text-[#94979F]">Code</TableHead>
              <TableHead className="text-[#94979F]">Supplier Name</TableHead>
              <TableHead className="text-[#94979F]">Category</TableHead>
              <TableHead className="text-[#94979F]">Contact</TableHead>
              <TableHead className="text-[#94979F]">Lead Time</TableHead>
              <TableHead className="text-[#94979F]">Status</TableHead>
              <TableHead className="text-right text-[#94979F]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <Building2 className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">No suppliers found.</p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(s => (
                <TableRow key={s.id} className={`hover:bg-gray-50 ${s.is_archived ? 'opacity-60' : ''}`}>
                  <TableCell className="font-mono text-xs text-gray-400">{s.supplier_code}</TableCell>
                  <TableCell className="font-semibold">{s.name}</TableCell>
                  <TableCell className="text-gray-600">{s.category || '—'}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{s.contact_person || '—'}</p>
                      {s.phone && <p className="text-xs text-gray-400">{s.phone}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{s.lead_time_days}d</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.is_archived ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                      {s.is_archived ? 'Archived' : 'Active'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openModal('view', s)} className="p-1.5 hover:bg-gray-100 rounded" title="View"><Eye className="w-4 h-4 text-blue-600" /></button>
                      <button onClick={() => openModal('edit', s)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit"><Pencil className="w-4 h-4 text-green-600" /></button>
                      {s.is_archived ? (
                        <button onClick={() => restoreMutation.mutate(s.id)} className="p-1.5 hover:bg-green-50 rounded" title="Restore" disabled={restoreMutation.isPending}><RotateCcw className="w-4 h-4 text-green-600" /></button>
                      ) : (
                        <button
                          onClick={() => { if (window.confirm(`Archive "${s.name}"? Their purchase history will be preserved.`)) archiveMutation.mutate(s.id); }}
                          className="p-1.5 hover:bg-amber-50 rounded" title="Archive" disabled={archiveMutation.isPending}
                        >
                          <Archive className="w-4 h-4 text-amber-500" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && (
        <p className="text-xs text-gray-400 text-right">
          {filtered.length} supplier{filtered.length !== 1 ? 's' : ''}
          {showArchived ? ' (including archived)' : ''}
        </p>
      )}

      <SupplierModal isOpen={modalOpen} onClose={() => setModalOpen(false)} mode={modalMode} supplier={selected} />
    </div>
  );
};

export default SupplierDirectory;
