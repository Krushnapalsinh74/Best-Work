import { useParams } from "wouter";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useGetUser, useSuspendUser, useBanUser, useRestoreUser, useVerifyUser,
  useListUserActivityHistory, getGetUserQueryKey,
} from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, UserCheck, UserX, ShieldOff, CheckCircle, Activity, Trophy } from "lucide-react";
import { Link } from "wouter";

const activityTypeColor: Record<string, string> = {
  walking: "bg-green-100 text-green-800",
  running: "bg-red-100 text-red-800",
  cycling: "bg-blue-100 text-blue-800",
};

export default function UserDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: user, isLoading } = useGetUser(id, { query: { enabled: !!id, queryKey: getGetUserQueryKey(id) } });
  const { data: activityHistory } = useListUserActivityHistory(id, { query: { enabled: !!id } });
  const suspendMutation = useSuspendUser();
  const banMutation = useBanUser();
  const restoreMutation = useRestoreUser();
  const verifyMutation = useVerifyUser();
  const { toast } = useToast();
  const qc = useQueryClient();

  async function handleAction(action: "suspend" | "ban" | "restore" | "verify") {
    const labels = { suspend: "Suspend", ban: "Ban", restore: "Restore", verify: "Verify" };
    if (action !== "verify" && !confirm(`${labels[action]} this user?`)) return;
    try {
      if (action === "suspend") await suspendMutation.mutateAsync({ id });
      if (action === "ban") await banMutation.mutateAsync({ id });
      if (action === "restore") await restoreMutation.mutateAsync({ id });
      if (action === "verify") await verifyMutation.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getGetUserQueryKey(id) });
      toast({ title: `User ${labels[action].toLowerCase()}ed` });
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="User Details">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-lg" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) return (
    <AdminLayout title="User Not Found">
      <p>User not found.</p>
    </AdminLayout>
  );

  return (
    <AdminLayout title={user.name ?? "User Detail"}>
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="text-gray-500 hover:text-gray-800 gap-1">
          <Link href="/users"><ArrowLeft className="h-4 w-4" /> Back to Users</Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              {user.isVerified && <CheckCircle className="h-5 w-5 text-green-500" />}
              <Badge variant={user.status === "active" ? "default" : user.status === "suspended" ? "secondary" : "destructive"}
                className="capitalize">{user.status}</Badge>
            </div>
            <p className="text-gray-500 text-sm">{user.email} &middot; {user.mobile}</p>
            <p className="text-gray-500 text-sm mt-0.5">{user.city}, {user.state} &middot; {user.gender}</p>
            <p className="text-xs text-gray-400 mt-1">Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "-"}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {!user.isVerified && (
              <Button size="sm" variant="outline" onClick={() => handleAction("verify")}
                className="text-green-700 border-green-300 hover:bg-green-50 gap-1">
                <UserCheck className="h-4 w-4" /> Verify
              </Button>
            )}
            {user.status === "active" && (
              <>
                <Button size="sm" variant="outline" onClick={() => handleAction("suspend")}
                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-50 gap-1">
                  <ShieldOff className="h-4 w-4" /> Suspend
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAction("ban")}
                  className="text-red-700 border-red-300 hover:bg-red-50 gap-1">
                  <UserX className="h-4 w-4" /> Ban
                </Button>
              </>
            )}
            {(user.status === "suspended" || user.status === "banned") && (
              <Button size="sm" variant="outline" onClick={() => handleAction("restore")}
                className="text-green-700 border-green-300 hover:bg-green-50 gap-1">
                <UserCheck className="h-4 w-4" /> Restore
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Distance", value: `${Number(user.totalDistance ?? 0).toFixed(1)} km`, icon: Activity, color: "text-blue-600" },
          { label: "Activities", value: String(user.totalActivities ?? 0), icon: Activity, color: "text-green-600" },
          { label: "Points", value: Number(user.points ?? 0).toLocaleString(), icon: Trophy, color: "text-yellow-600" },
          { label: "Badges", value: String(user.badgeCount ?? 0), icon: Trophy, color: "text-purple-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Icon className={`h-3 w-3 ${color}`} /> {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Walking", value: `${Number(user.walkingDistance ?? 0).toFixed(1)} km`, color: "bg-green-50 border-green-200 text-green-700" },
          { label: "Running", value: `${Number(user.runningDistance ?? 0).toFixed(1)} km`, color: "bg-red-50 border-red-200 text-red-700" },
          { label: "Cycling", value: `${Number(user.cyclingDistance ?? 0).toFixed(1)} km`, color: "bg-blue-50 border-blue-200 text-blue-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`border rounded-lg p-4 ${color}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
            <p className="text-xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(activityHistory as { data?: Record<string, unknown>[] })?.data?.slice(0, 10).map((a, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${activityTypeColor[a.type as string] ?? ""}`}>
                      {a.type as string}
                    </span>
                  </TableCell>
                  <TableCell>{Number(a.distance).toFixed(1)} km</TableCell>
                  <TableCell>{a.duration as number} min</TableCell>
                  <TableCell>{a.calories as number} kcal</TableCell>
                  <TableCell className="text-sm text-gray-500">{a.city as string}, {a.state as string}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {a.createdAt ? new Date(a.createdAt as string).toLocaleDateString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
