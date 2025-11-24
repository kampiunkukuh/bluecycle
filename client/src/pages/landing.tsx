import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Recycle, MapPin, TrendingUp, Shield, Users, Zap, ArrowRight, CheckCircle2, BarChart3, MessageSquare, Download, Briefcase, HelpCircle, Leaf, Sparkles, Coins, BarChart2, Headphones, Eye } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LandingNavbar from "@/components/landing-navbar";
import partnershipImage from "@assets/stock_images/professional_busines_501d84a4.jpg";
import pickupImage from "@assets/stock_images/truck_collecting_was_763e7111.jpg";
import dropoffImage from "@assets/stock_images/recycling_collection_e7cb9713.jpg";

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
  const { data: stats = { pickups: 15847, drivers: 324, users: 8923, waste: 450 } as Stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['/api/stats'],
    refetchInterval: 5000,
  });

  // Fetch waste catalog
  const { data: wasteCatalog = [] as WasteCatalog[], isLoading: wasteLoading } = useQuery<WasteCatalog[]>({
    queryKey: ['/api/waste-catalog'],
  });

  // Fetch collection points
  const { data: collectionPoints = [] as CollectionPoint[], isLoading: pointsLoading } = useQuery<CollectionPoint[]>({
    queryKey: ['/api/collection-points'],
  });

  const filteredWaste = selectedWasteFilter 
    ? wasteCatalog.filter((w: WasteCatalog) => w.wasteType === selectedWasteFilter)
    : wasteCatalog;

  const wasteTypes = Array.from(new Set(wasteCatalog.map((w: WasteCatalog) => w.wasteType)));

  const services = [
    { 
      title: "Pengambilan Sampah (Pickup)", 
      desc: "Driver kami akan datang ke lokasi Anda untuk mengambil sampah secara langsung dengan jadwal yang fleksibel dan terjadwal.",
      icon: MapPin,
      image: pickupImage,
      features: ["GPS Real-Time Tracking", "Verifikasi QR dengan Foto", "Pembayaran Langsung", "Komisi 80% untuk Driver"]
    },
    { 
      title: "Titik Drop-off", 
      desc: "Kunjungi titik pengumpulan sampah terdekat untuk mengirimkan sampah Anda dengan mudah kapan saja.",
      icon: MapPin,
      image: dropoffImage,
      features: ["Lokasi Tersebar di Batam", "Operasional 24/7", "Pembayaran Digital", "Sistem Terintegrasi"]
    },
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
              <Link href="#services">
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
      <section className="px-6 py-16">
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
      <section className="px-6 py-24 bg-gradient-to-b from-muted/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Jenis Sampah yang Kami Kelola</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Lihat daftar lengkap sampah yang dapat Anda kirimkan dan dapatkan kompenasi terbaik</p>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-3 justify-center mb-16 flex-wrap">
            <Button 
              variant={selectedWasteFilter === null ? "default" : "outline"}
              onClick={() => setSelectedWasteFilter(null)}
              data-testid="filter-all-waste"
              className="rounded-full"
            >
              Semua ({wasteCatalog.length})
            </Button>
            {wasteTypes.map(type => {
              const count = wasteCatalog.filter(w => w.wasteType === type).length;
              return (
                <Button 
                  key={type}
                  variant={selectedWasteFilter === type ? "default" : "outline"}
                  onClick={() => setSelectedWasteFilter(type)}
                  data-testid={`filter-${type.toLowerCase()}`}
                  className="rounded-full"
                >
                  {type} ({count})
                </Button>
              );
            })}
          </div>

          {/* Waste Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            {filteredWaste.length > 0 ? filteredWaste.map((waste: WasteCatalog, idx: number) => (
              <div key={idx} className="bg-white dark:bg-slate-950 rounded-2xl border overflow-hidden hover-elevate transition-all duration-300">
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                  <img 
                    src={waste.imageUrl} 
                    alt={waste.wasteType}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop`;
                    }}
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2">{waste.wasteType}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{waste.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">
                      Rp {(waste.price / 1000).toLocaleString()}K
                    </div>
                    <Button size="sm" variant="ghost" className="rounded-full" data-testid={`btn-waste-${idx}`}>
                      Pesan
                    </Button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">Tidak ada jenis sampah untuk filter ini</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-6 py-24 max-w-6xl mx-auto" id="services">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Layanan Kami</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Dua cara mudah untuk mengelola sampah Anda dengan BlueCycle</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, idx) => (
            <div key={idx} className="overflow-hidden bg-white dark:bg-slate-950 rounded-3xl border-2 border-primary/30 hover-elevate group transition-all duration-300">
              {/* Image Section */}
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              
              {/* Content Section */}
              <div className="p-8">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-6">{service.desc}</p>
                <div className="space-y-2">
                  {service.features.map((feat, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-20" id="faq">
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
      <section className="px-6 py-24 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900" id="partnership">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-bold text-primary uppercase tracking-widest">Partnership</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                Bergabung Sebagai <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">Mitra</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                Kami membuka peluang kerjasama dengan vendor, supplier, dan mitra bisnis yang ingin berkontribusi pada ekonomi sirkular. Raih kesempatan emas untuk berkembang bersama BlueCycle.
              </p>
              
              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="p-6 bg-white dark:bg-slate-950 rounded-2xl border hover-elevate">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <Coins className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Komisi Menarik</h4>
                  <p className="text-sm text-muted-foreground">Dapatkan komisi kompetitif untuk setiap transaksi</p>
                </div>
                <div className="p-6 bg-white dark:bg-slate-950 rounded-2xl border hover-elevate">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <BarChart2 className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Dashboard Analytics</h4>
                  <p className="text-sm text-muted-foreground">Akses penuh ke laporan dan analitik real-time</p>
                </div>
                <div className="p-6 bg-white dark:bg-slate-950 rounded-2xl border hover-elevate">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <Headphones className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Dukungan 24/7</h4>
                  <p className="text-sm text-muted-foreground">Tim teknis siap membantu setiap saat</p>
                </div>
                <div className="p-6 bg-white dark:bg-slate-950 rounded-2xl border hover-elevate">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Brand Awareness</h4>
                  <p className="text-sm text-muted-foreground">Tingkatkan visibility bisnis Anda bersama kami</p>
                </div>
              </div>

              <Button size="lg" className="rounded-full h-12 px-10 bg-primary hover:bg-primary/90 font-semibold shadow-lg text-lg" data-testid="button-partnership">
                <Briefcase className="h-5 w-5 mr-2" />
                Hubungi Tim Partnership
              </Button>
            </div>

            {/* Right Side - Image */}
            <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl border-2 border-primary/20 group">
              <img 
                src={partnershipImage} 
                alt="Partnership opportunities"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="text-2xl font-black mb-2">Peluang Tak Terbatas</h3>
                <p className="text-sm text-white/90">Berkembang bersama ekosistem BlueCycle</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Download Section */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Unduh Aplikasi BlueCycle
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tersedia di Google Play Store dan Apple App Store. Download sekarang dan mulai berkontribusi pada ekonomi sirkular.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <a href="#" className="block transition-opacity hover:opacity-80 w-full sm:w-auto" data-testid="button-download-android">
            <img src="/assets/google-play-badge.png" alt="Get it on Google Play" className="h-auto max-w-xs w-full" />
          </a>
          <a href="#" className="block transition-opacity hover:opacity-80 w-full sm:w-auto" data-testid="button-download-ios">
            <img src="/assets/app-store-badge.png" alt="Download on the App Store" className="h-auto max-w-xs w-full" />
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/90 -z-10" />
        
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Leaf className="h-8 w-8 text-white" />
              <span className="text-sm font-bold text-white/80 uppercase tracking-widest">Bergabunglah Sekarang</span>
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              Siap Bergabung dengan BlueCycle?
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Mulai hari ini dan jadilah bagian dari revolusi manajemen sampah yang berkelanjutan. Bersama kami, setiap pengambilan sampah berkontribusi pada planet yang lebih sehat.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center text-white hover-elevate">
              <div className="text-3xl font-bold mb-2">{stats.pickups.toLocaleString()}+</div>
              <p className="text-white/80">Pengambilan Berhasil</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center text-white hover-elevate">
              <div className="text-3xl font-bold mb-2">{stats.drivers}</div>
              <p className="text-white/80">Pengemudi Aktif</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center text-white hover-elevate">
              <div className="text-3xl font-bold mb-2">{stats.waste}+ Ton</div>
              <p className="text-white/80">Sampah Terkelola</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 bg-white text-primary hover:bg-white/90 font-semibold text-lg shadow-lg hover-elevate" data-testid="button-start-now">
                <Sparkles className="h-5 w-5 mr-2" />
                Daftar Sekarang
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 border-2 border-white text-white hover:bg-white/10 font-semibold text-lg" data-testid="button-signin">
                Sudah Punya Akun?
                <ArrowRight className="h-5 w-5 ml-2" />
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
