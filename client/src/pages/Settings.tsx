import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  GitBranch, BookOpen, History, Plus, Pencil, Trash2,
  Check, X, Search, Download, Loader2, ToggleLeft, ToggleRight,
  Phone, MapPin, ArrowRightLeft,
} from "lucide-react";
import {
  fetchBranches, createBranch, updateBranch, deleteBranch,
  fetchInventoryCategories, createInventoryCategory, deleteUomPreset,
  fetchUomPresets, createUomPreset, updateUomPreset,
} from "@/components/inventory/api";
import { deleteInventoryCategory } from "@/components/inventory/api";
import { INVENTORY_QUERY_KEYS, type Branch, type InventoryCategory, type UomPreset } from "@/components/inventory";
import { fetchTransferLogs } from "@/components/inventory/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'branches',  label: 'Branches',           icon: GitBranch },
  { key: 'standards', label: 'Standards',          icon: BookOpen },
  { key: 'history',   label: 'Transfer History',   icon: History },
] as const;
type TabKey = typeof TABS[number]['key'];

const TRANSFER_QUERY_KEY = ['settings', 'transfers'];

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

// ── Tab: Branches ─────────────────────────────────────────────────────────────

const EMPTY_BRANCH: { name: string; branch_type: 'kitchen' | 'cafe_only'; address: string; contact_number: string; is_active: boolean } = {
  name: '', branch_type: 'kitchen', address: '', contact_number: '', is_active: true,
};

const BranchesTab = () => {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState(EMPTY_BRANCH);

  const { data: branches = [], isLoading } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.BRANCHES,
    queryFn: fetchBranches,
  });

  const createMutation = useMutation({
    mutationFn: createBranch,
    onSuccess: () => { qc.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.BRANCHES }); setModalOpen(false); },
    onError: (e: any) => alert(e.response?.data?.name?.[0] ?? 'Failed to create branch'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof form }) => updateBranch(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.BRANCHES }); setModalOpen(false); },
    onError: (e: any) => alert(e.response?.data?.name?.[0] ?? 'Failed to update branch'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => qc.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.BRANCHES }),
    onError: () => alert('Cannot delete this branch — it may have existing stock records.'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) => updateBranch(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.BRANCHES }),
  });

  const openAdd = () => { setEditing(null); setForm(EMPTY_BRANCH); setModalOpen(true); };
  const openEdit = (b: Branch) => {
    setEditing(b);
    setForm({ name: b.name, branch_type: b.branch_type, address: b.address, contact_number: b.contact_number, is_active: b.is_active });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { alert('Branch name is required'); return; }
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;
  const f = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="flex flex-col gap-y-5">

      <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-[#F9FAFB]">
            <TableRow>
              <TableHead>Branch Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Dashboard</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></TableCell></TableRow>
            ) : branches.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">No branches yet</TableCell></TableRow>
            ) : branches.map(b => (
              <TableRow key={b.id} className={`hover:bg-gray-50 ${b.is_active ? '' : 'opacity-60'}`}>
                <TableCell className="font-semibold">{b.name}</TableCell>
                <TableCell>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {b.branch_type === 'kitchen' ? 'Full-Service' : 'Café Only'}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-500 max-w-[150px]">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{b.address || '—'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  <div className="flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{b.contact_number || '—'}</div>
                </TableCell>
                <TableCell>
                  <button onClick={() => toggleActiveMutation.mutate({ id: b.id, is_active: !b.is_active })}
                    className="flex items-center gap-1.5 text-sm" title={b.is_active ? 'Click to hide from dashboard' : 'Click to show on dashboard'}>
                    {b.is_active
                      ? <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-green-600 text-xs font-medium">Visible</span></>
                      : <><ToggleLeft className="w-5 h-5 text-gray-400" /><span className="text-gray-400 text-xs font-medium">Hidden</span></>
                    }
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-gray-100 rounded"><Pencil className="w-4 h-4 text-blue-500" /></button>
                    <button onClick={() => { if (window.confirm(`Delete branch "${b.name}"?`)) deleteMutation.mutate(b.id); }}
                      className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table> 
      </div> 

      <div className="flex justify-end">
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Branch
        </Button>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-semibold mb-1.5 block">Branch Name *</label>
              <Input value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g., Tetuan Branch" />
            </div>
            <div><label className="text-sm font-semibold mb-1.5 block">Type *</label>
              <Select value={form.branch_type} onValueChange={v => f('branch_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kitchen">Full-Service Restaurant</SelectItem>
                  <SelectItem value="cafe_only">Resto Café (No Cooking)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-semibold mb-1.5 block">Address</label>
              <Input value={form.address} onChange={e => f('address', e.target.value)} placeholder="Physical address" />
            </div>
            <div><label className="text-sm font-semibold mb-1.5 block">Contact Number</label>
              <Input value={form.contact_number} onChange={e => f('contact_number', e.target.value)} placeholder="e.g., 0917-123-4567" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-semibold">Show in Dashboard</p>
                <p className="text-xs text-gray-400">Uncheck to hide from analytics</p>
              </div>
              <button onClick={() => f('is_active', !form.is_active)}>
                {form.is_active
                  ? <ToggleRight className="w-8 h-8 text-green-500" />
                  : <ToggleLeft className="w-8 h-8 text-gray-400" />
                }
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={isMutating} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              {isMutating && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? 'Save Changes' : 'Add Branch'}
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Tab: Standards (Categories + UoM) ─────────────────────────────────────────

const CategoryManager = () => {
  const qc = useQueryClient();
  const [newName, setNewName] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.INVENTORY_CATEGORIES,
    queryFn: fetchInventoryCategories,
  });

  const createMutation = useMutation({
    mutationFn: () => createInventoryCategory(newName.trim()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.INVENTORY_CATEGORIES }); setNewName(''); },
    onError: (e: any) => alert(e.response?.data?.name?.[0] ?? 'Failed to create category'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInventoryCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.INVENTORY_CATEGORIES }),
    onError: (e: any) => alert(e.response?.data?.error ?? 'Cannot delete — category still has items'),
  });

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-5">
      <h3 className="font-bold text-sm text-gray-700 mb-4">Inventory Categories</h3>
      <div className="flex gap-2 mb-4">
        <Input placeholder="New category name…" value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) createMutation.mutate(); }}
          className="flex-1" />
        <Button onClick={() => { if (newName.trim()) createMutation.mutate(); }} disabled={createMutation.isPending || !newName.trim()}
          className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>
      <div className="space-y-1 max-h-64 overflow-auto">
        {categories.map((c: InventoryCategory) => (
          <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 group">
            <div>
              <span className="text-sm font-medium">{c.name}</span>
              <span className="ml-2 text-xs text-gray-400">{c.items_count} item{c.items_count !== 1 ? 's' : ''}</span>
            </div>
            <button onClick={() => { if (window.confirm(`Delete category "${c.name}"?`)) deleteMutation.mutate(c.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-400 transition-opacity">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {categories.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No categories yet</p>}
      </div>
    </div>
  );
};

const UomManager = () => {
  const qc = useQueryClient();
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', abbreviation: '' });
  const UOM_QUERY_KEY = ['inventory', 'uoms'];

  const { data: uoms = [] } = useQuery({ queryKey: UOM_QUERY_KEY, queryFn: fetchUomPresets });

  const createMutation = useMutation({
    mutationFn: () => createUomPreset(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: UOM_QUERY_KEY }); setForm({ name: '', abbreviation: '' }); },
    onError: (e: any) => alert(e.response?.data?.name?.[0] ?? 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateUomPreset(editId!, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: UOM_QUERY_KEY }); setEditId(null); setForm({ name: '', abbreviation: '' }); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUomPreset,
    onSuccess: () => qc.invalidateQueries({ queryKey: UOM_QUERY_KEY }),
  });

  const handleSave = () => {
    if (!form.name.trim()) { alert('Name is required'); return; }
    if (editId) updateMutation.mutate();
    else createMutation.mutate();
  };

  const startEdit = (u: UomPreset) => { setEditId(u.id); setForm({ name: u.name, abbreviation: u.abbreviation }); };
  const cancelEdit = () => { setEditId(null); setForm({ name: '', abbreviation: '' }); };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-5">
      <h3 className="font-bold text-sm text-gray-700 mb-4">Units of Measurement</h3>
      <div className="flex gap-2 mb-4">
        <Input placeholder="Unit name (e.g., Kilogram)" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="flex-1" />
        <Input placeholder="Abbrev. (e.g., kg)" value={form.abbreviation} onChange={e => setForm(p => ({ ...p, abbreviation: e.target.value }))} className="w-28" />
        <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}
          className={`gap-1.5 ${editId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
          {editId ? <><Check className="w-4 h-4" /> Save</> : <><Plus className="w-4 h-4" /> Add</>}
        </Button>
        {editId && <Button variant="outline" onClick={cancelEdit}><X className="w-4 h-4" /></Button>}
      </div>
      <div className="space-y-1 max-h-64 overflow-auto">
        {uoms.map((u: UomPreset) => (
          <div key={u.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 group">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{u.name}</span>
              {u.abbreviation && <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{u.abbreviation}</span>}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => startEdit(u)} className="p-1 hover:bg-blue-50 rounded text-blue-400"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => deleteMutation.mutate(u.id)} className="p-1 hover:bg-red-50 rounded text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {uoms.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No UoM presets yet</p>}
      </div>
    </div>
  );
};

const StandardsTab = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <CategoryManager />
    <UomManager />
  </div>
);

// ── Tab: Transfer History ─────────────────────────────────────────────────────

const HistoryTab = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: TRANSFER_QUERY_KEY,
    queryFn: fetchTransferLogs,
  });

  const STATUS_COLORS: Record<string, string> = {
    initiated:  'bg-blue-100 text-blue-700',
    in_transit: 'bg-purple-100 text-purple-700',
    received:   'bg-green-100 text-green-700',
    cancelled:  'bg-gray-100 text-gray-500',
  };

  const filtered = transfers.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchSearch = !search ||
      t.item_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.item_sku?.toLowerCase().includes(search.toLowerCase()) ||
      t.from_branch_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.to_branch_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const exportCSV = () => {
    const csv = [
      'Date,Item,SKU,From Branch,To Branch,Qty,UOM,Status,Received At',
      ...filtered.map(t =>
        `${t.date},"${t.item_name}",${t.item_sku},"${t.from_branch_name}","${t.to_branch_name}",${t.quantity},${t.item_uom},${t.status},${t.received_at ?? ''}`
      ),
    ].join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `transfers_${new Date().toISOString().slice(0, 10)}.csv`,
    });
    a.click();
  };

  return (
    <div className="flex flex-col gap-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative bg-white">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search item, SKU, branch…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
          </div>

          <div className="flex rounded-lg border overflow-hidden text-sm bg-white">
            {['all', 'initiated', 'in_transit', 'received', 'cancelled'].map(k => (
              <button key={k} onClick={() => setStatusFilter(k)}
                className={`px-3 py-1.5 capitalize font-medium transition-colors ${statusFilter === k ? 'bg-[#507ADC] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                {k.replace('_', ' ')}
              </button>
            ))}
          </div> 

        </div>
        <Button variant="outline" className="gap-2" onClick={exportCSV}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-[#F9FAFB]">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>From → To</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Received At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <ArrowRightLeft className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm">No transfer records found</p>
                </TableCell>
              </TableRow>
            ) : filtered.map(t => (
              <TableRow key={t.id} className="hover:bg-gray-50">
                <TableCell className="text-sm text-gray-500">{t.date}</TableCell>
                <TableCell>
                  <p className="font-semibold text-sm">{t.item_name}</p>
                  <p className="font-mono text-xs text-gray-400">{t.item_sku}</p>
                </TableCell>
                <TableCell className="text-sm">
                  <span className="text-gray-700">{t.from_branch_name}</span>
                  <span className="text-gray-400 mx-1">→</span>
                  <span className="text-gray-700">{t.to_branch_name}</span>
                </TableCell>
                <TableCell className="text-right font-semibold text-sm">
                  {t.quantity} <span className="text-xs text-gray-400">{t.item_uom}</span>
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[t.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-gray-400">
                  {t.received_at ? fmtDateTime(t.received_at) : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {!isLoading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-right">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const Settings = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('branches');

  const renderTab = () => {
    switch (activeTab) {
      case 'branches':  return <BranchesTab />;
      case 'standards': return <StandardsTab />;
      case 'history':   return <HistoryTab />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full gap-y-4">
      {/* Header */}
      <div>
        <p className="text-[32px] font-bold">Settings</p>
        <p className="text-sm text-gray-500">Manage branches, standards, and system history</p>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-1 flex gap-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === key ? 'bg-[#507ADC] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {renderTab()}
    </div>
  );
};

export default Settings;
