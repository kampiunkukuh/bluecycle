import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Truck, MapPin, Calendar, Plus, Archive } from "lucide-react";

interface WasteDisposal {
  id: number;
  pickupId: number;
  collectionPointId: number;
  wasteType: string;
  quantityKg: number;
  disposalMethod: "landfill" | "recycle" | "incinerate" | "compost";
  status: "pending" | "in-transit" | "received" | "processed" | "disposed";
  dispatchDate: Date;
  arrivedDate?: Date;
  disposalDate?: Date;
  chainOfCustodyNotes?: string;
  finalConfirmation?: boolean;
  createdAt: Date;
}

interface CollectionPoint {
  id: number;
  name: string;
}

export default function WasteDisposal() {
  const [disposals, setDisposals] = useState<WasteDisposal[]>([]);
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [formData, setFormData] = useState({
    pickupId: "",
    collectionPointId: "",
    wasteType: "",
    quantityKg: "",
    disposalMethod: "recycle" as const,
    chainOfCustodyNotes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [disposalsRes, pointsRes] = await Promise.all([
          fetch("/api/waste-disposals"),
          fetch("/api/collection-points"),
        ]);
        const disposalsData = await disposalsRes.json();
        setDisposals(Array.isArray(disposalsData) ? disposalsData : []);
        const pointsData = await pointsRes.json();
        setCollectionPoints(Array.isArray(pointsData) ? pointsData : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!formData.pickupId || !formData.collectionPointId || !formData.wasteType || !formData.quantityKg) {
      alert("Semua field harus diisi");
      return;
    }

    const payload = {
      pickupId: parseInt(formData.pickupId),
      collectionPointId: parseInt(formData.collectionPointId),
      wasteType: formData.wasteType,
      quantityKg: parseInt(formData.quantityKg),
      disposalMethod: formData.disposalMethod,
      status: "pending",
      chainOfCustodyNotes: formData.chainOfCustodyNotes || null,
    };

    try {
      if (editingId) {
        const response = await fetch(`/api/waste-disposals/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const updated = await response.json();
          setDisposals(disposals.map((d) => (d.id === editingId ? updated : d)));
        }
      } else {
        const response = await fetch("/api/waste-disposals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const newDisposal = await response.json();
          setDisposals([...disposals, newDisposal]);
        }
      }
      setShowDialog(false);
      setFormData({ pickupId: "", collectionPointId: "", wasteType: "", quantityKg: "", disposalMethod: "recycle", chainOfCustodyNotes: "" });
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Gagal menyimpan data");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "in-transit": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      received: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      processed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      disposed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredDisposals = filterStatus === "all" ? disposals : disposals.filter((d) => d.status === filterStatus);
  const stats = {
    total: disposals.length,
    pending: disposals.filter((d) => d.status === "pending").length,
    inTransit: disposals.filter((d) => d.status === "in-transit").length,
    disposed: disposals.filter((d) => d.status === "disposed").length,
    totalKg: disposals.reduce((sum, d) => sum + d.quantityKg, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pelacakan Pembuangan Sampah</h1>
          <p className="text-gray-600 dark:text-gray-400">Pantau alur sampah dari pickup hingga pembuangan akhir</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); }} data-testid="button-add-disposal">
              <Plus className="h-4 w-4 mr-2" />
              Catat Pembuangan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Catat Pembuangan Sampah Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Pickup ID" type="number" value={formData.pickupId} onChange={(e) => setFormData({ ...formData, pickupId: e.target.value })} data-testid="input-wd-pickup" />
              <Select value={formData.collectionPointId} onValueChange={(v) => setFormData({ ...formData, collectionPointId: v })}>
                <SelectTrigger data-testid="select-wd-point">
                  <SelectValue placeholder="Pilih Lokasi Pengumpulan" />
                </SelectTrigger>
                <SelectContent>
                  {collectionPoints.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Jenis Sampah" value={formData.wasteType} onChange={(e) => setFormData({ ...formData, wasteType: e.target.value })} data-testid="input-wd-type" />
              <Input placeholder="Jumlah (kg)" type="number" value={formData.quantityKg} onChange={(e) => setFormData({ ...formData, quantityKg: e.target.value })} data-testid="input-wd-qty" />
              <Select value={formData.disposalMethod} onValueChange={(v) => setFormData({ ...formData, disposalMethod: v as any })}>
                <SelectTrigger data-testid="select-wd-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recycle">Daur Ulang</SelectItem>
                  <SelectItem value="landfill">TPA (Landfill)</SelectItem>
                  <SelectItem value="incinerate">Insinerasi</SelectItem>
                  <SelectItem value="compost">Kompos</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="Catatan Rantai Kustodi..." value={formData.chainOfCustodyNotes} onChange={(e) => setFormData({ ...formData, chainOfCustodyNotes: e.target.value })} data-testid="input-wd-notes" />
              <Button onClick={handleSave} className="w-full" data-testid="button-save-wd">
                Catat Pembuangan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Pembuangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.disposed}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Kg</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalKg.toLocaleString("id-ID")}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={filterStatus} onValueChange={setFilterStatus}>
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-transit">In Transit</TabsTrigger>
          <TabsTrigger value="disposed">Selesai</TabsTrigger>
        </TabsList>
        <TabsContent value={filterStatus} className="space-y-4">
          {loading ? (
            <div>Memuat...</div>
          ) : filteredDisposals.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">Belum ada data</CardContent>
            </Card>
          ) : (
            filteredDisposals.map((disposal) => (
              <Card key={disposal.id} data-testid={`card-disposal-${disposal.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Archive className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-semibold">{disposal.wasteType}</p>
                          <p className="text-sm text-gray-500">{disposal.quantityKg} kg • {disposal.disposalMethod}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mt-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(disposal.dispatchDate).toLocaleDateString("id-ID")}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(disposal.status)}>{disposal.status.replace("-", " ")}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
