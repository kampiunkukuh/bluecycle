import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { WasteCatalogItem, InsertWasteCatalogItem } from "@shared/schema";

export default function AdminCatalog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<InsertWasteCatalogItem>({
    userId: 1, // Admin user
    wasteType: "",
    description: "",
    price: 0,
    imageUrl: "",
  });

  const { data: items = [] } = useQuery<WasteCatalogItem[]>({
    queryKey: ["/api/waste-catalog"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertWasteCatalogItem) =>
      apiRequest("POST", "/api/waste-catalog", data),
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Item sampah ditambahkan" });
      queryClient.invalidateQueries({ queryKey: ["/api/waste-catalog"] });
      resetForm();
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menambahkan item sampah",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertWasteCatalogItem) =>
      apiRequest("PATCH", `/api/waste-catalog/${editingId}`, data),
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Item sampah diperbarui" });
      queryClient.invalidateQueries({ queryKey: ["/api/waste-catalog"] });
      resetForm();
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/waste-catalog/${id}`, {}),
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Item sampah dihapus" });
      queryClient.invalidateQueries({ queryKey: ["/api/waste-catalog"] });
    },
  });

  const resetForm = () => {
    setFormData({
      wasteType: "",
      description: "",
      pricePerKg: 0,
      imageUrl: "",
      category: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (item: WasteCatalogItem) => {
    setFormData(item);
    setEditingId(item.id);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Katalog Sampah</h1>
          <p className="text-muted-foreground mt-2">
            Kelola jenis sampah dan harga per kilogram
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Item Sampah
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Item Sampah" : "Tambah Item Sampah Baru"}
              </DialogTitle>
              <DialogDescription>
                Isi informasi lengkap tentang jenis sampah
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="wasteType">Jenis Sampah</Label>
                <Input
                  id="wasteType"
                  placeholder="contoh: Plastik, Logam, Kertas"
                  value={formData.wasteType || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, wasteType: e.target.value })
                  }
                  required
                  data-testid="input-waste-type"
                />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Input
                  id="description"
                  placeholder="Jelaskan jenis sampah ini"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  data-testid="input-description"
                />
              </div>
              <div>
                <Label htmlFor="price">Harga per Kilogram (Rp)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="5000"
                  value={formData.price || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  data-testid="input-price"
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">URL Gambar</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://..."
                  value={formData.imageUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  data-testid="input-image-url"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit-waste-item"
              >
                {editingId ? "Perbarui Item" : "Tambah Item"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="hover-elevate">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.wasteType}</h3>
                  {item.description && (
                    <p className="text-muted-foreground mt-1">{item.description}</p>
                  )}
                  <div className="flex gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Harga:</span>
                      <span className="ml-2 font-semibold">
                        Rp {item.price.toLocaleString("id-ID")}/kg
                      </span>
                    </div>
                  </div>
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.wasteType}
                      className="mt-4 h-32 w-32 rounded object-cover"
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                    data-testid={`button-edit-${item.id}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => deleteMutation.mutate(item.id)}
                    data-testid={`button-delete-${item.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Belum ada item sampah. Tambahkan sekarang!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
