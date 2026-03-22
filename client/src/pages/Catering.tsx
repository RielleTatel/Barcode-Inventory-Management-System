import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Eye, Trash2, Loader2, CalendarX, ChefHat, Plus, Search } from "lucide-react";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { fetchCateringEvents, deleteCateringEvent, updateCateringStatus } from "@/components/catering/api";
import {
  CATERING_QUERY_KEYS, PACKAGE_OPTIONS, STATUS_OPTIONS,
  type CateringEvent,
} from "@/components/catering";
import CateringModal, { type CateringModalMode } from "@/components/catering/CateringModal";

const PackageBadge = ({ type }: { type: string }) => {
  const opt = PACKAGE_OPTIONS.find(o => o.value === type);
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${opt?.color ?? 'bg-gray-100 text-gray-600'}`}>
      {opt?.label ?? type}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const opt = STATUS_OPTIONS.find(o => o.value === status);
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${opt?.color ?? 'bg-gray-100 text-gray-600'}`}>
      {opt?.label ?? status}
    </span>
  );
};

const Catering = () => {
  const queryClient = useQueryClient();

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');

  // Modal state
  const [modalMode, setModalMode] = useState<CateringModalMode>('add');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CateringEvent | undefined>(undefined);

  const { data: events = [], isLoading, isError } = useQuery({
    queryKey: CATERING_QUERY_KEYS.EVENTS,
    queryFn: fetchCateringEvents,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCateringEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATERING_QUERY_KEYS.EVENTS }),
    onError: (e: any) => alert(e.response?.data?.detail || "Failed to delete event"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateCateringStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATERING_QUERY_KEYS.EVENTS }),
  });

  const openModal = (mode: CateringModalMode, event?: CateringEvent) => {
    setModalMode(mode);
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleDelete = (event: CateringEvent) => {
    if (window.confirm(`Delete catering event for "${event.client_name}"? This cannot be undone.`)) {
      deleteMutation.mutate(event.id);
    }
  };

  const filtered = events.filter(e => {
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      e.client_name.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.kitchen_sheet_number.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesPackage = packageFilter === 'all' || e.package_type === packageFilter;
    return matchesSearch && matchesStatus && matchesPackage;
  });

  return (
    <div className="flex flex-col h-full w-full gap-y-6">
      {/* Page header */}
      <div className="rounded-xl p-2 flex items-start justify-between gap-x-7 flex-wrap gap-y-3">
        <div className="flex flex-col">
          <p className="text-[32px] font-bold">Catering Management</p>
          <p className="text-md text-gray-500">Manage catering orders, generate kitchen sheets, and track event status.</p>
        </div>
        <div className="flex gap-3 items-center">
          <Button variant="outline" onClick={() => alert("Export coming soon")}>Export</Button>
          <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => openModal('add')}>
            <Plus className="w-4 h-4" />
            Add Catering Event
          </Button>
        </div>
      </div>

      {/* Stats row */}
      {!isLoading && events.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {STATUS_OPTIONS.map(s => {
            const count = events.filter(e => e.status === s.value).length;
            return (
              <button
                key={s.value}
                onClick={() => setStatusFilter(prev => prev === s.value ? 'all' : s.value)}
                className={`rounded-xl border p-4 text-left transition-all hover:shadow-md ${statusFilter === s.value ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-200 bg-white'}`}
              >
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <div className="mt-1"><StatusBadge status={s.value} /></div>
              </button>
            );
          })}
        </div>
      )}

      {/* Table card */}
      <div className="shadow-md bg-white rounded-xl flex-1 flex flex-col p-4 gap-y-4 border border-[#E5E5E5]">
        {/* Toolbar */}
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search client, venue or KS number..."
              className="w-72 pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select value={packageFilter} onValueChange={setPackageFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Package" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Package</SelectLabel>
                  <SelectItem value="all">All Packages</SelectItem>
                  {PACKAGE_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-[#F9FAFB]">
              <TableRow>
                <TableHead className="w-10"><Checkbox /></TableHead>
                <TableHead className="text-[#94979F]">KS #</TableHead>
                <TableHead className="text-[#94979F]">Event Date</TableHead>
                <TableHead className="text-[#94979F]">Client Name</TableHead>
                <TableHead className="text-[#94979F]">Package</TableHead>
                <TableHead className="text-[#94979F]">Pax</TableHead>
                <TableHead className="text-[#94979F] max-w-[200px]">Dishes</TableHead>
                <TableHead className="text-[#94979F]">Status</TableHead>
                <TableHead className="text-right text-[#94979F]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    <p className="text-sm text-gray-400 mt-2">Loading catering events...</p>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-red-500">
                    Failed to load catering events. Please try again.
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <CalendarX className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">No catering events found.</p>
                    {!search && statusFilter === 'all' && packageFilter === 'all' && (
                      <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => openModal('add')}>
                        <Plus className="w-3.5 h-3.5" /> Create your first event
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(event => (
                  <TableRow key={event.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell><Checkbox /></TableCell>
                    <TableCell className="font-mono text-sm text-gray-500">{event.kitchen_sheet_number}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell className="font-semibold">
                      <div>
                        {event.client_name}
                        {event.venue && <p className="text-xs text-gray-400 font-normal">{event.venue}</p>}
                      </div>
                    </TableCell>
                    <TableCell><PackageBadge type={event.package_type} /></TableCell>
                    <TableCell className="text-gray-600">{event.pax}</TableCell>
                    <TableCell className="max-w-[200px]">
                      {(event.items_ordered_names ?? []).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {(event.items_ordered_names ?? []).slice(0, 3).map((name, i) => (
                            <span key={i} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{name.split(' — ')[1] ?? name}</span>
                          ))}
                          {(event.items_ordered_names ?? []).length > 3 && (
                            <span className="text-xs text-gray-400">+{(event.items_ordered_names ?? []).length - 3} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No dishes</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {/* Inline status changer */}
                      <select
                        value={event.status}
                        onChange={e => statusMutation.mutate({ id: event.id, status: e.target.value })}
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold border-0 focus:outline-none cursor-pointer
                          ${STATUS_OPTIONS.find(s => s.value === event.status)?.color ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openModal('kitchen_sheet', event)}
                          className="p-1.5 hover:bg-orange-50 rounded"
                          title="Kitchen Sheet"
                        >
                          <ChefHat className="w-4 h-4 text-orange-500" />
                        </button>
                        <button
                          onClick={() => openModal('view', event)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => openModal('edit', event)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(event)}
                          className="p-1.5 hover:bg-red-50 rounded"
                          title="Delete"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && !isError && (
          <p className="text-xs text-gray-400 text-right">
            {filtered.length} of {events.length} event{events.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <CateringModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        event={selectedEvent}
      />
    </div>
  );
};

export default Catering;
