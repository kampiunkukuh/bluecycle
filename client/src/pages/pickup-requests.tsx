import { useState, useEffect } from "react";
import { Search, MapPin, Package, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { OrderTracking } from "@/components/order-tracking";

interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  profilePhoto?: string;
  motorbikeplate?: string;
}

interface PickupRequest {
  id: number;
  address: string;
  wasteType: string;
  quantity?: string | null;
  deliveryMethod: "pickup" | "dropoff";
  status: "pending" | "accepted" | "in-progress" | "completed" | "cancelled";
  price: number;
  notes?: string | null;
  createdAt: Date;
  assignedDriverId?: number;
}

export default function PickupRequests({ userId, userName }: { userId?: number; userName?: string }) {
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [drivers, setDrivers] = useState<Record<number, Driver>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPickups = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/pickups?requestedById=${userId}`);
        const data = await response.json();
        const pickupsArray = Array.isArray(data) ? data : [];
        setPickups(pickupsArray);

        // Fetch driver info for in-progress pickups
        const driversMap: Record<number, Driver> = {};
        for (const pickup of pickupsArray) {
          if (pickup.assignedDriverId && !driversMap[pickup.assignedDriverId]) {
            try {
              const driverRes = await fetch(`/api/users/${pickup.assignedDriverId}`);
              if (driverRes.ok) {
                const driverData = await driverRes.json();
                driversMap[pickup.assignedDriverId] = driverData;
              }
            } catch (err) {
              console.error("Failed to fetch driver:", err);
            }
          }
        }
        setDrivers(driversMap);
      } catch (error) {
        console.error("Failed to fetch pickups:", error);
        setPickups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPickups();
  }, [userId]);

  const orderHistory = pickups.filter((p) =>
    p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.wasteType.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { icon: any; label: string; color: string }> = {
      pending: {
        icon: Clock,
        label: "Menunggu",
        color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-900",
      },
      accepted: {
        icon: AlertCircle,
        label: "Diterima",
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-200 dark:border-blue-900",
      },
      "in-progress": {
        icon: Package,
        label: "Sedang Diproses",
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-200 dark:border-purple-900",
      },
      completed: {
        icon: CheckCircle,
        label: "Selesai",
        color: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-200 dark:border-green-900",
      },
      cancelled: {
        icon: AlertCircle,
        label: "Dibatalkan",
        color: "bg-red-500/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-900",
      },
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getDeliveryBadge = (method: string) => {
    if (method === "dropoff") {
      return <Badge variant="secondary">Drop Off</Badge>;
    }
    return <Badge variant="outline">Pickup</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Riwayat Pesanan</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Semua pesanan sampah dari {userName || "Anda"} - lengkap dengan status dan tanggal
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Cari berdasarkan alamat atau jenis sampah..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-pickup-search"
        />
      </div>

      {/* Order History List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
        </div>
      ) : orderHistory.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Package className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? "Tidak ada pesanan yang sesuai dengan pencarian" : "Belum ada riwayat pesanan"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orderHistory.map((pickup) => (
            <Card key={pickup.id} className="hover-elevate" data-testid={`pickup-card-${pickup.id}`}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Waste Type */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Jenis Sampah</p>
                    <p className="font-semibold text-lg">{pickup.wasteType}</p>
                    <p className="text-xs text-gray-500 mt-1">{pickup.quantity || "-"}</p>
                  </div>

                  {/* Address */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Alamat</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium">{pickup.address}</p>
                    </div>
                  </div>

                  {/* Status & Method */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Status</p>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(pickup.status)}
                      {getDeliveryBadge(pickup.deliveryMethod)}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      Rp {pickup.price.toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Diminta {new Date(pickup.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>

                {/* Driver Tracking - Show when in-progress and driver assigned */}
                {pickup.status === "in-progress" && pickup.assignedDriverId && drivers[pickup.assignedDriverId] && (
                  <div className="mt-6 pt-6 border-t">
                    <OrderTracking
                      pickupId={pickup.id}
                      driverId={pickup.assignedDriverId}
                      driver={drivers[pickup.assignedDriverId]}
                      driverRating={4.5}
                    />
                  </div>
                )}

                {/* Notes */}
                {pickup.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Catatan</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{pickup.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {orderHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Pesanan</p>
                <p className="text-2xl font-bold">{orderHistory.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Nilai</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Rp {orderHistory.reduce((sum, p) => sum + p.price, 0).toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Methods</p>
                <div className="flex gap-2 mt-2">
                  {orderHistory.some((p) => p.deliveryMethod === "pickup") && (
                    <span className="text-xs font-semibold">Pickup: {orderHistory.filter((p) => p.deliveryMethod === "pickup").length}</span>
                  )}
                  {orderHistory.some((p) => p.deliveryMethod === "dropoff") && (
                    <span className="text-xs font-semibold">Drop Off: {orderHistory.filter((p) => p.deliveryMethod === "dropoff").length}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
