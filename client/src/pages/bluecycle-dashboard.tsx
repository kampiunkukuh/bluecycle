import { ModernStatsCard } from "@/components/modern-stats-card";
import { ActivityFeed } from "@/components/activity-feed";
import { Trash2, Truck, Users, TrendingUp, MapPin, Calendar, Clock, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const mockStats = [
  {
    title: "Pickup Tertunda",
    value: 42,
    icon: Trash2,
    trend: { value: 8, direction: "up" as const },
    description: "Menunggu pengambilan",
    color: "primary" as const,
  },
  {
    title: "Supir Aktif",
    value: 12,
    icon: Truck,
    trend: { value: 2, direction: "up" as const },
    description: "Sedang di rute",
    color: "orange" as const,
  },
  {
    title: "Total Pengguna",
    value: "1.2K",
    icon: Users,
    trend: { value: 15, direction: "up" as const },
    description: "Akun terdaftar",
    color: "blue" as const,
  },
  {
    title: "Sampah Terkumpul",
    value: "3.2T",
    icon: TrendingUp,
    trend: { value: 12, direction: "up" as const },
    description: "Bulan ini",
    color: "purple" as const,
  },
];

const mockActivities = [
  {
    id: "1",
    user: "Sarah Johnson",
    userInitials: "SJ",
    action: "requested pickup at",
    target: "123 Main Street",
    timestamp: "5 minutes ago",
  },
  {
    id: "2",
    user: "Mike Davis",
    userInitials: "MD",
    action: "completed route",
    target: "North District",
    timestamp: "20 minutes ago",
  },
  {
    id: "3",
    user: "Alex Chen",
    userInitials: "AC",
    action: "started route",
    target: "East Side Area",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    user: "Emma Wilson",
    userInitials: "EW",
    action: "joined as driver",
    target: "Fleet #05",
    timestamp: "2 hours ago",
  },
];

const upcomingPickups = [
  {
    id: "1",
    address: "Jl. Sudirman No. 123",
    time: "10:00",
    type: "Organik",
    status: "scheduled",
  },
  {
    id: "2",
    address: "Jl. Gatot Subroto No. 456",
    time: "11:30",
    type: "Daur Ulang",
    status: "in-progress",
  },
  {
    id: "3",
    address: "Jl. Thamrin No. 789",
    time: "14:00",
    type: "Umum",
    status: "scheduled",
  },
];

interface AdminPickup extends typeof upcomingPickups[0] {
  requestedBy?: string;
  status: "pending" | "accepted" | "in-progress" | "completed" | "cancelled";
}

const adminPickups: AdminPickup[] = [
  { id: "1", address: "Jl. Sudirman No. 123", time: "10:00", type: "Organik", status: "pending", requestedBy: "Budi Santoso" },
  { id: "2", address: "Jl. Gatot Subroto No. 456", time: "11:30", type: "Daur Ulang", status: "in-progress", requestedBy: "Rina Wijaya" },
  { id: "3", address: "Jl. Thamrin No. 789", time: "14:00", type: "Umum", status: "pending", requestedBy: "Hendra Kusuma" },
];

export default function BlueCycleDashboard() {
  const [, setLocation] = useLocation();
  const [pickups, setPickups] = useState<AdminPickup[]>(adminPickups);

  const handleCancelPickup = (id: string) => {
    setPickups(pickups.map((p) => (p.id === id ? { ...p, status: "cancelled" } : p)));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Selamat datang! 👋</h1>
          <p className="text-muted-foreground text-base">
            Ini yang terjadi di BlueCycle hari ini
          </p>
        </div>
        <Button 
          onClick={() => setLocation("/pickups")} 
          size="lg"
          className="h-12 px-6 text-base font-semibold shadow-md"
          data-testid="button-request-pickup"
        >
          <Trash2 className="mr-2 h-5 w-5" />
          Minta Pickup
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {mockStats.map((stat) => (
          <ModernStatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Jadwal Hari Ini</CardTitle>
                  <CardDescription className="mt-1">Pengambilan sampah yang akan datang</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/pickups")}>
                  Lihat semua
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pickups.map((pickup) => (
                <div 
                  key={pickup.id} 
                  className={`flex items-center gap-4 p-4 rounded-lg border hover-elevate ${pickup.status === "cancelled" ? "opacity-50 bg-red-50 dark:bg-red-950/20" : ""}`}
                  data-testid={`pickup-item-${pickup.id}`}
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{pickup.address}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {pickup.time}
                      </span>
                      <span>•</span>
                      <span>{pickup.type}</span>
                    </div>
                    {pickup.requestedBy && <p className="text-xs text-gray-500 mt-1">Dari: {pickup.requestedBy}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge 
                      variant={pickup.status === "in-progress" ? "default" : pickup.status === "cancelled" ? "destructive" : "secondary"}
                    >
                      {pickup.status === "in-progress" ? "Proses" : pickup.status === "pending" ? "Tertunda" : "Dibatalkan"}
                    </Badge>
                    {pickup.status !== "cancelled" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelPickup(pickup.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950/30"
                        data-testid={`button-cancel-pickup-${pickup.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-md" data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle className="text-xl">Aksi Cepat</CardTitle>
              <CardDescription className="mt-1">Tugas dan operasi umum</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2 hover-elevate"
                  onClick={() => setLocation("/pickups")}
                  data-testid="button-new-pickup"
                >
                  <Trash2 className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Pickup Baru</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2 hover-elevate"
                  onClick={() => setLocation("/routes")}
                  data-testid="button-view-routes"
                >
                  <MapPin className="h-6 w-6 text-orange-600" />
                  <span className="text-sm font-medium">Rute</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2 hover-elevate"
                  onClick={() => setLocation("/fleet")}
                  data-testid="button-fleet-status"
                >
                  <Truck className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium">Armada</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <ActivityFeed activities={mockActivities} />
        </div>
      </div>
    </div>
  );
}
