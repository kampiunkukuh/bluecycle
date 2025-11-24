import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, AlertCircle, Send, Calendar, Zap, Package, BarChart3, Leaf, MapPin, Clock, Phone } from "lucide-react";
import { useLocation } from "wouter";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CatalogItem {
  id: number;
  wasteType: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

interface PickupOrder {
  id: number;
  wasteType: string;
  price: number;
  quantity?: string;
  status: "pending" | "accepted" | "in-progress" | "completed" | "cancelled";
  createdAt: Date;
  address: string;
  deliveryMethod: "pickup" | "dropoff";
}

interface CollectionPoint {
  id: number;
  name: string;
  address: string;
  capacity?: number;
  currentKg: number;
  status: "available" | "full" | "maintenance";
  operatingHours?: string;
  contactPerson?: string;
  phone?: string;
}

interface UserDashboardProps {
  userId?: number;
  userName?: string;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export default function UserDashboard({ userId, userName }: UserDashboardProps) {
  const [, setLocation] = useLocation();
  const [pickups, setPickups] = useState<PickupOrder[]>([]);
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch catalog from API (single source of truth)
  const { data: catalog = [] } = useQuery<CatalogItem[]>({
    queryKey: ["/api/waste-catalog"],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const [pickupsRes, pointsRes] = await Promise.all([
          fetch(`/api/pickups?requestedById=${userId}`),
          fetch("/api/collection-points"),
        ]);
        const pickupsData = await pickupsRes.json();
        const pointsData = await pointsRes.json();
        setPickups(Array.isArray(pickupsData) ? pickupsData : []);
        setCollectionPoints(Array.isArray(pointsData) ? pointsData : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setPickups([]);
        setCollectionPoints([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // Calculate statistics
  const pendingRequests = pickups.filter((p) => ["pending", "accepted", "in-progress"].includes(p.status)).length;
  const completedOrders = pickups.filter((p) => p.status === "completed");
  const outstandingSaldo = pickups
    .filter((p) => ["pending", "accepted", "in-progress"].includes(p.status))
    .reduce((sum, p) => sum + p.price, 0);
  const completedEarnings = completedOrders.reduce((sum, p) => sum + p.price, 0);
  const totalSaldo = completedEarnings;
  const availableSaldo = totalSaldo - outstandingSaldo;

  // Calculate kg collected (estimate based on quantity field)
  const totalKgCollected = completedOrders.reduce((sum, p) => {
    const qty = parseInt(p.quantity || "0") || 0;
    return sum + qty;
  }, 0);

  // Waste type breakdown
  const wasteTypeBreakdown = catalog.map((type) => ({
    name: type.wasteType,
    orders: pickups.filter((p) => p.wasteType === type.wasteType && p.status === "completed").length,
    kg: pickups
      .filter((p) => p.wasteType === type.wasteType && p.status === "completed")
      .reduce((sum, p) => sum + (parseInt(p.quantity || "0") || 0), 0),
    earnings: pickups
      .filter((p) => p.wasteType === type.wasteType && p.status === "completed")
      .reduce((sum, p) => sum + p.price, 0),
  }));

  // Earnings by waste type (for pie chart)
  const earningsByWasteType = wasteTypeBreakdown
    .filter((w) => w.earnings > 0)
    .map((w) => ({
      name: w.name,
      value: w.earnings,
    }));

  // Earnings trend (last 7 days - group by date)
  const earningsTrend = pickups
    .filter((p) => p.status === "completed")
    .reduce((acc: any[], p) => {
      const date = new Date(p.createdAt).toLocaleDateString("id-ID");
      const existing = acc.find((d) => d.date === date);
      if (existing) {
        existing.earnings += p.price;
      } else {
        acc.push({ date, earnings: p.price });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);

  // Order status distribution
  const statusDistribution = [
    { name: "Completed", value: completedOrders.length },
    { name: "Pending", value: pickups.filter((p) => p.status === "pending").length },
    { name: "In Progress", value: pickups.filter((p) => p.status === "in-progress").length },
  ].filter((s) => s.value > 0);

  const completionRate = pickups.length > 0 ? Math.round((completedOrders.length / pickups.length) * 100) : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 17) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  const handleOrderClick = (item: CatalogItem) => {
    setLocation(`/order/${item.id}?type=pickup`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{getGreeting()} {userName || "Pelanggan"} 👋</h1>
          <p className="text-gray-600 dark:text-gray-400">Dashboard komprehensif aktivitas BlueCycle Anda</p>
        </div>
        <Button onClick={() => setLocation("/catalog")} variant="outline">
          <Package className="h-4 w-4 mr-2" />
          Pesan Sekarang
        </Button>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Total Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              Rp {totalSaldo.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Saldo Tersedia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              Rp {availableSaldo.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Siap tarik</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Total kg Terkumpul
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {totalKgCollected}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">kg sampah</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {pickups.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">pesanan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Tingkat Selesai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {completionRate}%
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{completedOrders.length} selesai</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="wastetype">Jenis Sampah</TabsTrigger>
          <TabsTrigger value="trends">Tren Pendapatan</TabsTrigger>
          <TabsTrigger value="catalog">Katalog & Pesan</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribusi Status Pesanan</CardTitle>
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
                  <div className="h-80 flex items-center justify-center text-gray-500">Belum ada data pesanan</div>
                )}
              </CardContent>
            </Card>

            {/* Earnings by Waste Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pendapatan per Jenis Sampah</CardTitle>
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
                  <div className="h-80 flex items-center justify-center text-gray-500">Belum ada pendapatan</div>
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
                      <th className="text-right py-2 px-3 font-semibold">Total Pendapatan</th>
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
              <CardTitle className="text-lg">Perbandingan Jumlah Order per Jenis</CardTitle>
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
              <CardTitle className="text-lg">Detail Pesanan per Jenis</CardTitle>
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
                      <p className="text-gray-600 dark:text-gray-400">Total Pendapatan</p>
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
              <CardTitle className="text-lg">Tren Pendapatan (7 Hari Terakhir)</CardTitle>
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
                    <Line type="monotone" dataKey="earnings" stroke="#10b981" name="Pendapatan Harian" strokeWidth={2} dot={{ fill: "#10b981", r: 5 }} />
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
                <CardTitle className="text-sm">Total Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{pickups.length}</p>
                <p className="text-xs text-gray-500 mt-1">pesanan sepanjang masa</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pesanan Selesai</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{completedOrders.length}</p>
                <p className="text-xs text-gray-500 mt-1">{completionRate}% tingkat penyelesaian</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Rata-rata Pendapatan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  Rp {completedOrders.length > 0 ? Math.round(completedEarnings / completedOrders.length).toLocaleString("id-ID") : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">per pesanan selesai</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Catalog Tab */}
        <TabsContent value="catalog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Katalog Harga Sampah</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Harga saat ini untuk setiap jenis sampah</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {catalog.map((item) => (
                  <div key={item.id} className="border rounded-lg hover-elevate overflow-hidden flex flex-col cursor-pointer" data-testid={`catalog-card-${item.id}`}>
                    {item.image && (
                      <div className="h-40 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                      </div>
                      <div className="pt-3 border-t mt-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Harga</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          Rp {item.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-3" 
                        onClick={() => handleOrderClick(item)}
                        data-testid={`button-order-${item.id}`}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Pesan Sekarang
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pesanan Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Memuat transaksi...</div>
          ) : pickups.length === 0 ? (
            <div className="text-center py-8 text-gray-600">Belum ada transaksi</div>
          ) : (
            pickups.slice(-5).reverse().map((pickup) => (
              <div key={pickup.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{pickup.wasteType} {pickup.quantity ? `- ${pickup.quantity}` : ""}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(pickup.createdAt).toLocaleDateString("id-ID")}
                    </p>
                    <p className="text-xs text-gray-500">{pickup.deliveryMethod === "pickup" ? "🚚 Pickup" : "📍 Drop Off"} - {pickup.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Rp {pickup.price.toLocaleString("id-ID")}</p>
                  <Badge
                    className={`text-xs mt-1 ${
                      pickup.status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : pickup.status === "cancelled"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    } border-0`}
                  >
                    {pickup.status === "pending" ? "Menunggu" : pickup.status === "accepted" ? "Diterima" : pickup.status === "in-progress" ? "Proses" : pickup.status === "completed" ? "Selesai" : "Batal"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
