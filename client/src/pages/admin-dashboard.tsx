import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Truck, Users, Package, Leaf, Plus, Route as RouteIcon, Zap, Download, DollarSign } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface PickupOrder {
  id: number;
  status: string;
  price: number;
  quantity?: string;
  wasteType: string;
  createdAt: Date;
  requestedById: number;
  assignedDriverId?: number;
  address: string;
  scheduledDate?: Date;
}

interface User {
  id: number;
  name: string;
  role: string;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

// Helper function to format rupiah
const formatRupiah = (amount: number): string => {
  return amount.toLocaleString("id-ID");
};

export default function AdminDashboard() {
  const [pickups, setPickups] = useState<PickupOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pickupsRes, usersRes] = await Promise.all([
          fetch("/api/pickups"),
          fetch("/api/users"),
        ]);
        const pickupsData = await pickupsRes.json();
        const usersData = await usersRes.json();
        setPickups(Array.isArray(pickupsData) ? pickupsData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Export functions
  const exportToCSV = () => {
    const headers = ["ID", "Status", "Jenis Sampah", "Harga (Rp)", "Driver (80%)", "Admin (20%)", "Tanggal"];
    const data = pickups.map((p) => [
      p.id,
      p.status,
      p.wasteType,
      p.price,
      Math.round(p.price * 0.8),
      Math.round(p.price * 0.2),
      new Date(p.createdAt).toLocaleDateString("id-ID"),
    ]);
    
    const csv = [headers, ...data].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bluecycle-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const exportToPDF = () => {
    const totalRevenue = pickups.filter(p => p.status === "completed").reduce((sum, p) => sum + p.price, 0);
    const adminCommission = Math.round(totalRevenue * 0.2);
    
    const pdfContent = `
LAPORAN PENDAPATAN BLUECYCLE
============================
Tanggal: ${new Date().toLocaleDateString("id-ID")}

RINGKASAN KEUANGAN:
- Total Revenue: Rp ${totalRevenue.toLocaleString("id-ID")}
- Admin Commission (20%): Rp ${adminCommission.toLocaleString("id-ID")}
- Driver Earnings (80%): Rp ${Math.round(totalRevenue * 0.8).toLocaleString("id-ID")}
- Total Transaksi Selesai: ${pickups.filter(p => p.status === "completed").length}

DETAIL TRANSAKSI:
${pickups.map(p => `
ID: ${p.id}
Jenis: ${p.wasteType}
Harga: Rp ${p.price.toLocaleString("id-ID")}
Status: ${p.status}
Tanggal: ${new Date(p.createdAt).toLocaleDateString("id-ID")}
---`).join("\n")}
    `;
    
    const blob = new Blob([pdfContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bluecycle-report-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
  };

  // Calculate statistics
  const totalPickups = pickups.length;
  const pendingPickups = pickups.filter((p) => p.status === "pending").length;
  const activeDrivers = new Set(pickups.filter((p) => p.status === "in-progress" && p.assignedDriverId).map((p) => p.assignedDriverId)).size;
  const totalUsers = users.length;
  const totalWaste = pickups.reduce((sum, p) => sum + (parseInt(p.quantity?.split(" ")[0] || "0") || 0), 0);
  
  // Revenue & Admin Balance
  const completedPickups = pickups.filter((p) => p.status === "completed").length;
  const totalRevenue = pickups.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.price, 0);
  const adminBalance = Math.round(totalRevenue * 0.2); // 20% admin commission
  const driverBalance = Math.round(totalRevenue * 0.8); // 80% driver earnings
  
  // Pickup percentage
  const completionPercentage = totalPickups > 0 ? Math.round((completedPickups / totalPickups) * 100) : 0;

  // Today's scheduled pickups
  const today = new Date().toDateString();
  const todayPickups = pickups.filter((p) => new Date(p.scheduledDate || p.createdAt).toDateString() === today).slice(0, 5);

  // Recent activity
  const recentActivity = pickups.slice(-5).reverse().map((p) => ({
    id: p.id,
    action: `Order #${p.id} - ${p.status === "completed" ? "Selesai" : p.status === "in-progress" ? "Sedang berlangsung" : "Dibuat"}`,
    user: users.find((u) => u.id === p.requestedById)?.name || "Unknown",
    time: new Date(p.createdAt).toLocaleString("id-ID"),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Selamat datang! 👋</h1>
        <p className="text-gray-600 dark:text-gray-400">Ini yang terjadi di BlueCycle hari ini</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Saldo Bank Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">Rp {formatRupiah(adminBalance)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Komisi 20%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Minta Pickup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{completionPercentage}%</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Selesai</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Pickup Tertunda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingPickups}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Menunggu pengambilan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Supir Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeDrivers}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Sedang di rute</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Pengguna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{totalUsers.toLocaleString("id-ID")}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Akun terdaftar</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Sampah Terkumpul
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{totalWaste.toLocaleString("id-ID")} kg</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">bulan ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Export Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Rp {totalRevenue.toLocaleString("id-ID")}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <p>Driver (80%): Rp {driverBalance.toLocaleString("id-ID")}</p>
              <p>Admin (20%): Rp {adminBalance.toLocaleString("id-ID")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaksi Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{completedPickups}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Dari {totalPickups} total permintaan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Laporan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" onClick={exportToCSV} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" /> CSV
            </Button>
            <Button className="w-full" onClick={exportToPDF} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" /> Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jadwal Hari Ini */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Jadwal Hari Ini
            </CardTitle>
            <p className="text-xs text-gray-500">Pengambilan sampah yang akan datang</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayPickups.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada jadwal hari ini</p>
            ) : (
              todayPickups.map((pickup) => (
                <div key={pickup.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover-elevate" data-testid={`card-pickup-schedule-${pickup.id}`}>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{pickup.address}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(pickup.scheduledDate || pickup.createdAt).toLocaleTimeString("id-ID")}
                      <span className="mx-2">•</span>
                      {pickup.wasteType}
                    </p>
                    <p className="text-xs text-gray-500">Dari: {users.find((u) => u.id === pickup.requestedById)?.name || "Unknown"}</p>
                  </div>
                  <Badge className={
                    pickup.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900" :
                    pickup.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900" :
                    "bg-blue-100 text-blue-800 dark:bg-blue-900"
                  }>
                    {pickup.status === "pending" ? "Tertunda" : pickup.status === "completed" ? "Selesai" : "Proses"}
                  </Badge>
                </div>
              ))
            )}
            <Button variant="ghost" size="sm" className="w-full mt-2" data-testid="button-view-all-schedule">Lihat semua</Button>
          </CardContent>
        </Card>

        {/* Aksi Cepat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Aksi Cepat
            </CardTitle>
            <p className="text-xs text-gray-500">Tugas dan operasi umum</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" data-testid="button-new-pickup">
              <Plus className="h-4 w-4 mr-2" />
              Pickup Baru
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-manage-routes">
              <RouteIcon className="h-4 w-4 mr-2" />
              Rute
            </Button>
            <Button variant="outline" className="w-full justify-start" data-testid="button-manage-fleet">
              <Truck className="h-4 w-4 mr-2" />
              Armada
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-b-0" data-testid={`item-activity-${idx}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {activity.user.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.user}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Calendar icon import fix
function Calendar(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}