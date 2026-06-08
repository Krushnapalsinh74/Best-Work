import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useListChallenges, useCreateChallenge, useUpdateChallenge, useDeleteChallenge,
} from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListChallengesQueryKey } from "@workspace/api-client-react";
import { Pencil, Trash2, Plus } from "lucide-react";

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-700",
  draft: "bg-yellow-100 text-yellow-800",
};

const defaultForm = {
  title: "", description: "", type: "distance", period: "monthly",
  targetDistance: 50, activityTypes: "running", status: "active",
  startDate: "", endDate: "",
};

export default function Challenges() {
  const { data, isLoading } = useListChallenges({ page: 1, limit: 50 });
  const createMutation = useCreateChallenge();
  const updateMutation = useUpdateChallenge();
  const deleteMutation = useDeleteChallenge();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);

  function openCreate() {
    setEditId(null);
    setForm(defaultForm);
    setOpen(true);
  }

  function openEdit(c: typeof data extends { data: infer A } ? (A extends (infer B)[] ? B : never) : never) {
    setEditId(c.id);
    setForm({
      title: c.title ?? "",
      description: c.description ?? "",
      type: c.type ?? "distance",
      period: c.period ?? "monthly",
      targetDistance: c.targetDistance ?? 50,
      activityTypes: c.activityTypes ?? "running",
      status: c.status ?? "active",
      startDate: c.startDate ?? "",
      endDate: c.endDate ?? "",
    });
    setOpen(true);
  }

  async function handleSave() {
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, data: form as never });
        toast({ title: "Challenge updated" });
      } else {
        await createMutation.mutateAsync({ data: form as never });
        toast({ title: "Challenge created" });
      }
      qc.invalidateQueries({ queryKey: getListChallengesQueryKey() });
      setOpen(false);
    } catch {
      toast({ title: "Error saving challenge", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this challenge?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getListChallengesQueryKey() });
      toast({ title: "Challenge deleted" });
    } catch {
      toast({ title: "Error deleting challenge", variant: "destructive" });
    }
  }

  return (
    <AdminLayout title="Challenges">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{data?.total ?? 0} challenges</p>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white gap-1">
          <Plus className="h-4 w-4" /> New Challenge
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Dates</TableHead>
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
              : data?.data?.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell className="capitalize">{c.period}</TableCell>
                  <TableCell>{c.targetDistance} km</TableCell>
                  <TableCell>{c.participantCount?.toLocaleString() ?? 0}</TableCell>
                  <TableCell className="text-xs text-gray-500">{c.startDate} → {c.endDate}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[c.status ?? "draft"] ?? ""}`}>
                      {c.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c as never)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700">
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
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Challenge" : "New Challenge"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { label: "Title", key: "title" },
              { label: "Description", key: "description" },
              { label: "Activity Types (e.g. running)", key: "activityTypes" },
              { label: "Start Date", key: "startDate", type: "date" },
              { label: "End Date", key: "endDate", type: "date" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input type={type ?? "text"} value={(form as never)[key] as string}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Period</Label>
                <select className="w-full border rounded px-2 py-1.5 text-sm"
                  value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}>
                  {["daily", "weekly", "monthly", "yearly"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select className="w-full border rounded px-2 py-1.5 text-sm"
                  value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {["active", "completed", "draft"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Target Distance (km)</Label>
              <Input type="number" value={form.targetDistance}
                onChange={e => setForm(f => ({ ...f, targetDistance: Number(e.target.value) }))} />
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
