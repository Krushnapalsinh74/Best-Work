import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListReports, useResolveReport, getListReportsQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";

const typeColors: Record<string, string> = {
  fake_activity: "bg-red-100 text-red-800",
  cheating: "bg-orange-100 text-orange-800",
  harassment: "bg-purple-100 text-purple-800",
  abuse: "bg-pink-100 text-pink-800",
  other: "bg-gray-100 text-gray-700",
};

export default function Reports() {
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "resolved">("all");
  const { data, isLoading } = useListReports({ page: 1, limit: 50, status: statusFilter === "all" ? undefined : statusFilter });
  const resolveMutation = useResolveReport();
  const { toast } = useToast();
  const qc = useQueryClient();

  async function handleResolve(id: number) {
    try {
      await resolveMutation.mutateAsync({ id, data: { resolution: "Reviewed and resolved by admin" } });
      qc.invalidateQueries({ queryKey: getListReportsQueryKey() });
      toast({ title: "Report resolved" });
    } catch {
      toast({ title: "Error resolving report", variant: "destructive" });
    }
  }

  const pending = data?.data?.filter(r => r.status === "pending").length ?? 0;

  return (
    <AdminLayout title="Reports & Moderation">
      {pending > 0 && (
        <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-800">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <span className="text-sm font-medium">{pending} report{pending > 1 ? "s" : ""} pending review</span>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {(["all", "pending", "resolved"] as const).map(s => (
          <button key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 text-sm rounded-full capitalize font-medium transition-all ${statusFilter === s ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >{s}</button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reporter</TableHead>
              <TableHead>Reported User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  {Array(7).fill(0).map((__, j) => (
                    <TableCell key={j}><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
              : data?.data?.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">No reports found</TableCell>
                  </TableRow>
                )
                : data?.data?.map((r) => (
                  <TableRow key={r.id} className={r.status === "pending" ? "bg-amber-50/30" : ""}>
                    <TableCell className="text-sm font-medium">{r.reporterName}</TableCell>
                    <TableCell className="text-sm font-medium text-red-700">{r.reportedUserName}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeColors[r.type ?? "other"] ?? ""}`}>
                        {(r.type ?? "").replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-xs truncate">{r.description}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>
                        {r.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => handleResolve(r.id)}
                          className="gap-1 text-green-700 border-green-300 hover:bg-green-50">
                          <CheckCircle className="h-3 w-3" /> Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
