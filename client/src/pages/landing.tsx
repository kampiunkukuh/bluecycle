import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Recycle, MapPin, TrendingUp, Shield, Users, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Recycle className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold">BlueCycle</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" data-testid="button-login-nav">Masuk</Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-full" data-testid="button-register-nav">Daftar</Button>
          </Link>
        </div>
      </header>

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
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg">
                Pelajari Lebih Lanjut
              </Button>
            </div>
          </div>
          <div className="relative h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center">
            <Recycle className="h-40 w-40 text-primary opacity-20" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Fitur Unggulan</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Pelacakan GPS Real-Time",
                description: "Pantau pengambilan sampah secara real-time dengan pelacakan GPS akurat"
              },
              {
                icon: TrendingUp,
                title: "Dashboard Analitik",
                description: "Laporan komprehensif tentang dampak lingkungan dan efisiensi operasional"
              },
              {
                icon: Shield,
                title: "Sistem Pembayaran Aman",
                description: "Pembayaran transparan dengan komisi 80/20 untuk pengemudi dan admin"
              },
              {
                icon: Users,
                title: "Kelola Tim Mudah",
                description: "Manajemen pengguna, pengemudi, dan admin dalam satu platform"
              },
              {
                icon: Zap,
                title: "Otomasi Cerdas",
                description: "Optimasi rute otomatis dan penjadwalan pickup yang efisien"
              },
              {
                icon: CheckCircle2,
                title: "Verifikasi QR",
                description: "Sistem verifikasi QR dengan bukti foto untuk keamanan dan transparansi"
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-6 bg-white dark:bg-slate-950 rounded-2xl border">
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">Untuk Siapa?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Pengguna",
              description: "Minta pengambilan sampah dan dapatkan keuntungan dari daur ulang",
              benefits: ["Minta pickup mudah", "Lacak pengambilan", "Dapatkan reward"]
            },
            {
              title: "Pengemudi",
              description: "Terima pesanan pickup dan tingkatkan penghasilan Anda",
              benefits: ["Komisi 80%", "Kelola rute", "Laporan pendapatan"]
            },
            {
              title: "Administrator",
              description: "Kelola semua operasi dan pantau metrik kinerja",
              benefits: ["Dashboard analitik", "Kelola pengguna", "Laporan compliance"]
            }
          ].map((role, idx) => (
            <div key={idx} className="p-8 border-2 border-primary/30 rounded-2xl hover-elevate">
              <h3 className="text-2xl font-bold mb-3">{role.title}</h3>
              <p className="text-muted-foreground mb-6">{role.description}</p>
              <ul className="space-y-3">
                {role.benefits.map((benefit, bidx) => (
                  <li key={bidx} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Siap Bergabung dengan BlueCycle?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Mulai hari ini dan jadilah bagian dari revolusi manajemen sampah yang berkelanjutan
          </p>
          <div className="flex gap-4 justify-center">
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
