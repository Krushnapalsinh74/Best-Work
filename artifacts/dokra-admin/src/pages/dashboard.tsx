import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAnalyticsSummary } from "@workspace/api-client-react";
import { Users, Activity, Flag, AlertTriangle, TrendingUp, MapPin, Map, Calendar } from "lucide-react";

export default function Dashboard() {
  const { data, isLoading } = useGetAnalyticsSummary();

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-4 w-4 bg-gray-200 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-gray-200 rounded mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{data?.totalUsers.toLocaleString() || 0}</div>
              <p className="text-xs text-gray-500 mt-1">{data?.activeUsers.toLocaleString()} active</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{data?.totalActivities.toLocaleString() || 0}</div>
              <p className="text-xs text-gray-500 mt-1">{data?.totalWalkingKm.toLocaleString()} km walked</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{data?.pendingReports.toLocaleString() || 0}</div>
              <p className="text-xs text-gray-500 mt-1">{data?.flaggedActivities.toLocaleString()} flagged activities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Challenges</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{data?.activeChallenges.toLocaleString() || 0}</div>
              <p className="text-xs text-gray-500 mt-1">{data?.upcomingEvents.toLocaleString()} upcoming events</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
