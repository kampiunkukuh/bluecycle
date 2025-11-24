import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2 } from "lucide-react";

interface CatalogItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
}

const mockCatalog: CatalogItem[] = [
  { 
    id: "1", 
    name: "Plastik", 
    price: 50000, 
    description: "Sampah plastik umum seperti botol, tas, dan wadah",
    image: "🏺"
  },
  { 
    id: "2", 
    name: "Kertas", 
    price: 45000, 
    description: "Kertas bekas, kardus, dan kemasan kertas lainnya",
    image: "📄"
  },
  { 
    id: "3", 
    name: "Logam", 
    price: 80000, 
    description: "Kaleng aluminium, besi bekas, dan logam lainnya",
    image: "⚙️"
  },
  { 
    id: "4", 
    name: "Organik", 
    price: 30000, 
    description: "Sisa makanan, daun, dan limbah organik",
    image: "🌿"
  },
];

export default function WasteCatalog() {
  const [catalog, setCatalog] = useState<CatalogItem[]>(mockCatalog);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", price: "", description: "", image: "" });

  const handleAddItem = () => {
    if (formData.name && formData.price && formData.description) {
      const newItem: CatalogItem = {
        id: Date.now().toString(),
        name: formData.name,
        price: parseInt(formData.price),
        description: formData.description,
        image: formData.image || "📦",
      };
      setCatalog([...catalog, newItem]);
      setFormData({ name: "", price: "", description: "", image: "" });
      setShowAddDialog(false);
    }
  };

  const handleEditItem = () => {
    if (editingId && formData.name && formData.price && formData.description) {
      setCatalog(
        catalog.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: formData.name,
                price: parseInt(formData.price),
                description: formData.description,
                image: formData.image || item.image,
              }
            : item
        )
      );
      setFormData({ name: "", price: "", description: "", image: "" });
      setEditingId(null);
      setShowEditDialog(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    setCatalog(catalog.filter((item) => item.id !== id));
  };

  const openEditDialog = (item: CatalogItem) => {
    setFormData({
      name: item.name,
      price: item.price.toString(),
      description: item.description,
      image: item.image || "",
    });
    setEditingId(item.id);
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Katalog Sampah</h1>
        <p className="text-gray-600 dark:text-gray-400">Kelola harga dan jenis sampah yang bisa diambil</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Sampah dengan Harga</CardTitle>
          <Button onClick={() => setShowAddDialog(true)} size="sm" data-testid="button-add-catalog">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Jenis
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalog.map((item) => (
              <div
                key={item.id}
                className="p-4 border rounded-lg hover-elevate space-y-3 flex flex-col"
                data-testid={`catalog-item-${item.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{item.image}</div>
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Harga Standar</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEditDialog(item)}
                    data-testid={`button-edit-${item.id}`}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDeleteItem(item.id)}
                    data-testid={`button-delete-${item.id}`}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Jenis Sampah Baru</DialogTitle>
            <DialogDescription>Tambahkan jenis sampah baru ke katalog dengan harga dan gambar</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Jenis Sampah *</Label>
              <Input
                id="name"
                placeholder="Contoh: Plastik, Kertas"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-catalog-name"
              />
            </div>
            <div>
              <Label htmlFor="price">Harga (Rp) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="Contoh: 50000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                data-testid="input-catalog-price"
              />
            </div>
            <div>
              <Label htmlFor="description">Deskripsi *</Label>
              <Input
                id="description"
                placeholder="Jelaskan jenis sampah ini"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="input-catalog-description"
              />
            </div>
            <div>
              <Label htmlFor="image">Emoji/Icon</Label>
              <Input
                id="image"
                placeholder="Contoh: 📦 atau 🏺"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                data-testid="input-catalog-image"
              />
              <p className="text-xs text-gray-500 mt-1">Gunakan emoji untuk visual (opsional)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleAddItem} data-testid="button-submit-catalog">
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Jenis Sampah</DialogTitle>
            <DialogDescription>Perbarui informasi harga dan gambar sampah</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nama Jenis Sampah *</Label>
              <Input
                id="edit-name"
                placeholder="Contoh: Plastik, Kertas"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-edit-catalog-name"
              />
            </div>
            <div>
              <Label htmlFor="edit-price">Harga (Rp) *</Label>
              <Input
                id="edit-price"
                type="number"
                placeholder="Contoh: 50000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                data-testid="input-edit-catalog-price"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Deskripsi *</Label>
              <Input
                id="edit-description"
                placeholder="Jelaskan jenis sampah ini"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="input-edit-catalog-description"
              />
            </div>
            <div>
              <Label htmlFor="edit-image">Emoji/Icon</Label>
              <Input
                id="edit-image"
                placeholder="Contoh: 📦 atau 🏺"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                data-testid="input-edit-catalog-image"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleEditItem} data-testid="button-update-catalog">
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
