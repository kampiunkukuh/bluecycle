import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader, AlertCircle, MapPin, Calendar, Package, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WasteDisposal {
  id: number;
  pickupId: number;
  collectionPointId?: number;
  disposalType: string;
  disposalFacility: string;
  disposalDate?: Date;
  quantity?: number;
  certificateUrl?: string;
  createdAt: Date;
}

interface Pickup {
  id: number;
  address: string;
  wasteType: string;
  quantity?: string;
  price: number;
  status: string;
}

export default function WasteDisposalTracking() {
  const { toast } = useToast();
  const [disposals, setDisposals] = useState<WasteDisposal[]>([]);
  const [pickups, setPickups] = useState<Record<number, Pickup>>({});
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPickupId, setSelectedPickupId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    disposalType: "recycling",
    disposalFacility: "",
    quantity: "",
    certificateUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDisposals();
  }, []);

  const fetchDisposals = async () => {
    try {
      setLoading(true);
      const [disposalsRes, pickupsRes] = await Promise.all([
        fetch("/api/waste-disposals"),
        fetch("/api/pickups?status=completed"),
      ]);

      const disposalsData = await disposalsRes.json();
      const pickupsData = await pickupsRes.json();

      setDisposals(Array.isArray(disposalsData) ? disposalsData : []);

      // Create pickup lookup
      const pickupMap: Record<number, Pickup> = {};
      if (Array.isArray(pickupsData)) {
        pickupsData.forEach((p: Pickup) => {
          pickupMap[p.id] = p;
        });
      }
      setPickups(pickupMap);
    } catch (error) {
      console.error("Failed to fetch disposals:", error);
      toast({ title: "Gagal memuat data pembuangan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDisposal = async () => {
    if (!selectedPickupId || !formData.disposalFacility) {
      toast({ title: "Lengkapi semua field yang diperlukan", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/waste-disposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupId: selectedPickupId,
          disposalType: formData.disposalType,
          disposalFacility: formData.disposalFacility,
          quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
          certificateUrl: formData.certificateUrl || undefined,
          disposalDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to add disposal");

      const newDisposal = await response.json();
      setDisposals([...disposals, newDisposal]);
      setShowDialog(false);
      setFormData({ disposalType: "recycling", disposalFacility: "", quantity: "", certificateUrl: "" });
      setSelectedPickupId(null);
      toast({ title: "Pembuangan sampah tercatat", description: "Data telah disimpan ke database" });
    } catch (error) {
      console.error("Error adding disposal:", error);
      toast({ title: "Gagal menambah data pembuangan", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const getDisposalBadgeColor = (type: string) => {
    switch (type) {
      case "recycling":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100";
      case "landfill":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100";
      case "composting":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100";
    }
  };

  const completedPickups = Object.values(pickups).filter((p) => p.status === "completed" && !disposals.some((d) => d.pickupId === p.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pelacakan Pembuangan Sampah</h1>
        <p className="text-gray-600 dark:text-gray-400">Lacak dan konfirmasi lokasi akhir pembuangan sampah (TPA/Daur Ulang)</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Riwayat Pembuangan</CardTitle>
          <Button onClick={() => setShowDialog(true)} size="sm" data-testid="button-add-disposal">
            + Catat Pembuangan
          </Button>
        </CardHeader>
        <CardContent>
          {disposals.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Belum ada data pembuangan sampah</p>
            </div>
          ) : (
            <div className="space-y-4">
              {disposals.map((disposal) => {
                const pickup = pickups[disposal.pickupId];
                return (
                  <div key={disposal.id} className="border rounded-lg p-4 hover-elevate" data-testid={`disposal-item-${disposal.id}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getDisposalBadgeColor(disposal.disposalType)}>
                            {disposal.disposalType === "recycling" && "Daur Ulang"}
                            {disposal.disposalType === "landfill" && "TPA"}
                            {disposal.disposalType === "composting" && "Komposting"}
                          </Badge>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {pickup?.wasteType || "Jenis Sampah"}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">{disposal.disposalFacility}</p>
                        {pickup?.address && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {pickup.address}
                          </p>
                        )}
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      {disposal.quantity && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Package className="h-4 w-4" />
                          <span>{disposal.quantity} kg</span>
                        </div>
                      )}
                      {disposal.disposalDate && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(disposal.disposalDate).toLocaleDateString("id-ID")}</span>
                        </div>
                      )}
                      {disposal.certificateUrl && (
                        <a
                          href={disposal.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 flex items-center gap-1"
                          data-testid={`cert-link-${disposal.id}`}
                        >
                          <Building2 className="h-4 w-4" />
                          Sertifikat
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Disposal Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catat Pembuangan Sampah Baru</DialogTitle>
            <DialogDescription>Masukkan detail lokasi dan metode pembuangan akhir sampah</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Pilih Pesanan Selesai *</Label>
              <Select value={selectedPickupId?.toString() || ""} onValueChange={(v) => setSelectedPickupId(parseInt(v))}>
                <SelectTrigger data-testid="select-pickup">
                  <SelectValue placeholder="Pilih pesanan" />
                </SelectTrigger>
                <SelectContent>
                  {completedPickups.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      #{p.id} - {p.wasteType} ({p.quantity || "qty tidak terdaftar"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipe Pembuangan *</Label>
              <Select value={formData.disposalType} onValueChange={(v) => setFormData({ ...formData, disposalType: v })}>
                <SelectTrigger data-testid="select-disposal-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recycling">Daur Ulang</SelectItem>
                  <SelectItem value="landfill">TPA (Tempat Pemrosesan Akhir)</SelectItem>
                  <SelectItem value="composting">Komposting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Nama Fasilitas Pembuangan *</Label>
              <Input
                placeholder="Contoh: TPA Batam Pusat"
                value={formData.disposalFacility}
                onChange={(e) => setFormData({ ...formData, disposalFacility: e.target.value })}
                data-testid="input-facility"
              />
            </div>

            <div>
              <Label>Kuantitas (kg)</Label>
              <Input
                type="number"
                placeholder="50"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                data-testid="input-quantity"
              />
            </div>

            <div>
              <Label>URL Sertifikat Pembuangan</Label>
              <Input
                placeholder="https://..."
                value={formData.certificateUrl}
                onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })}
                data-testid="input-certificate"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} data-testid="button-cancel">
              Batal
            </Button>
            <Button onClick={handleAddDisposal} disabled={submitting} data-testid="button-confirm-disposal">
              {submitting ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
              Simpan Pembuangan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
