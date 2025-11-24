import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Truck, TrendingUp, Package, Activity, BarChart3, Leaf } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PickupOrder {
  id: number;
  status: string;
  price: number;
  quantity?: string;
  wasteType: string;
  createdAt: Date;
  requestedById: number;
  assignedDriverId?: number;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export default function AdminDashboard() {
  const [pickups, setPickups] = useState<PickupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all pickups
        const pickupsResponse = await fetch("/api/pickups");
        const pickupsData = await pickupsResponse.json();
        setPickups(Array.isArray(pickupsData) ? pickupsData : []);

        // Fetch users (mock data for now)
        const usersResponse = await fetch("/api/users");
        const usersData = await usersResponse.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate statistics
  const totalOrders = pickups.length;
  const completedOrders = pickups.filter((p) => p.status === "completed");
  const totalRevenue = completedOrders.reduce((sum, p) => sum + Math.floor(p.price * 0.2), 0); // 20% commission
  const driverEarnings = completedOrders.reduce((sum, p) => sum + Math.floor(p.price * 0.8), 0); // 80% to drivers
  const totalTransactionValue = completedOrders.reduce((sum, p) => sum + p.price, 0);

  // Orders by status
  const statusBreakdown = [
    { name: "Completed", value: completedOrders.length, color: "#10b981" },
    { name: "In Progress", value: pickups.filter((p) => p.status === "in-progress").length, color: "#3b82f6" },
    { name: "Pending", value: pickups.filter((p) => p.status === "pending").length, color: "#f59e0b" },
    { name: "Cancelled", value: pickups.filter((p) => p.status === "cancelled").length, color: "#ef4444" },
  ].filter((s) => s.value > 0);

  // Waste type breakdown
  const wasteTypeBreakdown = [
    { name: "Plastik", orders: completedOrders.filter((p) => p.wasteType === "Plastik").length, kg: completedOrders.filter((p) => p.wasteType === "Plastik").reduce((sum, p) => sum + (parseInt(p.quantity || "0") || 0), 0) },
    { name: "Kertas", orders: completedOrders.filter((p) => p.wasteType === "Kertas").length, kg: completedOrders.filter((p) => p.wasteType === "Kertas").reduce((sum, p) => sum + (parseInt(p.quantity || "0") || 0), 0) },
    { name: "Logam", orders: completedOrders.filter((p) => p.wasteType === "Logam").length, kg: completedOrders.filter((p) => p.wasteType === "Logam").reduce((sum, p) => sum + (parseInt(p.quantity || "0") || 0), 0) },
    { name: "Organik", orders: completedOrders.filter((p) => p.wasteType === "Organik").length, kg: completedOrders.filter((p) => p.wasteType === "Organik").reduce((sum, p) => sum + (parseInt(p.quantity || "0") || 0), 0) },
  ];

  // Revenue by waste type
  const revenueByWasteType = wasteTypeBreakdown
    .filter((w) => w.orders > 0)
    .map((w) => ({
      name: w.name,
      value: completedOrders.filter((p) => p.wasteType === w.name).reduce((sum, p) => sum + Math.floor(p.price * 0.2), 0),
    }));

  // Revenue trend (last 7 days)
  const revenueTrend = completedOrders
    .reduce((acc: any[], p) => {
      const date = new Date(p.createdAt).toLocaleDateString("id-ID");
      const existing = acc.find((d) => d.date === date);
      if (existing) {
        existing.commission += Math.floor(p.price * 0.2);
        existing.driverEarnings += Math.floor(p.price * 0.8);
      } else {
        acc.push({ date, commission: Math.floor(p.price * 0.2), driverEarnings: Math.floor(p.price * 0.8) });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);

  // Today's stats
  const today = new Date().toLocaleDateString("id-ID");
  const todayOrders = completedOrders.filter((p) => new Date(p.createdAt).toLocaleDateString("id-ID") === today);
  const todayRevenue = todayOrders.reduce((sum, p) => sum + Math.floor(p.price * 0.2), 0);

  // Active drivers (those with in-progress orders)
  const activeDrivers = new Set(pickups.filter((p) => p.status === "in-progress" && p.assignedDriverId).map((p) => p.assignedDriverId)).size;

  // Unique customers
  const uniqueCustomers = new Set(completedOrders.map((p) => p.requestedById)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard 🏢</h1>
        <p className="text-gray-600 dark:text-gray-400">Ringkasan komprehensif sistem BlueCycle</p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Komisi (20%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">semua waktu</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Komisi Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Rp {todayRevenue.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{todayOrders.length} orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {totalOrders}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{completedOrders.length} selesai</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Pelanggan Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {uniqueCustomers}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">unique customers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Supir Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {activeDrivers}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">sedang bekerja</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 border-pink-200 dark:border-pink-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              Rp {totalTransactionValue.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">100% value</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="revenue">Pendapatan</TabsTrigger>
          <TabsTrigger value="waste">Jenis Sampah</TabsTrigger>
          <TabsTrigger value="activity">Aktivitas</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribusi Status Order</CardTitle>
              </CardHeader>
              <CardContent>
                {statusBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={statusBreakdown} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} (${value})`} outerRadius={100} fill="#8884d8" dataKey="value">
                        {statusBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">Belum ada data</div>
                )}
              </CardContent>
            </Card>

            {/* Commission vs Driver Earnings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribusi Komisi vs Supir (20% vs 80%)</CardTitle>
              </CardHeader>
              <CardContent>
                {totalTransactionValue > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Komisi Admin (20%)", value: totalRevenue },
                          { name: "Penghasilan Supir (80%)", value: driverEarnings },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: Rp ${(value / 1000).toFixed(0)}k`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#3b82f6" />
                      </Pie>
                      <Tooltip formatter={(value: any) => `Rp ${value.toLocaleString("id-ID")}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">Belum ada transaksi</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {totalOrders > 0 ? Math.round((completedOrders.length / totalOrders) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">{completedOrders.length}/{totalOrders}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Rata-rata Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  Rp {totalOrders > 0 ? Math.round(totalTransactionValue / totalOrders).toLocaleString("id-ID") : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">per order</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{uniqueCustomers}</p>
                <p className="text-xs text-gray-500 mt-1">unique users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Pending Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {pickups.filter((p) => p.status === "pending").length}
                </p>
                <p className="text-xs text-gray-500 mt-1">awaiting driver</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tren Revenue (7 Hari Terakhir)</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `Rp ${value.toLocaleString("id-ID")}`} />
                    <Legend />
                    <Line type="monotone" dataKey="commission" stroke="#10b981" name="Komisi Admin (20%)" strokeWidth={2} dot={{ fill: "#10b981", r: 5 }} />
                    <Line type="monotone" dataKey="driverEarnings" stroke="#3b82f6" name="Penghasilan Supir (80%)" strokeWidth={2} dot={{ fill: "#3b82f6", r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">Belum ada data</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue per Jenis Sampah</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueByWasteType.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={revenueByWasteType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `Rp ${value.toLocaleString("id-ID")}`} />
                    <Legend />
                    <Bar dataKey="value" fill="#10b981" name="Komisi Admin" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">Belum ada data</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Waste Tab */}
        <TabsContent value="waste" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order per Jenis Sampah</CardTitle>
            </CardHeader>
            <CardContent>
              {wasteTypeBreakdown.some((w) => w.orders > 0) ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={wasteTypeBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#3b82f6" name="Jumlah Order" />
                    <Bar dataKey="kg" fill="#10b981" name="Total kg" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">Belum ada data</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistik Detail Sampah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold">Jenis Sampah</th>
                      <th className="text-right py-2 px-3 font-semibold">Total Orders</th>
                      <th className="text-right py-2 px-3 font-semibold">Total kg</th>
                      <th className="text-right py-2 px-3 font-semibold">Komisi Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wasteTypeBreakdown.map((waste) => {
                      const commission = completedOrders.filter((p) => p.wasteType === waste.name).reduce((sum, p) => sum + Math.floor(p.price * 0.2), 0);
                      return (
                        <tr key={waste.name} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="py-3 px-3 font-medium">{waste.name}</td>
                          <td className="text-right py-3 px-3">{waste.orders}</td>
                          <td className="text-right py-3 px-3">{waste.kg} kg</td>
                          <td className="text-right py-3 px-3 font-semibold text-green-600 dark:text-green-400">
                            Rp {commission.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <p className="text-sm text-gray-500">Memuat aktivitas...</p>
              ) : pickups.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada aktivitas</p>
              ) : (
                pickups
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 10)
                  .map((pickup) => (
                    <div key={pickup.id} className="p-3 border rounded-lg flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{pickup.wasteType} {pickup.quantity ? `- ${pickup.quantity}` : ""}</p>
                        <p className="text-xs text-gray-500 mt-1">Rp {pickup.price.toLocaleString("id-ID")} (Komisi: Rp {Math.floor(pickup.price * 0.2).toLocaleString("id-ID")})</p>
                        <p className="text-xs text-gray-500">
                          {new Date(pickup.createdAt).toLocaleDateString("id-ID")} {new Date(pickup.createdAt).toLocaleTimeString("id-ID")}
                        </p>
                      </div>
                      <Badge
                        className={`text-xs ${
                          pickup.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : pickup.status === "cancelled"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : pickup.status === "in-progress"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        } border-0`}
                      >
                        {pickup.status === "pending" ? "Menunggu" : pickup.status === "accepted" ? "Diterima" : pickup.status === "in-progress" ? "Proses" : pickup.status === "completed" ? "Selesai" : "Batal"}
                      </Badge>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
