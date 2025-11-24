import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Camera, CheckCircle2, AlertCircle, Download, Upload, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRTrackingRecord {
  id: number;
  pickupId: number;
  qrCode: string;
  pickupPhotoUrl?: string;
  deliveryPhotoUrl?: string;
  pickupVerifiedAt?: Date;
  deliveryVerifiedAt?: Date;
  certificateUrl?: string;
  createdAt: Date;
}

interface Pickup {
  id: number;
  wasteType: string;
  quantity?: string;
  address: string;
  status: string;
}

export default function QRTracking() {
  const { toast } = useToast();
  const [records, setRecords] = useState<QRTrackingRecord[]>([]);
  const [pickups, setPickups] = useState<Record<number, Pickup>>({});
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState<number | null>(null);
  const [photoType, setPhotoType] = useState<"pickup" | "delivery">("pickup");
  const [selectedPickupId, setSelectedPickupId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    qrCode: "",
    photoUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQRRecords();
  }, []);

  const fetchQRRecords = async () => {
    try {
      setLoading(true);
      const [recordsRes, pickupsRes] = await Promise.all([
        fetch("/api/qr-tracking"),
        fetch("/api/pickups"),
      ]);

      const recordsData = await recordsRes.json();
      const pickupsData = await pickupsRes.json();

      setRecords(Array.isArray(recordsData) ? recordsData : []);

      const pickupMap: Record<number, Pickup> = {};
      if (Array.isArray(pickupsData)) {
        pickupsData.forEach((p: Pickup) => {
          pickupMap[p.id] = p;
        });
      }
      setPickups(pickupMap);
    } catch (error) {
      console.error("Failed to fetch QR records:", error);
      toast({ title: "Gagal memuat data QR", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddQRRecord = async () => {
    if (!selectedPickupId || !formData.qrCode) {
      toast({ title: "Lengkapi QR Code", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/qr-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupId: selectedPickupId,
          qrCode: formData.qrCode,
        }),
      });

      if (!response.ok) throw new Error("Failed to create QR record");

      const newRecord = await response.json();
      setRecords([...records, newRecord]);
      setShowDialog(false);
      setFormData({ qrCode: "", photoUrl: "" });
      setSelectedPickupId(null);
      toast({ title: "QR Record dibuat", description: "Siap untuk verifikasi pickup" });
    } catch (error) {
      console.error("Error creating QR record:", error);
      toast({ title: "Gagal membuat QR record", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPhoto = async (recordId: number) => {
    if (!formData.photoUrl) {
      toast({ title: "Masukkan URL foto", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const updateData: Record<string, string | Date> = {};
      if (photoType === "pickup") {
        updateData.pickupPhotoUrl = formData.photoUrl;
        updateData.pickupVerifiedAt = new Date().toISOString();
      } else {
        updateData.deliveryPhotoUrl = formData.photoUrl;
        updateData.deliveryVerifiedAt = new Date().toISOString();
      }

      const response = await fetch(`/api/qr-tracking/${recordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error("Failed to update QR record");

      const updated = await response.json();
      setRecords(records.map((r) => (r.id === recordId ? updated : r)));
      setShowPhotoDialog(null);
      setFormData({ qrCode: "", photoUrl: "" });
      toast({ title: `Foto ${photoType === "pickup" ? "pengambilan" : "pengiriman"} terekam` });
    } catch (error) {
      console.error("Error updating QR record:", error);
      toast({ title: "Gagal menyimpan foto", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCertificate = (certificateUrl?: string) => {
    if (certificateUrl) {
      window.open(certificateUrl, "_blank");
    } else {
      toast({ title: "Sertifikat belum tersedia", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pelacakan QR Code</h1>
          <p className="text-gray-600 dark:text-gray-400">Verifikasi pickup dengan QR Code, foto, dan sertifikat</p>
        </div>
        <Button onClick={() => setShowDialog(true)} size="sm" data-testid="button-create-qr">
          <QrCode className="h-4 w-4 mr-2" />
          Buat QR Baru
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar QR Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Belum ada QR record</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => {
                const pickup = pickups[record.pickupId];
                return (
                  <div key={record.id} className="border rounded-lg p-4 hover-elevate" data-testid={`qr-record-${record.id}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">QR #{record.id}</Badge>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">{record.qrCode.slice(0, 12)}...</code>
                        </div>
                        {pickup && (
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {pickup.wasteType} - {pickup.quantity || "qty tidak terdaftar"}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {record.pickupVerifiedAt && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                        {record.deliveryVerifiedAt && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Status Pengambilan</p>
                        <div className="flex items-center gap-2">
                          {record.pickupPhotoUrl ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">Terverifikasi</span>
                            </>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => { setShowPhotoDialog(record.id); setPhotoType("pickup"); }} data-testid={`button-upload-pickup-${record.id}`}>
                              <Camera className="h-3 w-3 mr-1" />
                              Upload
                            </Button>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Status Pengiriman</p>
                        <div className="flex items-center gap-2">
                          {record.deliveryPhotoUrl ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">Terverifikasi</span>
                            </>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => { setShowPhotoDialog(record.id); setPhotoType("delivery"); }} data-testid={`button-upload-delivery-${record.id}`}>
                              <Camera className="h-3 w-3 mr-1" />
                              Upload
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {record.pickupPhotoUrl && record.deliveryPhotoUrl && (
                      <Button size="sm" onClick={() => handleDownloadCertificate(record.certificateUrl)} data-testid={`button-certificate-${record.id}`}>
                        <Download className="h-3 w-3 mr-1" />
                        Download Sertifikat
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create QR Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat QR Tracking Baru</DialogTitle>
            <DialogDescription>Generate QR Code untuk pesanan pickup</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Pilih Pesanan</Label>
              <select
                value={selectedPickupId?.toString() || ""}
                onChange={(e) => setSelectedPickupId(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
                data-testid="select-pickup-qr"
              >
                <option value="">-- Pilih Pesanan --</option>
                {Object.values(pickups).map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} - {p.wasteType}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>QR Code Value</Label>
              <Input
                placeholder="BLUECYCLE-2025-001"
                value={formData.qrCode}
                onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
                data-testid="input-qr-code"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Batal</Button>
            <Button onClick={handleAddQRRecord} disabled={submitting} data-testid="button-create-qr-confirm">
              {submitting ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <QrCode className="h-4 w-4 mr-2" />}
              Buat QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Photo Dialog */}
      <Dialog open={showPhotoDialog !== null} onOpenChange={() => setShowPhotoDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Foto {photoType === "pickup" ? "Pengambilan" : "Pengiriman"}</DialogTitle>
            <DialogDescription>Masukkan URL foto sebagai bukti {photoType === "pickup" ? "pengambilan" : "pengiriman"} sampah</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>URL Foto</Label>
              <Input
                placeholder="https://..."
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                data-testid="input-photo-url"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPhotoDialog(null)}>Batal</Button>
            <Button onClick={() => handleAddPhoto(showPhotoDialog!)} disabled={submitting} data-testid="button-save-photo">
              {submitting ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Simpan Foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
