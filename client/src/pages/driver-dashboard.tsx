import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Check, Loader, TrendingUp, DollarSign, BarChart3, Leaf, Package } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface OutstandingPickup {
  id: number;
  address: string;
  wasteType: string;
  price: number;
  quantity?: string;
  createdAt: Date;
  status: string;
}

interface MyPickup {
  id: number;
  address: string;
  wasteType: string;
  quantity?: string;
  status: string;
  price: number;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export default function DriverDashboard({ driverId }: { driverId?: number }) {
  const [outstanding, setOutstanding] = useState<OutstandingPickup[]>([]);
  const [myPickups, setMyPickups] = useState<MyPickup[]>([]);
  const [history, setHistory] = useState<MyPickup[]>([]);
  const [loadingOutstanding, setLoadingOutstanding] = useState(true);
  const [loadingMy, setLoadingMy] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [takingOrder, setTakingOrder] = useState<number | null>(null);

  // Only fetch if we have a valid driver ID
  useEffect(() => {
    if (!driverId) return;
    const fetchData = async () => {
      setLoadingOutstanding(true);
      try {
        const response = await fetch("/api/pickups?status=pending");
        const data = await response.json();
        setOutstanding(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch outstanding pickups:", error);
      } finally {
        setLoadingOutstanding(false);
      }
    };
    fetchData();
  }, [driverId]);

  useEffect(() => {
    if (!driverId) return;
    const fetchMyPickups = async () => {
      setLoadingMy(true);
      try {
        const response = await fetch(`/api/pickups?status=accepted,in-progress&assignedDriverId=${driverId}`);
        const data = await response.json();
        setMyPickups(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch my pickups:", error);
      } finally {
        setLoadingMy(false);
      }
    };
    fetchMyPickups();
  }, [driverId]);

  useEffect(() => {
    if (!driverId) return;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const response = await fetch(`/api/pickups?status=completed&assignedDriverId=${driverId}`);
        const data = await response.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [driverId]);

  const handleTakePickup = async (id: number) => {
    setTakingOrder(id);
    try {
      const response = await fetch(`/api/pickups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "in-progress",
          assignedDriverId: driverId,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setOutstanding(outstanding.filter((p) => p.id !== id));
        setMyPickups([...myPickups, updated]);
      }
    } catch (error) {
      console.error("Failed to take pickup:", error);
      alert("Gagal mengambil order");
    } finally {
      setTakingOrder(null);
    }
  };

  const handleCompletePickup = async (id: number) => {
    try {
      const response = await fetch(`/api/pickups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      if (response.ok) {
        const completed = myPickups.find((p) => p.id === id);
        setMyPickups(myPickups.filter((p) => p.id !== id));
        if (completed) {
          setHistory([...history, completed]);
        }
      }
    } catch (error) {
      console.error("Failed to complete pickup:", error);
      alert("Gagal menyelesaikan order");
    }
  };

  // Calculate statistics
  const totalEarnings = history.reduce((sum, p) => sum + Math.floor(p.price * 0.8), 0);
  const currentEarnings = myPickups.reduce((sum, p) => sum + Math.floor(p.price * 0.8), 0);
  const totalKgDelivered = history.reduce((sum, p) => sum + (parseInt(p.quantity || "0") || 0), 0);
  const completionRate = (history.length + myPickups.length + outstanding.length) > 0 ? Math.round((history.length / (history.length + myPickups.length + outstanding.length)) * 100) : 0;

  // Waste type breakdown
  const wasteTypeBreakdown = [
    { name: "Plastik", orders: history.filter((p) => p.wasteType === "Plastik").length, kg: history.filter((p) => p.wasteType === "Plastik").reduce((sum, p) => sum + (parseInt(p.quantity || "0") || 0), 0), earnings: history.filter((p) => p.wasteType === "Plastik").reduce((sum, p) => sum + Math.floor(p.price * 0.8), 0) },
    { name: "Kertas", orders: history.filter((p) => p.wasteType === "Kertas").length, kg: history.filter((p) => p.wasteType === "Kertas").reduce((sum, p) => sum + (parseInt(p.quantity || "0") || 0), 0), earnings: history.filter((p) => p.wasteType === "Kertas").reduce((sum, p) => sum + Math.floor(p.price * 0.8), 0) },
    { name: "Logam", orders: history.filter((p) => p.wasteType === "Logam").length, kg: history.filter((p) => p.wasteType === "Logam").reduce((sum, p) => sum + (parseInt(p.quantity || "0") || 0), 0), earnings: history.filter((p) => p.wasteType === "Logam").reduce((sum, p) => sum + Math.floor(p.price * 0.8), 0) },
    { name: "Organik", orders: history.filter((p) => p.wasteType === "Organik").length, kg: history.filter((p) => p.wasteType === "Organik").reduce((sum, p) => sum + (parseInt(p.quantity || "0") || 0), 0), earnings: history.filter((p) => p.wasteType === "Organik").reduce((sum, p) => sum + Math.floor(p.price * 0.8), 0) },
  ];

  // Earnings by waste type (for pie chart)
  const earningsByWasteType = wasteTypeBreakdown
    .filter((w) => w.earnings > 0)
    .map((w) => ({
      name: w.name,
      value: w.earnings,
    }));

  // Earnings trend (last 7 days)
  const earningsTrend = history
    .reduce((acc: any[], p) => {
      const date = new Date(p.createdAt).toLocaleDateString("id-ID");
      const existing = acc.find((d) => d.date === date);
      if (existing) {
        existing.earnings += Math.floor(p.price * 0.8);
      } else {
        acc.push({ date, earnings: Math.floor(p.price * 0.8) });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);

  // Order status distribution
  const statusDistribution = [
    { name: "Completed", value: history.length },
    { name: "In Progress", value: myPickups.length },
    { name: "Available", value: outstanding.length },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Supir BlueCycle 🚚</h1>
        <p className="text-gray-600 dark:text-gray-400">Analytics lengkap performa pengiriman Anda</p>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Penghasilan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              Rp {totalEarnings.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">80% dari orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Earning Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              Rp {currentEarnings.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{myPickups.length} order</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Total kg Antar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {totalKgDelivered}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">kg sampah</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Selesai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {history.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">pesanan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Tingkat Selesai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {completionRate}%
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="wastetype">Jenis Sampah</TabsTrigger>
          <TabsTrigger value="trends">Tren Penghasilan</TabsTrigger>
          <TabsTrigger value="orders">Order Aktif</TabsTrigger>
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
                {statusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={statusDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} (${value})`} outerRadius={100} fill="#8884d8" dataKey="value">
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#3b82f6" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">Belum ada data</div>
                )}
              </CardContent>
            </Card>

            {/* Earnings by Waste Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Penghasilan per Jenis Sampah</CardTitle>
              </CardHeader>
              <CardContent>
                {earningsByWasteType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={earningsByWasteType} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: Rp ${(value / 1000).toFixed(0)}k`} outerRadius={100} fill="#8884d8" dataKey="value">
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `Rp ${value.toLocaleString("id-ID")}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-gray-500">Belum ada penghasilan</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Statistics Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistik Detail Per Jenis Sampah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold">Jenis Sampah</th>
                      <th className="text-right py-2 px-3 font-semibold">Jumlah Order</th>
                      <th className="text-right py-2 px-3 font-semibold">Total kg</th>
                      <th className="text-right py-2 px-3 font-semibold">Total Penghasilan (80%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wasteTypeBreakdown.map((waste) => (
                      <tr key={waste.name} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="py-3 px-3 font-medium">{waste.name}</td>
                        <td className="text-right py-3 px-3">{waste.orders}</td>
                        <td className="text-right py-3 px-3">{waste.kg} kg</td>
                        <td className="text-right py-3 px-3 font-semibold text-green-600 dark:text-green-400">
                          Rp {waste.earnings.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Waste Type Tab */}
        <TabsContent value="wastetype" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Perbandingan Order & kg per Jenis</CardTitle>
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
                <div className="h-96 flex items-center justify-center text-gray-500">Belum ada data pesanan selesai</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detail Order per Jenis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {wasteTypeBreakdown.map((waste) => (
                <div key={waste.name} className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">{waste.name}</h4>
                    <Badge variant="outline">{waste.orders} pesanan</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Total Kg</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{waste.kg}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Rata-rata</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {waste.orders > 0 ? (waste.kg / waste.orders).toFixed(1) : 0} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Penghasilan</p>
                      <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        Rp {waste.earnings.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tren Penghasilan (7 Hari Terakhir)</CardTitle>
            </CardHeader>
            <CardContent>
              {earningsTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={earningsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `Rp ${value.toLocaleString("id-ID")}`} />
                    <Legend />
                    <Line type="monotone" dataKey="earnings" stroke="#10b981" name="Penghasilan Harian (80%)" strokeWidth={2} dot={{ fill: "#10b981", r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">Belum ada data tren</div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Pesanan Selesai</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{history.length}</p>
                <p className="text-xs text-gray-500 mt-1">sepanjang masa</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Rata-rata Penghasilan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  Rp {history.length > 0 ? Math.round(totalEarnings / history.length).toLocaleString("id-ID") : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">per pesanan</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Rata-rata kg per Order</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {history.length > 0 ? (totalKgDelivered / history.length).toFixed(1) : 0} kg
                </p>
                <p className="text-xs text-gray-500 mt-1">per pesanan</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Tersedia ({outstanding.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {loadingOutstanding ? (
                  <p className="text-sm text-gray-500">Memuat order...</p>
                ) : outstanding.length === 0 ? (
                  <p className="text-sm text-gray-500">Tidak ada order yang tersedia</p>
                ) : (
                  outstanding.map((pickup) => (
                    <div key={pickup.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <p className="font-medium text-sm">{pickup.address}</p>
                          </div>
                          <Badge variant="secondary" className="mb-2">
                            {pickup.wasteType}
                          </Badge>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>Earning: Rp {Math.floor(pickup.price * 0.8).toLocaleString("id-ID")} (80%)</p>
                            <p className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(pickup.createdAt).toLocaleDateString("id-ID")}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleTakePickup(pickup.id)}
                        className="w-full h-9"
                        size="sm"
                        disabled={takingOrder === pickup.id}
                        data-testid="button-take-pickup"
                      >
                        {takingOrder === pickup.id ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Mengambil...
                          </>
                        ) : (
                          "Ambil Order"
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Saya ({myPickups.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {loadingMy ? (
                  <p className="text-sm text-gray-500">Memuat order...</p>
                ) : myPickups.length === 0 ? (
                  <p className="text-sm text-gray-500">Tidak ada order yang sedang dikerjakan</p>
                ) : (
                  myPickups.map((pickup) => (
                    <div key={pickup.id} className="border rounded-lg p-3 space-y-2 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <p className="font-medium text-sm">{pickup.address}</p>
                          </div>
                          <Badge variant="secondary" className="mb-2">
                            {pickup.wasteType}
                          </Badge>
                          <div className="text-xs text-gray-600 mb-2">
                            <p>Earning: Rp {Math.floor(pickup.price * 0.8).toLocaleString("id-ID")}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
                            Sedang Dikerjakan
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCompletePickup(pickup.id)}
                        variant="default"
                        className="w-full h-9"
                        size="sm"
                        data-testid="button-complete-pickup"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Selesaikan
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* History Section */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Order Selesai ({history.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingHistory ? (
                <p className="text-sm text-gray-500">Memuat riwayat...</p>
              ) : history.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada order yang diselesaikan</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.map((pickup) => (
                    <div key={pickup.id} className="border rounded-lg p-3 space-y-2 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Check className="h-4 w-4 text-green-600" />
                            <p className="font-medium text-sm">{pickup.address}</p>
                          </div>
                          <Badge variant="secondary" className="mb-2">
                            {pickup.wasteType} {pickup.quantity ? `- ${pickup.quantity}` : ""}
                          </Badge>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>Penghasilan: Rp {Math.floor(pickup.price * 0.8).toLocaleString("id-ID")}</p>
                            <p className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(pickup.createdAt).toLocaleDateString("id-ID")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
