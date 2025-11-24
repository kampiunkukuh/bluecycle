import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, AlertCircle, Send, Calendar, Zap } from "lucide-react";
import { useLocation } from "wouter";

interface CatalogItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
}

interface PickupOrder {
  id: number;
  wasteType: string;
  price: number;
  status: "pending" | "accepted" | "in-progress" | "completed" | "cancelled";
  createdAt: Date;
  address: string;
  deliveryMethod: "pickup" | "dropoff";
}

interface UserDashboardProps {
  userId?: number;
  userName?: string;
}

const mockCatalog: CatalogItem[] = [
  { id: "1", name: "Plastik", price: 50000, description: "Sampah plastik umum", image: "attached_assets/stock_images/plastic_waste_garbag_74fd1d20.jpg" },
  { id: "2", name: "Kertas", price: 45000, description: "Kertas bekas/kardus", image: "attached_assets/stock_images/plastic_waste_garbag_727aee39.jpg" },
  { id: "3", name: "Logam", price: 80000, description: "Kaleng, besi bekas", image: "attached_assets/stock_images/plastic_waste_garbag_6029a7f5.jpg" },
  { id: "4", name: "Organik", price: 30000, description: "Sisa makanan, daun", image: "attached_assets/stock_images/plastic_waste_garbag_2773def9.jpg" },
];

export default function UserDashboard({ userId, userName }: UserDashboardProps) {
  const [, setLocation] = useLocation();
  const [catalog] = useState<CatalogItem[]>(mockCatalog);
  const [pickups, setPickups] = useState<PickupOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPickups = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/pickups?requestedById=${userId}`);
        const data = await response.json();
        setPickups(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch pickups:", error);
        setPickups([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPickups();
  }, [userId]);

  const pendingRequests = pickups.filter((p) => ["pending", "accepted", "in-progress"].includes(p.status)).length;
  const outstandingSaldo = pickups
    .filter((p) => ["pending", "accepted", "in-progress"].includes(p.status))
    .reduce((sum, p) => sum + p.price, 0);
  const totalSaldo = 250000;
  const availableSaldo = totalSaldo - outstandingSaldo;

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

  const handleRequestPickup = () => {
    if (requestData.wasteType && requestData.address) {
      console.log("Pickup request:", requestData);
      setRequestData({ wasteType: "", quantity: "", address: "" });
      setShowRequestDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{getGreeting()} {userName || "Pelanggan"} 👋</h1>
        <p className="text-gray-600 dark:text-gray-400">Kelola pemesanan dan reward Anda bersama BlueCycle</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Siap untuk ditarik</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Saldo Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              Rp {outstandingSaldo.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Pesanan pending</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Pesanan Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {pendingRequests}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Dalam proses</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="catalog">Katalog Sampah</TabsTrigger>
          <TabsTrigger value="transactions">Riwayat Transaksi</TabsTrigger>
        </TabsList>

        {/* Catalog Tab */}
        <TabsContent value="catalog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Katalog Harga Sampah</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Harga saat ini untuk setiap jenis sampah
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Transaksi Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-gray-600">Memuat transaksi...</div>
              ) : pickups.length === 0 ? (
                <div className="text-center py-8 text-gray-600">Belum ada transaksi</div>
              ) : (
                pickups.map((pickup) => (
                  <div key={pickup.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Pesanan {pickup.wasteType}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(pickup.createdAt).toLocaleDateString("id-ID")}
                        </p>
                        <p className="text-xs text-gray-500">{pickup.deliveryMethod === "pickup" ? "Pickup" : "Drop Off"} - {pickup.address}</p>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
