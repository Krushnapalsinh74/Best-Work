import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListAuditLogs } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck } from "lucide-react";

const actionColors: Record<string, string> = {
  SUSPEND_USER: "bg-yellow-100 text-yellow-800",
  BAN_USER: "bg-red-100 text-red-800",
  RESTORE_USER: "bg-green-100 text-green-800",
  VERIFY_USER: "bg-blue-100 text-blue-800",
  CREATE_CHALLENGE: "bg-purple-100 text-purple-800",
  UPDATE_CHALLENGE: "bg-purple-100 text-purple-800",
  DELETE_CHALLENGE: "bg-purple-100 text-purple-800",
  CREATE_EVENT: "bg-cyan-100 text-cyan-800",
  UPDATE_EVENT: "bg-cyan-100 text-cyan-800",
  DELETE_EVENT: "bg-cyan-100 text-cyan-800",
  SEND_NOTIFICATION: "bg-blue-100 text-blue-800",
  FLAG_ACTIVITY: "bg-orange-100 text-orange-800",
  DELETE_ACTIVITY: "bg-red-100 text-red-800",
  UPDATE_SETTINGS: "bg-gray-100 text-gray-700",
};

export default function AuditLogs() {
  const { data, isLoading } = useListAuditLogs({ page: 1, limit: 50 });

  return (
    <AdminLayout title="Audit Logs">
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span>All admin actions are logged. {data?.total ?? 0} total entries.</span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array(8).fill(0).map((_, i) => (
                <TableRow key={i}>
                  {Array(6).fill(0).map((__, j) => (
                    <TableCell key={j}><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
              : data?.data?.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">No audit logs found</TableCell>
                  </TableRow>
                )
                : data?.data?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium text-sm">{log.adminName}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${actionColors[log.action ?? ""] ?? "bg-gray-100 text-gray-700"}`}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="capitalize">{log.entityType}</span>
                      {log.entityId && <span className="text-gray-400 ml-1">#{log.entityId}</span>}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-xs truncate">{log.details}</TableCell>
                    <TableCell className="text-xs text-gray-400 font-mono">{log.ipAddress}</TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
