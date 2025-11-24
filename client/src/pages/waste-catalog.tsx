import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { WasteCatalogItem } from "@shared/schema";

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "driver";
}

interface WasteCatalogProps {
  userRole?: string;
  currentUser?: CurrentUser | null;
}

export default function WasteCatalog({ userRole, currentUser }: WasteCatalogProps = {}) {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: catalog = [], isLoading } = useQuery<WasteCatalogItem[]>({
    queryKey: ["/api/waste-catalog"],
  });

  const handleOrderClick = (item: WasteCatalogItem) => {
    setLocation(`/order/${item.id}`);
  };

  const categories = Array.from(new Set(catalog.map((item) => item.wasteType)));
  const filteredItems = selectedCategory
    ? catalog.filter((item) => item.wasteType === selectedCategory)
    : catalog;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Katalog Sampah</h1>
        <p className="text-muted-foreground">
          Lihat daftar lengkap jenis sampah dan harganya
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          data-testid="button-filter-all"
        >
          Semua ({catalog.length})
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            data-testid={`button-filter-${category}`}
          >
            {category} ({catalog.filter((i) => i.wasteType === category).length})
          </Button>
        ))}
      </div>

      {/* Catalog Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover-elevate overflow-hidden flex flex-col" data-testid={`card-waste-${item.id}`}>
            {item.imageUrl && (
              <div className="h-48 bg-muted overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.wasteType}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://images.unsplash.com/photo-1559931265-cd4628902ee4?w=500&h=400&fit=crop`;
                  }}
                />
              </div>
            )}
            <CardContent className="pt-6 flex-1 flex flex-col">
              <h3 className="font-bold text-lg mb-2">{item.wasteType}</h3>
              {item.description && (
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
              )}
              <div className="mt-auto pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-1">Harga</p>
                <p className="text-2xl font-bold text-primary mb-4" data-testid={`price-${item.id}`}>
                  Rp {item.price.toLocaleString("id-ID")}
                </p>
                <Button 
                  size="sm" 
                  className="w-full" 
                  onClick={() => handleOrderClick(item)}
                  data-testid={`button-order-${item.id}`}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Pesan Sekarang
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Tidak ada item sampah di kategori ini</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
