import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Clock, Trash2, Edit2, Plus, AlertCircle } from "lucide-react";

interface CollectionPoint {
  id: number;
  name: string;
  address: string;
  latitude?: string;
  longitude?: string;
  capacity?: number;
  currentKg: number;
  status: "available" | "full" | "maintenance";
  operatingHours?: string;
  contactPerson?: string;
  phone?: string;
  createdAt: Date;
}

export default function CollectionPoints() {
  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    capacity: "",
    operatingHours: "",
    contactPerson: "",
    phone: "",
  });

  // Fetch collection points
  useEffect(() => {
    const fetchPoints = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/collection-points");
        const data = await response.json();
        setPoints(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch collection points:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPoints();
  }, []);

  const handleOpenDialog = (point?: CollectionPoint) => {
    if (point) {
      setEditingId(point.id);
      setFormData({
        name: point.name,
        address: point.address,
        latitude: point.latitude || "",
        longitude: point.longitude || "",
        capacity: point.capacity?.toString() || "",
        operatingHours: point.operatingHours || "",
        contactPerson: point.contactPerson || "",
        phone: point.phone || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
        capacity: "",
        operatingHours: "",
        contactPerson: "",
        phone: "",
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.address) {
      alert("Nama dan Alamat harus diisi");
      return;
    }

    const payload = {
      name: formData.name,
      address: formData.address,
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
      operatingHours: formData.operatingHours || null,
      contactPerson: formData.contactPerson || null,
      phone: formData.phone || null,
    };

    try {
      if (editingId) {
        const response = await fetch(`/api/collection-points/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const updated = await response.json();
          setPoints(points.map((p) => (p.id === editingId ? updated : p)));
        }
      } else {
        const response = await fetch("/api/collection-points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const newPoint = await response.json();
          setPoints([...points, newPoint]);
        }
      }
      setShowDialog(false);
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Gagal menyimpan data");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus lokasi ini?")) return;
    try {
      const response = await fetch(`/api/collection-points/${id}`, { method: "DELETE" });
      if (response.ok) {
        setPoints(points.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Gagal menghapus data");
    }
  };

  const getCapacityPercentage = (currentKg: number, capacity?: number) => {
    if (!capacity) return 0;
    return Math.round((currentKg / capacity) * 100);
  };

  const getStatusColor = (status: string) => {
    if (status === "available") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (status === "full") return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lokasi Pengumpulan</h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola titik kumpul sampah di seluruh kota</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} data-testid="button-add-collection-point">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Lokasi
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-collection-point">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Lokasi" : "Tambah Lokasi Baru"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nama Lokasi" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} data-testid="input-cp-name" />
              <Textarea placeholder="Alamat" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} data-testid="input-cp-address" />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Latitude" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} data-testid="input-cp-lat" />
                <Input placeholder="Longitude" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} data-testid="input-cp-lng" />
              </div>
              <Input placeholder="Kapasitas (kg)" type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} data-testid="input-cp-capacity" />
              <Input placeholder="Jam Operasional (misal: 08:00-17:00)" value={formData.operatingHours} onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })} data-testid="input-cp-hours" />
              <Input placeholder="Nama Kontak" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} data-testid="input-cp-contact" />
              <Input placeholder="Nomor Telepon" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} data-testid="input-cp-phone" />
              <Button onClick={handleSave} className="w-full" data-testid="button-save-cp">
                {editingId ? "Perbarui" : "Buat"} Lokasi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-10">Memuat data...</div>
      ) : points.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Belum ada lokasi pengumpulan</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {points.map((point) => {
            const capacityPct = getCapacityPercentage(point.currentKg, point.capacity);
            return (
              <Card key={point.id} className="hover-elevate" data-testid={`card-collection-point-${point.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{point.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={getStatusColor(point.status)} data-testid={`badge-status-${point.id}`}>
                          {point.status === "available" ? "Tersedia" : point.status === "full" ? "Penuh" : "Pemeliharaan"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(point)} data-testid={`button-edit-cp-${point.id}`}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(point.id)} data-testid={`button-delete-cp-${point.id}`}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{point.address}</span>
                    </div>
                    {point.operatingHours && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">{point.operatingHours}</span>
                      </div>
                    )}
                    {point.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">{point.phone}</span>
                      </div>
                    )}
                  </div>

                  {point.capacity && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Kapasitas</span>
                        <span className="text-sm text-gray-500" data-testid={`text-capacity-${point.id}`}>
                          {point.currentKg} / {point.capacity} kg ({capacityPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${capacityPct > 90 ? "bg-red-500" : capacityPct > 70 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${Math.min(capacityPct, 100)}%` }} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
