import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CatalogItem {
  id: string;
  wasteType: string;
  description: string;
}

const mockCatalog: CatalogItem[] = [
  { id: "1", wasteType: "Sampah Organik", description: "Sisa makanan, daun, rumput" },
  { id: "2", wasteType: "Plastik", description: "Botol, tas, kemasan plastik" },
  { id: "3", wasteType: "Kertas", description: "Kardus, kertas, karton" },
];

export default function WasteCatalog() {
  const [catalog, setCatalog] = useState<CatalogItem[]>(mockCatalog);
  const [showDialog, setShowDialog] = useState(false);
  const [newItem, setNewItem] = useState({ wasteType: "", description: "" });

  const handleAddItem = () => {
    if (newItem.wasteType.trim()) {
      const item: CatalogItem = {
        id: Date.now().toString(),
        wasteType: newItem.wasteType,
        description: newItem.description,
      };
      setCatalog([item, ...catalog]);
      setNewItem({ wasteType: "", description: "" });
      setShowDialog(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    setCatalog(catalog.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Katalog Sampah Saya</h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola jenis sampah yang sering Anda kirim</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="h-11" data-testid="button-add-waste">
          <Plus className="h-5 w-5 mr-2" />
          Tambah Sampah
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {catalog.map((item) => (
          <Card key={item.id} className="hover-elevate" data-testid={`card-waste-${item.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{item.wasteType}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                  className="h-8 w-8 p-0"
                  data-testid={`button-delete-waste-${item.id}`}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.description || "Tidak ada deskripsi"}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {catalog.length === 0 && (
        <Card className="text-center py-12">
          <div className="space-y-4">
            <Trash2 className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="text-lg font-semibold">Katalog Kosong</h3>
            <p className="text-sm text-gray-500">Mulai dengan menambahkan jenis sampah yang sering Anda kirim</p>
            <Button onClick={() => setShowDialog(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Item Pertama
            </Button>
          </div>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Jenis Sampah</DialogTitle>
            <DialogDescription>Tambahkan jenis sampah baru ke katalog Anda</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="wasteType">Jenis Sampah *</Label>
              <Input
                id="wasteType"
                placeholder="Contoh: Sampah Organik"
                value={newItem.wasteType}
                onChange={(e) => setNewItem({ ...newItem, wasteType: e.target.value })}
                data-testid="input-waste-type"
              />
            </div>
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Contoh: Sisa makanan, daun, rumput, dll"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="resize-none"
                data-testid="textarea-waste-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleAddItem} data-testid="button-save-waste">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
