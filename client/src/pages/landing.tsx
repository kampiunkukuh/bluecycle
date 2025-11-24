import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Recycle, MapPin, TrendingUp, Shield, Users, Zap, ArrowRight, CheckCircle2, BarChart3, MessageSquare, Download, Briefcase, HelpCircle, Play } from "lucide-react";
import { FaApple } from "react-icons/fa";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LandingNavbar from "@/components/landing-navbar";

interface Stats {
  pickups: number;
  drivers: number;
  users: number;
  waste: number;
}

interface WasteCatalog {
  id: number;
  wasteType: string;
  description: string;
  price: number;
  imageUrl: string;
}

interface CollectionPoint {
  id: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  status: string;
  capacity: number;
  currentKg: number;
}

export default function Landing() {
  const [selectedWasteFilter, setSelectedWasteFilter] = useState<string | null>(null);

  // Fetch real-time stats
  const { data: stats = { pickups: 15847, drivers: 324, users: 8923, waste: 450 } as Stats } = useQuery<Stats>({
    queryKey: ['/api/stats'],
    refetchInterval: 5000,
  });

  // Fetch waste catalog
  const { data: wasteCatalog = [] as WasteCatalog[] } = useQuery<WasteCatalog[]>({
    queryKey: ['/api/waste-catalog'],
  });

  // Fetch collection points
  const { data: collectionPoints = [] as CollectionPoint[] } = useQuery<CollectionPoint[]>({
    queryKey: ['/api/collection-points'],
  });

  const filteredWaste = selectedWasteFilter 
    ? wasteCatalog.filter((w: WasteCatalog) => w.wasteType === selectedWasteFilter)
    : wasteCatalog;

  const wasteTypes = Array.from(new Set(wasteCatalog.map((w: WasteCatalog) => w.wasteType)));

  const features = [
    { title: "Pelacakan GPS Real-Time", desc: "Pantau pengambilan sampah secara real-time dengan akurasi tinggi", icon: MapPin },
    { title: "Dashboard Analitik", desc: "Laporan komprehensif dampak lingkungan dan efisiensi operasional", icon: TrendingUp },
    { title: "Sistem Pembayaran Aman", desc: "Komisi transparan 80/20 untuk pengemudi dan administrasi", icon: Shield },
    { title: "Kelola Tim Mudah", desc: "Manajemen pengguna, pengemudi, dan admin dalam satu platform", icon: Users },
    { title: "Otomasi Cerdas", desc: "Optimasi rute otomatis dan penjadwalan pickup yang efisien", icon: Zap },
    { title: "Verifikasi QR", desc: "Sistem QR dengan bukti foto untuk keamanan dan transparansi", icon: CheckCircle2 },
  ];

  const faqs = [
    { q: "Bagaimana cara saya meminta pengambilan sampah?", a: "Buka aplikasi, pilih 'Minta Pickup', tentukan lokasi dan jumlah sampah, lalu konfirmasi. Driver terdekat akan diberitahu secara otomatis." },
    { q: "Berapa komisi yang diterima pengemudi?", a: "Pengemudi menerima 80% dari harga pengambilan, platform mendapat 20%. Pembayaran langsung ke rekening bank Anda." },
    { q: "Apakah ada biaya pendaftaran?", a: "Tidak ada biaya pendaftaran untuk pengguna atau pengemudi. Pendaftaran gratis dan cepat." },
    { q: "Bagaimana verifikasi QR bekerja?", a: "Setelah pickup, sistem menghasilkan QR code dengan foto bukti. Scan QR untuk memverifikasi pengambilan." },
    { q: "Apakah tersedia di Android dan iOS?", a: "Ya! BlueCycle tersedia di Google Play Store (Android) dan Apple App Store (iOS)." },
    { q: "Bagaimana cara menjadi mitra atau vendor?", a: "Hubungi tim kemitraan kami melalui form partnership atau email business@bluecycle.com. Kami membuka peluang kolaborasi untuk pengumpulan poin." },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Kelola Sampah dengan <span className="text-primary">Cerdas</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Platform manajemen sampah terintegrasi untuk kota berkelanjutan. Tingkatkan efisiensi pengumpulan, optimalkan rute, dan bangun masa depan yang lebih hijau.
            </p>
            <div className="flex gap-4">
              <Link href="/login">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg" data-testid="button-get-started">
                  Mulai Sekarang <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg">
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-black text-primary mb-4">BlueCycle</div>
              <Recycle className="h-32 w-32 text-primary/40 mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Statistik Real-Time BlueCycle</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-8 bg-white dark:bg-slate-950 rounded-2xl border text-center hover-elevate">
              <div className="text-4xl font-bold text-primary mb-2">{stats.pickups.toLocaleString()}</div>
              <p className="text-muted-foreground">Pengambilan Berhasil</p>
            </div>
            <div className="p-8 bg-white dark:bg-slate-950 rounded-2xl border text-center hover-elevate">
              <div className="text-4xl font-bold text-primary mb-2">{stats.drivers}</div>
              <p className="text-muted-foreground">Pengemudi Aktif</p>
            </div>
            <div className="p-8 bg-white dark:bg-slate-950 rounded-2xl border text-center hover-elevate">
              <div className="text-4xl font-bold text-primary mb-2">{stats.users.toLocaleString()}</div>
              <p className="text-muted-foreground">Pengguna Terdaftar</p>
            </div>
            <div className="p-8 bg-white dark:bg-slate-950 rounded-2xl border text-center hover-elevate">
              <div className="text-4xl font-bold text-primary mb-2">{stats.waste}+</div>
              <p className="text-muted-foreground">Ton Sampah Terkelola</p>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Points Carousel */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-6">Titik Pengumpulan Sampah Batam</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Lokasi drop-off terdekat untuk pengumpulan sampah Anda
        </p>
        
        <div className="relative">
          <div className="grid md:grid-cols-3 gap-6">
            {collectionPoints.map((point: CollectionPoint, idx: number) => (
              <div key={idx} className="p-6 bg-white dark:bg-slate-950 rounded-2xl border hover-elevate">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg">{point.name}</h3>
                    <p className="text-sm text-muted-foreground">{point.address}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Kapasitas:</span>
                    <span className="font-semibold">{point.capacity} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Terisi:</span>
                    <span className="font-semibold">{point.currentKg} kg</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(point.currentKg / point.capacity) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 text-xs font-semibold">Buka Sekarang</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waste Catalog with Filter */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Daftar Jenis Sampah</h2>
          <p className="text-center text-muted-foreground mb-12">Filter sampah berdasarkan jenisnya dan lihat harga</p>
          
          {/* Filter Buttons */}
          <div className="flex gap-3 justify-center mb-12 flex-wrap">
            <Button 
              variant={selectedWasteFilter === null ? "default" : "outline"}
              onClick={() => setSelectedWasteFilter(null)}
              data-testid="filter-all-waste"
            >
              Semua Jenis ({wasteCatalog.length})
            </Button>
            {wasteTypes.map(type => {
              const count = wasteCatalog.filter(w => w.wasteType === type).length;
              return (
                <Button 
                  key={type}
                  variant={selectedWasteFilter === type ? "default" : "outline"}
                  onClick={() => setSelectedWasteFilter(type)}
                  data-testid={`filter-${type.toLowerCase()}`}
                >
                  {type} ({count})
                </Button>
              );
            })}
          </div>

          {/* Waste Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            {filteredWaste.map((waste: WasteCatalog, idx: number) => (
              <div key={idx} className="bg-white dark:bg-slate-950 rounded-2xl border overflow-hidden hover-elevate">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img 
                    src={waste.imageUrl} 
                    alt={waste.wasteType}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop`;
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{waste.wasteType}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{waste.description}</p>
                  <div className="text-2xl font-bold text-primary">
                    Rp {(waste.price / 1000).toLocaleString()}K
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto" id="features">
        <h2 className="text-4xl font-bold text-center mb-16">Fitur Unggulan</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="p-6 bg-white dark:bg-slate-950 rounded-2xl border hover-elevate">
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-20 bg-muted/30" id="faq">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 flex items-center justify-center gap-3">
            <HelpCircle className="h-8 w-8" />
            Pertanyaan Umum
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="p-6 bg-white dark:bg-slate-950 rounded-xl border group cursor-pointer">
                <summary className="font-semibold flex items-center justify-between">
                  {faq.q}
                  <MessageSquare className="h-5 w-5 text-primary group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-muted-foreground mt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto" id="partnership">
        <div className="grid md:grid-cols-2 gap-12 items-center bg-gradient-to-r from-primary/10 to-primary/5 p-12 rounded-3xl border-2 border-primary/30">
          <div>
            <h2 className="text-4xl font-bold mb-6 flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-primary" />
              Bergabung Sebagai Mitra
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Kami membuka peluang kerjasama dengan vendor, supplier, dan mitra bisnis yang ingin berkontribusi pada ekonomi sirkular.
            </p>
            <div className="space-y-3 mb-8">
              {["Komisi menarik untuk setiap transaksi", "Akses ke dashboard analytics lengkap", "Dukungan teknis 24/7", "Peningkatan brand awareness"].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Button size="lg" className="rounded-full h-12 px-8" data-testid="button-partnership">
              Hubungi Tim Partnership
            </Button>
          </div>
          <div className="relative h-80 bg-white dark:bg-slate-950 rounded-2xl flex items-center justify-center border">
            <Briefcase className="h-32 w-32 text-primary/20" />
          </div>
        </div>
      </section>

      {/* Mobile Download Section */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 flex items-center justify-center gap-3">
            <Download className="h-8 w-8" />
            Unduh BlueCycle
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="p-8 bg-white dark:bg-slate-950 rounded-2xl border text-center hover-elevate">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-400 via-blue-400 to-red-400 flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-white fill-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Google Play Store</h3>
              <p className="text-muted-foreground mb-6">Aplikasi BlueCycle untuk Android</p>
              <Button className="w-full rounded-full" data-testid="button-download-android">
                Download APK
              </Button>
            </div>
            <div className="p-8 bg-white dark:bg-slate-950 rounded-2xl border text-center hover-elevate">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-700 to-black flex items-center justify-center mx-auto mb-4">
                <FaApple className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Apple App Store</h3>
              <p className="text-muted-foreground mb-6">Aplikasi BlueCycle untuk iOS</p>
              <Button variant="outline" className="w-full rounded-full" data-testid="button-download-ios">
                Download iOS
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Siap Bergabung dengan BlueCycle?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Mulai hari ini dan jadilah bagian dari revolusi manajemen sampah yang berkelanjutan
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="rounded-full h-14 px-8" data-testid="button-start-now">
                Daftar Sekarang
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 border-white text-white hover:bg-white/10" data-testid="button-signin">
                Sudah Punya Akun?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t text-center text-muted-foreground">
        <p>© 2025 BlueCycle - Manajemen Sampah Cerdas untuk Masa Depan Berkelanjutan</p>
      </footer>
    </div>
  );
}
