import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListUsers } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Users() {
  const { data, isLoading } = useListUsers({ page: 1, limit: 50 });

  return (
    <AdminLayout title="Users">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-gray-200 rounded animate-pulse ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">No users found.</TableCell>
              </TableRow>
            ) : (
              data?.data?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.city}, {user.state}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : user.status === "suspended" ? "secondary" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/users/${user.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
