import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, TrendingUp, Recycle, Send, MapPin, Calendar, Plus } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  type: "request" | "earnings" | "withdrawal";
  amount: number;
  description: string;
  status?: string;
}

interface CatalogItem {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface UserDashboardProps {
  userId?: number;
  userName?: string;
}

const mockCatalog: CatalogItem[] = [
  { id: "1", name: "Plastik", price: 50000, description: "Sampah plastik umum" },
  { id: "2", name: "Kertas", price: 45000, description: "Kertas bekas/kardus" },
  { id: "3", name: "Logam", price: 80000, description: "Kaleng, besi bekas" },
];

const mockTransactions: Transaction[] = [
  { id: "1", date: "24 Nov 2024", type: "request", amount: 50000, description: "Permintaan pengambilan sampah plastik" },
  { id: "2", date: "23 Nov 2024", type: "earnings", amount: 25000, description: "Bonus referral dari teman" },
  { id: "3", date: "20 Nov 2024", type: "withdrawal", amount: 100000, description: "Penarikan dana ke BCA", status: "completed" },
];

export default function UserDashboard({ userId, userName }: UserDashboardProps) {
  const [catalog] = useState<CatalogItem[]>(mockCatalog);
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestData, setRequestData] = useState({ wasteType: "", quantity: "", address: "" });

  const totalSaldo = 250000;
  const availableSaldo = 150000;
  const pendingRequests = 3;

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard {userName || "Pelanggan"}</h1>
        <p className="text-gray-600 dark:text-gray-400">Kelola pemesanan dan reward Anda bersama BlueCycle</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Recycle className="h-4 w-4" />
              Permintaan Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {pendingRequests}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Dalam antrian</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pickups" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pickups">Permintaan Pickup</TabsTrigger>
          <TabsTrigger value="catalog">Katalog Sampah</TabsTrigger>
          <TabsTrigger value="transactions">Riwayat</TabsTrigger>
        </TabsList>

        {/* Pickups Tab */}
        <TabsContent value="pickups" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Permintaan Pengambilan Sampah</CardTitle>
              <Button onClick={() => setShowRequestDialog(true)} size="sm" data-testid="button-new-pickup">
                <Plus className="h-4 w-4 mr-2" />
                Buat Permintaan
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockTransactions
                .filter((t) => t.type === "request")
                .map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <Recycle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{req.description}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {req.date}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
                      Rp {req.amount.toLocaleString("id-ID")}
                    </Badge>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

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
                  <div key={item.id} className="p-4 border rounded-lg hover-elevate space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                      </div>
                      <Recycle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Harga per unit</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <Button size="sm" className="w-full mt-2" data-testid={`button-request-${item.id}`}>
                      Pesan Sekarang
                    </Button>
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
              <CardTitle>Riwayat Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        tx.type === "request"
                          ? "bg-green-100 dark:bg-green-900"
                          : tx.type === "earnings"
                            ? "bg-blue-100 dark:bg-blue-900"
                            : "bg-purple-100 dark:bg-purple-900"
                      }`}
                    >
                      {tx.type === "request" && <Recycle className="h-5 w-5 text-green-600 dark:text-green-400" />}
                      {tx.type === "earnings" && <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                      {tx.type === "withdrawal" && <Send className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {tx.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {tx.type === "withdrawal" ? "-" : "+"}Rp {tx.amount.toLocaleString("id-ID")}
                    </p>
                    {tx.status && (
                      <Badge
                        className={`text-xs mt-1 ${
                          tx.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        } border-0`}
                      >
                        {tx.status === "completed" ? "Selesai" : "Tertunda"}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Pickup Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Permintaan Pengambilan</DialogTitle>
            <DialogDescription>Ajukan permintaan pengambilan sampah Anda</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="wasteType">Jenis Sampah *</Label>
              <Input
                id="wasteType"
                placeholder="Pilih jenis sampah"
                value={requestData.wasteType}
                onChange={(e) => setRequestData({ ...requestData, wasteType: e.target.value })}
                data-testid="input-waste-type"
              />
            </div>
            <div>
              <Label htmlFor="address">Alamat Pengambilan *</Label>
              <Input
                id="address"
                placeholder="Masukkan alamat lengkap"
                value={requestData.address}
                onChange={(e) => setRequestData({ ...requestData, address: e.target.value })}
                data-testid="input-pickup-address"
              />
            </div>
            <div>
              <Label htmlFor="quantity">Perkiraan Jumlah</Label>
              <Input
                id="quantity"
                placeholder="Contoh: 5 kg, 10 dus, 2 kantong"
                value={requestData.quantity}
                onChange={(e) => setRequestData({ ...requestData, quantity: e.target.value })}
                data-testid="input-quantity"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleRequestPickup} data-testid="button-submit-pickup">
              Buat Permintaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
