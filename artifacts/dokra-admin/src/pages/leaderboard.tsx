import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetLeaderboard } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Medal } from "lucide-react";

const indianStates = [
  "All States", "Maharashtra", "Karnataka", "Tamil Nadu", "Delhi", "Telangana",
  "Gujarat", "Rajasthan", "West Bengal", "Uttar Pradesh", "Kerala",
];

const medalColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];

export default function Leaderboard() {
  const [scope, setScope] = useState<"global" | "state" | "city">("global");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly" | "all-time">("monthly");

  const params: Record<string, unknown> = { scope, period, page: 1, limit: 50 };
  if (scope !== "global" && state && state !== "All States") params.state = state;
  if (scope === "city" && city) params.city = city;

  const { data, isLoading } = useGetLeaderboard(params as never);

  return (
    <AdminLayout title="Leaderboard">
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 bg-white border rounded-lg p-1">
          {(["global", "state", "city"] as const).map(s => (
            <button key={s}
              onClick={() => setScope(s)}
              className={`px-3 py-1.5 text-sm rounded capitalize transition-all ${scope === s ? "bg-primary text-white font-semibold" : "text-gray-600 hover:bg-gray-100"}`}
            >{s}</button>
          ))}
        </div>

        <div className="flex gap-1 bg-white border rounded-lg p-1">
          {(["weekly", "monthly", "yearly", "all-time"] as const).map(p => (
            <button key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm rounded capitalize transition-all ${period === p ? "bg-secondary text-white font-semibold" : "text-gray-600 hover:bg-gray-100"}`}
            >{p}</button>
          ))}
        </div>

        {scope !== "global" && (
          <select className="border rounded-lg px-3 py-2 text-sm bg-white"
            value={state} onChange={e => setState(e.target.value)}>
            {indianStates.map(s => <option key={s}>{s}</option>)}
          </select>
        )}
        {scope === "city" && (
          <input placeholder="City name" className="border rounded-lg px-3 py-2 text-sm bg-white"
            value={city} onChange={e => setCity(e.target.value)} />
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Runner</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Total Distance</TableHead>
              <TableHead>Activities</TableHead>
              <TableHead>Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array(10).fill(0).map((_, i) => (
                <TableRow key={i}>
                  {Array(6).fill(0).map((__, j) => (
                    <TableCell key={j}><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
              : (data as { data?: unknown[] })?.data?.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">No data available</TableCell>
                  </TableRow>
                )
                : (data as { data?: Record<string, unknown>[] })?.data?.map((entry, idx) => {
                  const rank = (entry.rank as number) ?? idx + 1;
                  return (
                    <TableRow key={entry.userId as string} className={rank <= 3 ? "bg-yellow-50/30" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {rank <= 3
                            ? <Medal className={`h-5 w-5 ${medalColors[rank - 1]}`} />
                            : <span className="text-gray-500 font-mono text-sm w-5 text-center">#{rank}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{entry.name as string}</TableCell>
                      <TableCell className="text-sm text-gray-500">{entry.city as string}, {entry.state as string}</TableCell>
                      <TableCell className="font-semibold">{Number(entry.totalDistance).toFixed(1)} km</TableCell>
                      <TableCell>{entry.totalActivities as number}</TableCell>
                      <TableCell>
                        <span className="font-bold text-secondary">{Number(entry.points).toLocaleString()}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
