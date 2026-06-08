import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, getListEventsQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus, MapPin } from "lucide-react";

const statusColor: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-800",
  ongoing: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-800",
};

const defaultForm = {
  title: "", description: "", date: "", time: "06:00",
  location: "", city: "", state: "", distance: 10,
  capacity: 500, status: "upcoming",
};

export default function Events() {
  const { data, isLoading } = useListEvents({ page: 1, limit: 50 });
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);

  function openCreate() { setEditId(null); setForm(defaultForm); setOpen(true); }
  function openEdit(e: typeof data extends { data: infer A } ? (A extends (infer B)[] ? B : never) : never) {
    setEditId(e.id);
    setForm({
      title: e.title ?? "", description: e.description ?? "",
      date: e.date ?? "", time: e.time ?? "06:00",
      location: e.location ?? "", city: e.city ?? "", state: e.state ?? "",
      distance: e.distance ?? 10, capacity: e.capacity ?? 500, status: e.status ?? "upcoming",
    });
    setOpen(true);
  }

  async function handleSave() {
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, data: form as never });
        toast({ title: "Event updated" });
      } else {
        await createMutation.mutateAsync({ data: form as never });
        toast({ title: "Event created" });
      }
      qc.invalidateQueries({ queryKey: getListEventsQueryKey() });
      setOpen(false);
    } catch {
      toast({ title: "Error saving event", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this event?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getListEventsQueryKey() });
      toast({ title: "Event deleted" });
    } catch {
      toast({ title: "Error deleting event", variant: "destructive" });
    }
  }

  return (
    <AdminLayout title="Events">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{data?.total ?? 0} events</p>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white gap-1">
          <Plus className="h-4 w-4" /> New Event
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array(4).fill(0).map((_, i) => (
                <TableRow key={i}>
                  {Array(7).fill(0).map((__, j) => (
                    <TableCell key={j}><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
              : data?.data?.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.title}</TableCell>
                  <TableCell className="text-sm">{e.date} {e.time}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {e.city}, {e.state}
                    </span>
                  </TableCell>
                  <TableCell>{e.distance} km</TableCell>
                  <TableCell>
                    <span className="font-medium">{e.registeredCount?.toLocaleString() ?? 0}</span>
                    <span className="text-gray-400 text-xs"> / {e.capacity?.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[e.status ?? "upcoming"] ?? ""}`}>
                      {e.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(e as never)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? "Edit Event" : "New Event"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[
              { label: "Title", key: "title" },
              { label: "Description", key: "description" },
              { label: "Location", key: "location" },
              { label: "City", key: "city" },
              { label: "State", key: "state" },
            ].map(({ label, key }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input value={(form as never)[key] as string}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <Label>Time</Label>
                <Input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </div>
              <div>
                <Label>Distance (km)</Label>
                <Input type="number" value={form.distance} onChange={e => setForm(f => ({ ...f, distance: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <select className="w-full border rounded px-2 py-1.5 text-sm"
                value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {["upcoming", "ongoing", "completed", "cancelled"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-primary text-white">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
