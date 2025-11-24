import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Check } from "lucide-react";

interface OutstandingPickup {
  id: string;
  address: string;
  wasteType: string;
  requestedBy: string;
  createdDate: string;
}

const mockOutstandingPickups: OutstandingPickup[] = [
  {
    id: "1",
    address: "Jl. Sudirman No. 123, Jakarta Pusat",
    wasteType: "Organik",
    requestedBy: "Budi Santoso",
    createdDate: "24 Nov 2024",
  },
  {
    id: "2",
    address: "Jl. Gatot Subroto No. 456, Jakarta Selatan",
    wasteType: "Daur Ulang",
    requestedBy: "Rina Wijaya",
    createdDate: "24 Nov 2024",
  },
  {
    id: "3",
    address: "Jl. Thamrin No. 789, Jakarta Pusat",
    wasteType: "Sampah Umum",
    requestedBy: "Hendra Kusuma",
    createdDate: "23 Nov 2024",
  },
];

const mockMyPickups = [
  {
    id: "101",
    address: "Jl. Ahmad Yani No. 111",
    wasteType: "Organik",
    status: "in-progress" as const,
  },
  {
    id: "102",
    address: "Jl. Diponegoro No. 222",
    wasteType: "Daur Ulang",
    status: "in-progress" as const,
  },
];

export default function DriverDashboard() {
  const [outstanding, setOutstanding] = useState(mockOutstandingPickups);
  const [myPickups, setMyPickups] = useState(mockMyPickups);

  const handleTakePickup = (id: string) => {
    const picked = outstanding.find((p) => p.id === id);
    if (picked) {
      setOutstanding(outstanding.filter((p) => p.id !== id));
      setMyPickups([...myPickups, { id: picked.id, address: picked.address, wasteType: picked.wasteType, status: "in-progress" }]);
    }
  };

  const handleCompletePickup = (id: string) => {
    setMyPickups(myPickups.filter((p) => p.id !== id));
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

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">12</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bulan ini</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Tersedia (Outstanding)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {outstanding.length === 0 ? (
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
                        <p>Dari: {pickup.requestedBy}</p>
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {pickup.createdDate}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleTakePickup(pickup.id)}
                    className="w-full h-9"
                    size="sm"
                    data-testid="button-take-pickup"
                  >
                    Ambil Order
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
            {myPickups.length === 0 ? (
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
