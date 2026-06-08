import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListNotifications, useSendNotification, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Send } from "lucide-react";

const targetColors: Record<string, string> = {
  all: "bg-blue-100 text-blue-800",
  state: "bg-purple-100 text-purple-800",
  city: "bg-green-100 text-green-800",
  user: "bg-orange-100 text-orange-800",
};

const statusColors: Record<string, string> = {
  sent: "bg-green-100 text-green-800",
  scheduled: "bg-yellow-100 text-yellow-800",
  draft: "bg-gray-100 text-gray-700",
};

const defaultForm = { title: "", message: "", target: "all" };

export default function Notifications() {
  const { data, isLoading } = useListNotifications({ page: 1, limit: 50 });
  const sendMutation = useSendNotification();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);

  async function handleSend() {
    if (!form.title || !form.message) {
      toast({ title: "Title and message are required", variant: "destructive" });
      return;
    }
    try {
      await sendMutation.mutateAsync({ data: form as never });
      qc.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      toast({ title: "Notification sent successfully" });
      setOpen(false);
      setForm(defaultForm);
    } catch {
      toast({ title: "Failed to send notification", variant: "destructive" });
    }
  }

  return (
    <AdminLayout title="Notifications">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{data?.total ?? 0} notifications</p>
        <Button onClick={() => setOpen(true)} className="bg-primary hover:bg-primary/90 text-white gap-1">
          <Bell className="h-4 w-4" /> Send Notification
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Sent To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  {Array(6).fill(0).map((__, j) => (
                    <TableCell key={j}><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
              : data?.data?.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-medium">{n.title}</TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-xs truncate">{n.message}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${targetColors[n.target ?? "all"] ?? ""}`}>
                      {n.target}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{n.sentCount?.toLocaleString() ?? 0}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[n.status ?? "draft"] ?? ""}`}>
                      {n.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Send Notification</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input placeholder="Notification title" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>Message</Label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm min-h-[80px] resize-none"
                placeholder="Notification message..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              />
            </div>
            <div>
              <Label>Target Audience</Label>
              <select className="w-full border rounded px-2 py-1.5 text-sm"
                value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}>
                <option value="all">All Users</option>
                <option value="state">By State</option>
                <option value="city">By City</option>
                <option value="user">Specific User</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSend} disabled={sendMutation.isPending} className="bg-primary text-white gap-1">
              <Send className="h-4 w-4" />
              {sendMutation.isPending ? "Sending..." : "Send Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
