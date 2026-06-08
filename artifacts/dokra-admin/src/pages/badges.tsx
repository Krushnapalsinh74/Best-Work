import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListBadges, useCreateBadge, useUpdateBadge, useDeleteBadge, getListBadgesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus, Award } from "lucide-react";

const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  bronze:   { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-300" },
  silver:   { bg: "bg-gray-50",    text: "text-gray-600",   border: "border-gray-300" },
  gold:     { bg: "bg-yellow-50",  text: "text-yellow-700", border: "border-yellow-400" },
  platinum: { bg: "bg-cyan-50",    text: "text-cyan-700",   border: "border-cyan-400" },
  diamond:  { bg: "bg-purple-50",  text: "text-purple-700", border: "border-purple-400" },
};

const defaultForm = { name: "", description: "", tier: "bronze", criteria: "", imageUrl: "" };

export default function Badges() {
  const { data, isLoading } = useListBadges({ page: 1, limit: 50 });
  const createMutation = useCreateBadge();
  const updateMutation = useUpdateBadge();
  const deleteMutation = useDeleteBadge();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);

  function openCreate() { setEditId(null); setForm(defaultForm); setOpen(true); }
  function openEdit(b: typeof data extends { data: infer A } ? (A extends (infer B)[] ? B : never) : never) {
    setEditId(b.id);
    setForm({ name: b.name ?? "", description: b.description ?? "", tier: b.tier ?? "bronze", criteria: b.criteria ?? "", imageUrl: b.imageUrl ?? "" });
    setOpen(true);
  }

  async function handleSave() {
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, data: form as never });
        toast({ title: "Badge updated" });
      } else {
        await createMutation.mutateAsync({ data: form as never });
        toast({ title: "Badge created" });
      }
      qc.invalidateQueries({ queryKey: getListBadgesQueryKey() });
      setOpen(false);
    } catch {
      toast({ title: "Error saving badge", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this badge?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getListBadgesQueryKey() });
      toast({ title: "Badge deleted" });
    } catch {
      toast({ title: "Error deleting badge", variant: "destructive" });
    }
  }

  return (
    <AdminLayout title="Badges">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{data?.total ?? 0} badges</p>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white gap-1">
          <Plus className="h-4 w-4" /> New Badge
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-3" />
              <div className="h-4 w-24 bg-gray-200 rounded mx-auto mb-2" />
              <div className="h-3 w-32 bg-gray-200 rounded mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.data?.map((b) => {
            const colors = tierColors[b.tier ?? "bronze"] ?? tierColors.bronze;
            return (
              <div key={b.id} className={`bg-white rounded-lg border-2 ${colors.border} p-4 relative`}>
                <div className={`absolute top-2 right-2 flex gap-1`}>
                  <button onClick={() => openEdit(b as never)} className="text-gray-400 hover:text-gray-600 p-1">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="text-red-300 hover:text-red-600 p-1">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <div className={`w-14 h-14 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-3`}>
                  <Award className={`h-7 w-7 ${colors.text}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-center text-sm">{b.name}</h3>
                <p className={`text-xs font-semibold capitalize text-center mt-1 ${colors.text}`}>{b.tier}</p>
                <p className="text-xs text-gray-500 text-center mt-2 line-clamp-2">{b.description}</p>
                <p className="text-xs text-center mt-3 font-medium text-gray-600">
                  {b.awardedCount?.toLocaleString() ?? 0} awarded
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? "Edit Badge" : "New Badge"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[
              { label: "Name", key: "name" },
              { label: "Description", key: "description" },
              { label: "Criteria", key: "criteria" },
              { label: "Image URL (optional)", key: "imageUrl" },
            ].map(({ label, key }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input value={(form as never)[key] as string}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <Label>Tier</Label>
              <select className="w-full border rounded px-2 py-1.5 text-sm"
                value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
                {["bronze", "silver", "gold", "platinum", "diamond"].map(t => <option key={t}>{t}</option>)}
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
