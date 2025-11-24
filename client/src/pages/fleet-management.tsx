import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Users, TrendingUp, Phone, Mail, Wallet, DollarSign, Search, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Driver {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bankName?: string;
  bankAccount?: string;
  role: "driver";
}

interface DriverEarnings {
  [driverId: number]: number;
}

export default function FleetManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [earnings, setEarnings] = useState<DriverEarnings>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editData, setEditData] = useState({ name: "", phone: "", bankName: "", bankAccount: "" });

  // Fetch drivers dari database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await fetch("/api/users");
        const usersData = await usersRes.json();
        
        // Filter hanya drivers
        const driversData = Array.isArray(usersData) ? usersData.filter((u: any) => u.role === "driver") : [];
        setDrivers(driversData);
        setFilteredDrivers(driversData);

        // Fetch earnings untuk setiap driver
        const earningsMap: DriverEarnings = {};
        for (const driver of driversData) {
          try {
            const earningsRes = await fetch(`/api/driver-earnings/${driver.id}`);
            const earningsData = await earningsRes.json();
            if (Array.isArray(earningsData)) {
              earningsMap[driver.id] = earningsData.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
            }
          } catch (err) {
            earningsMap[driver.id] = 0;
          }
        }
        setEarnings(earningsMap);
      } catch (error) {
        console.error("Gagal fetch driver data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter drivers berdasarkan search
  useEffect(() => {
    const filtered = drivers.filter(
      (driver) =>
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDrivers(filtered);
  }, [searchQuery, drivers]);

  const handleSelectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setEditData({
      name: driver.name,
      phone: driver.phone || "",
      bankName: driver.bankName || "",
      bankAccount: driver.bankAccount || "",
    });
  };

  const handleEditSave = async () => {
    if (!selectedDriver) return;
    try {
      const res = await fetch(`/api/users/${selectedDriver.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editData.name,
          phone: editData.phone,
          bankName: editData.bankName,
          bankAccount: editData.bankAccount,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDrivers(drivers.map((d) => (d.id === updated.id ? updated : d)));
        setSelectedDriver(updated);
        setShowEditDialog(false);
      }
    } catch (error) {
      console.error("Gagal update driver:", error);
    }
  };

  const totalEarnings = Object.values(earnings).reduce((sum, val) => sum + val, 0);
  const avgEarnings = drivers.length > 0 ? Math.floor(totalEarnings / drivers.length) : 0;

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Navbar Manajemen Armada */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-950 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Manajemen Armada BlueCycle</h1>
              <p className="text-blue-100">Fleet Management & Driver Dashboard</p>
            </div>
          </div>
        </div>

        {/* Fleet Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-500 bg-opacity-30 p-3 rounded-lg">
            <p className="text-xs text-blue-100">Total Driver</p>
            <p className="text-2xl font-bold">{drivers.length}</p>
          </div>
          <div className="bg-green-500 bg-opacity-30 p-3 rounded-lg">
            <p className="text-xs text-blue-100">Total Earnings</p>
            <p className="text-2xl font-bold">Rp {totalEarnings.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-yellow-500 bg-opacity-30 p-3 rounded-lg">
            <p className="text-xs text-blue-100">Rata-Rata Earnings</p>
            <p className="text-2xl font-bold">Rp {avgEarnings.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-purple-500 bg-opacity-30 p-3 rounded-lg">
            <p className="text-xs text-blue-100">80% Revenue Split</p>
            <p className="text-2xl font-bold">Rp {Math.round(totalEarnings * 0.8).toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>

      {!selectedDriver ? (
        // Daftar Driver
        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Daftar Driver</h2>
            <p className="text-gray-600 dark:text-gray-400">Kelola seluruh driver dan kendaraan armada</p>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-drivers"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrivers.map((driver) => (
              <Card
                key={driver.id}
                className="hover-elevate cursor-pointer"
                onClick={() => handleSelectDriver(driver)}
                data-testid={`card-driver-${driver.id}`}
              >
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{driver.name}</h3>
                        <p className="text-sm text-gray-500">{driver.email}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Driver
                      </Badge>
                    </div>

                    <div className="space-y-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm">
                      {driver.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-500" />
                          <span>{driver.phone}</span>
                        </div>
                      )}
                      {driver.bankName && (
                        <div className="flex items-center gap-2">
                          <Wallet className="h-3 w-3 text-gray-500" />
                          <span>{driver.bankName} - {driver.bankAccount}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span className="font-semibold">Rp {(earnings[driver.id] || 0).toLocaleString("id-ID")}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="w-full"
                      variant="default"
                      data-testid={`button-manage-driver-${driver.id}`}
                    >
                      Kelola Driver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        // Detail Driver
        <div className="space-y-6">
          <div className="flex items-center gap-4 justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedDriver.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">Driver ID: #{selectedDriver.id}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedDriver(null)}
              data-testid="button-back-drivers"
            >
              ← Kembali ke Daftar
            </Button>
          </div>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Informasi</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="payment">Pembayaran</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Data Driver</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowEditDialog(true)}
                    data-testid="button-edit-driver"
                  >
                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-600 dark:text-gray-400">Nama</Label>
                    <p className="text-lg font-semibold">{selectedDriver.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600 dark:text-gray-400">Email</Label>
                    <p className="text-lg flex items-center gap-2">
                      <Mail className="h-4 w-4" /> {selectedDriver.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600 dark:text-gray-400">Nomor Telepon</Label>
                    <p className="text-lg">{selectedDriver.phone || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600 dark:text-gray-400">Bank Tujuan</Label>
                    <p className="text-lg">{selectedDriver.bankName || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600 dark:text-gray-400">Nomor Rekening</Label>
                    <p className="text-lg font-mono">{selectedDriver.bankAccount || "-"}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="earnings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" /> Total Earnings (80%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600">
                    Rp {(earnings[selectedDriver.id] || 0).toLocaleString("id-ID")}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Saldo driver dihitung dari 80% revenue dari setiap order pickup yang berhasil diselesaikan
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" /> Status Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      Lihat riwayat pembayaran dan withdraw requests di menu "Pembayaran" untuk approval dan management.
                    </p>
                  </div>
                  <Button className="w-full" variant="outline" data-testid="button-view-payments">
                    Lihat Detail Pembayaran →
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Driver</DialogTitle>
            <DialogDescription>Perbarui informasi driver</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                placeholder="Nama driver"
                data-testid="input-edit-driver-name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                placeholder="08xx xxxx xxxx"
                data-testid="input-edit-driver-phone"
              />
            </div>
            <div>
              <Label htmlFor="bank">Bank</Label>
              <Input
                id="bank"
                value={editData.bankName}
                onChange={(e) => setEditData({ ...editData, bankName: e.target.value })}
                placeholder="BCA, Mandiri, BNI, etc."
                data-testid="input-edit-driver-bank"
              />
            </div>
            <div>
              <Label htmlFor="account">Nomor Rekening</Label>
              <Input
                id="account"
                value={editData.bankAccount}
                onChange={(e) => setEditData({ ...editData, bankAccount: e.target.value })}
                placeholder="Nomor rekening"
                data-testid="input-edit-driver-account"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Batal</Button>
            <Button onClick={handleEditSave} data-testid="button-save-driver-edit">Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
