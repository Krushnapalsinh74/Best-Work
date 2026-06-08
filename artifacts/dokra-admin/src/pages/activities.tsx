import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListActivities } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Activities() {
  const { data, isLoading } = useListActivities({ page: 1, limit: 50 });

  return (
    <AdminLayout title="Activities">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
                </TableRow>
              ))
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">No activities found.</TableCell>
              </TableRow>
            ) : (
              data?.data?.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.userName || `User ${activity.userId}`}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{activity.type}</Badge>
                  </TableCell>
                  <TableCell>{activity.distance} km</TableCell>
                  <TableCell>{activity.duration} min</TableCell>
                  <TableCell>{activity.city}, {activity.state}</TableCell>
                  <TableCell>{new Date(activity.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
