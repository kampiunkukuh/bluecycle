import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Check, Loader } from "lucide-react";

interface OutstandingPickup {
  id: number;
  address: string;
  wasteType: string;
  price: number;
  createdAt: Date;
  status: string;
}

interface MyPickup {
  id: number;
  address: string;
  wasteType: string;
  status: string;
  price: number;
}

export default function DriverDashboard({ driverId = 3 }: { driverId?: number }) {
  const [outstanding, setOutstanding] = useState<OutstandingPickup[]>([]);
  const [myPickups, setMyPickups] = useState<MyPickup[]>([]);
  const [loadingOutstanding, setLoadingOutstanding] = useState(true);
  const [loadingMy, setLoadingMy] = useState(true);
  const [takingOrder, setTakingOrder] = useState<number | null>(null);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
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
        setMyPickups(myPickups.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Failed to complete pickup:", error);
      alert("Gagal menyelesaikan order");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Supir</h1>
        <p className="text-gray-600 dark:text-gray-400">Ambil order dan selesaikan pengambilan sampah</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Order Tersedia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{outstanding.length}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Menunggu diambil</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Order Saya</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{myPickups.length}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sedang dikerjakan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Earning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              Rp {(myPickups.reduce((sum, p) => sum + (p.price * 0.8 || 0), 0)).toLocaleString("id-ID")}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Estimasi (80%)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Tersedia (Outstanding)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
                        <p>Harga: Rp {pickup.price.toLocaleString("id-ID")}</p>
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
            <CardTitle>Order Saya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
    </div>
  );
}
