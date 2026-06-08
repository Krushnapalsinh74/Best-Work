import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Save, Settings2, Gauge, AlertTriangle } from "lucide-react";

export default function Settings() {
  const { data, isLoading } = useGetSettings();
  const updateMutation = useUpdateSettings();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    pointsPerKmWalking: 1,
    pointsPerKmRunning: 2,
    pointsPerKmCycling: 0.5,
    minActivityDistanceKm: 0.5,
    maxSpeedWalkingKmh: 15,
    maxSpeedRunningKmh: 30,
    maxSpeedCyclingKmh: 60,
    maintenanceMode: false,
  });

  useEffect(() => {
    if (data) {
      setForm({
        pointsPerKmWalking: Number(data.pointsPerKmWalking ?? 1),
        pointsPerKmRunning: Number(data.pointsPerKmRunning ?? 2),
        pointsPerKmCycling: Number(data.pointsPerKmCycling ?? 0.5),
        minActivityDistanceKm: Number(data.minActivityDistanceKm ?? 0.5),
        maxSpeedWalkingKmh: Number(data.maxSpeedWalkingKmh ?? 15),
        maxSpeedRunningKmh: Number(data.maxSpeedRunningKmh ?? 30),
        maxSpeedCyclingKmh: Number(data.maxSpeedCyclingKmh ?? 60),
        maintenanceMode: Boolean(data.maintenanceMode),
      });
    }
  }, [data]);

  async function handleSave() {
    try {
      await updateMutation.mutateAsync({ data: form as never });
      qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      toast({ title: "Settings saved successfully" });
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Settings">
        <div className="space-y-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {Array(4).fill(0).map((__, j) => (
                  <div key={j} className="h-10 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="App Settings">
      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings2 className="h-4 w-4 text-secondary" /> Points Configuration
            </CardTitle>
            <CardDescription>Points awarded per km for each activity type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Walking (pts/km)", key: "pointsPerKmWalking", color: "text-green-600" },
                { label: "Running (pts/km)", key: "pointsPerKmRunning", color: "text-red-600" },
                { label: "Cycling (pts/km)", key: "pointsPerKmCycling", color: "text-blue-600" },
              ].map(({ label, key, color }) => (
                <div key={key}>
                  <Label className={`text-xs font-semibold ${color}`}>{label}</Label>
                  <Input
                    type="number" step="0.1"
                    value={(form as never)[key] as number}
                    onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="h-4 w-4 text-blue-600" /> Speed Limits (Anti-cheat)
            </CardTitle>
            <CardDescription>Max allowed speed per activity type — activities above this threshold get flagged</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Min Activity Distance (km)</Label>
                <Input type="number" step="0.1" value={form.minActivityDistanceKm}
                  onChange={e => setForm(f => ({ ...f, minActivityDistanceKm: Number(e.target.value) }))}
                  className="mt-1" />
              </div>
              {[
                { label: "Max Walking Speed (km/h)", key: "maxSpeedWalkingKmh" },
                { label: "Max Running Speed (km/h)", key: "maxSpeedRunningKmh" },
                { label: "Max Cycling Speed (km/h)", key: "maxSpeedCyclingKmh" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <Label className="text-xs text-gray-500">{label}</Label>
                  <Input type="number" value={(form as never)[key] as number}
                    onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                    className="mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={form.maintenanceMode ? "border-red-300 bg-red-50" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className={`h-4 w-4 ${form.maintenanceMode ? "text-red-600" : "text-gray-400"}`} />
              Maintenance Mode
            </CardTitle>
            <CardDescription>When enabled, the app shows a maintenance page to all users</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                role="switch"
                aria-checked={form.maintenanceMode}
                onClick={() => setForm(f => ({ ...f, maintenanceMode: !f.maintenanceMode }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.maintenanceMode ? "bg-red-500" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${form.maintenanceMode ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className={`text-sm font-medium ${form.maintenanceMode ? "text-red-700" : "text-gray-600"}`}>
                {form.maintenanceMode ? "Maintenance mode is ON" : "Maintenance mode is OFF"}
              </span>
            </label>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={updateMutation.isPending}
          className="bg-primary hover:bg-primary/90 text-white gap-2">
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </AdminLayout>
  );
}
