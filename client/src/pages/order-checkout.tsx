import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, ArrowLeft, Zap, Loader, Clock, Phone, Navigation } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  image?: string;
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

const mockItems: Record<string, OrderItem> = {
  "1": { id: "1", name: "Plastik", price: 50000, image: "attached_assets/stock_images/plastic_waste_garbag_74fd1d20.jpg" },
  "2": { id: "2", name: "Kertas", price: 45000, image: "attached_assets/stock_images/plastic_waste_garbag_727aee39.jpg" },
  "3": { id: "3", name: "Logam", price: 80000, image: "attached_assets/stock_images/plastic_waste_garbag_6029a7f5.jpg" },
  "4": { id: "4", name: "Organik", price: 30000, image: "attached_assets/stock_images/plastic_waste_garbag_2773def9.jpg" },
};

export default function OrderCheckout({ itemId, userId }: { itemId: string; userId?: number }) {
  const [, setLocation] = useLocation();
  const item = mockItems[itemId];
  const [orderType, setOrderType] = useState("pickup");
  const [formData, setFormData] = useState({ address: "", quantity: "", notes: "" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    if (orderType === "dropoff") {
      const fetchPoints = async () => {
        setLoading(true);
        try {
          const response = await fetch("/api/collection-points");
          const data = await response.json();
          setCollectionPoints(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Failed to fetch collection points:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPoints();
    }
  }, [orderType]);

  const handleGetGpsLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung oleh browser Anda");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use Nominatim (OpenStreetMap) for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const address = data.address?.road || data.address?.city_district || data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setFormData({ ...formData, address });
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          setFormData({ ...formData, address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` });
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Tidak dapat mengakses lokasi. Pastikan Anda telah memberikan izin akses GPS.");
        setGpsLoading(false);
      }
    );
  };

  if (!item) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setLocation("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Item tidak ditemukan</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmitOrder = () => {
    if (!formData.quantity) {
      alert("Jumlah sampah harus diisi");
      return;
    }
    if (orderType === "pickup" && !formData.address) {
      alert("Alamat pengambilan harus diisi");
      return;
    }
    if (orderType === "dropoff" && !selectedPoint) {
      alert("Pilih lokasi pengumpulan terlebih dahulu");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmOrder = async () => {
    if (!userId) {
      alert("User ID tidak ditemukan");
      return;
    }

    setIsSubmitting(true);
    try {
      let orderAddress = formData.address;
      if (orderType === "dropoff" && selectedPoint) {
        const selectedPointData = collectionPoints.find(p => p.id === selectedPoint);
        orderAddress = selectedPointData ? `${selectedPointData.name} - ${selectedPointData.address}` : "Lokasi Pengumpulan";
      }

      const response = await fetch("/api/pickups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: orderAddress,
          wasteType: item.name,
          quantity: formData.quantity,
          deliveryMethod: orderType,
          status: "pending",
          requestedById: userId,
          notes: formData.notes,
          price: totalPrice,
          catalogItemId: parseInt(item.id),
        }),
      });

      if (!response.ok) throw new Error("Gagal membuat pesanan");

      alert(`Pesanan ${item.name} untuk ${orderType} berhasil dibuat!`);
      setLocation("/pickups");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Gagal membuat pesanan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total price (base price * quantity)
  const totalPrice = item.price * (parseInt(formData.quantity) || 0);

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => setLocation("/dashboard")} data-testid="button-back-order">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Dashboard
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {item.image && (
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Jenis Sampah</p>
              <h2 className="text-2xl font-bold">{item.name}</h2>
            </div>
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400">Harga per Unit</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                Rp {item.price.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Estimasi</p>
              <p className="text-2xl font-bold">
                Rp {(item.price * (parseInt(formData.quantity) || 0)).toLocaleString("id-ID") || "0"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detail Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Pilih Layanan</Label>
              <RadioGroup value={orderType} onValueChange={setOrderType}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover-elevate cursor-pointer">
                  <RadioGroupItem value="pickup" id="pickup" data-testid="radio-pickup" />
                  <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">Pickup</p>
                        <p className="text-sm text-gray-600">Pengemudi datang ke lokasi Anda</p>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-4 border rounded-lg hover-elevate cursor-pointer">
                  <RadioGroupItem value="dropoff" id="dropoff" data-testid="radio-dropoff" />
                  <Label htmlFor="dropoff" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold">Drop Off</p>
                        <p className="text-sm text-gray-600">Anda bawa ke lokasi pengumpulan BlueCycle</p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Location */}
            {orderType === "pickup" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="address">Alamat Pengambilan *</Label>
                  <Button 
                    type="button"
                    size="sm" 
                    variant="outline"
                    onClick={handleGetGpsLocation}
                    disabled={gpsLoading}
                    data-testid="button-get-gps"
                    className="flex items-center gap-1"
                  >
                    <Navigation className="h-3 w-3" />
                    {gpsLoading ? "Mencari..." : "Ambil GPS"}
                  </Button>
                </div>
                <Input
                  id="address"
                  placeholder="Alamat rumah/kantor Anda atau klik 'Ambil GPS'"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1"
                  data-testid="input-order-address"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <Label>Pilih Lokasi Pengumpulan *</Label>
                {loading ? (
                  <p className="text-gray-600">Memuat lokasi...</p>
                ) : collectionPoints.length === 0 ? (
                  <p className="text-gray-600">Tidak ada lokasi tersedia</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
                    {collectionPoints.map((point) => (
                      <Card 
                        key={point.id} 
                        className={`cursor-pointer hover-elevate ${selectedPoint === point.id ? "ring-2 ring-green-500" : ""}`}
                        onClick={() => setSelectedPoint(point.id)}
                        data-testid={`card-collection-point-select-${point.id}`}
                      >
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm">{point.name}</h4>
                                <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" /> {point.address}
                                </p>
                              </div>
                              <Badge className={point.status === "available" ? "bg-green-100 text-green-800 dark:bg-green-900" : "bg-red-100 text-red-800"}>
                                {point.status === "available" ? "Buka" : "Penuh"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              {point.operatingHours && (
                                <>
                                  <Clock className="h-3 w-3" />
                                  <span>{point.operatingHours}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">Jumlah Sampah *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="Contoh: 5 (kg/dus/kantong)"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="mt-1"
                data-testid="input-order-quantity"
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Catatan Tambahan</Label>
              <Input
                id="notes"
                placeholder="Deskripsi kondisi sampah, instruksi khusus, dll"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1"
                data-testid="input-order-notes"
              />
            </div>

            {/* Submit */}
            <Button 
              onClick={handleSubmitOrder} 
              className="w-full h-10"
              data-testid="button-review-order"
            >
              <Zap className="h-4 w-4 mr-2" />
              Lanjut ke Review
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pesanan</DialogTitle>
            <DialogDescription>Periksa kembali detail pesanan Anda</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Jenis Sampah:</span>
                <span className="font-semibold">{item.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Layanan:</span>
                <span className="font-semibold">{orderType === "pickup" ? "Pickup" : "Drop Off"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Jumlah:</span>
                <span className="font-semibold">{formData.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Alamat:</span>
                <span className="font-semibold text-right text-sm">{formData.address}</span>
              </div>
              <div className="pt-3 border-t flex justify-between">
                <span className="font-semibold">Total Estimasi:</span>
                <span className="text-xl font-bold text-green-600">
                  Rp {(item.price * parseInt(formData.quantity)).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleConfirmOrder} disabled={isSubmitting} data-testid="button-confirm-order">
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Membuat Pesanan...
                </>
              ) : (
                "Pesan Sekarang"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
