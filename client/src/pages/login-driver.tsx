import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface LoginDriverProps {
  onLogin: (role: "driver") => void;
}

export default function LoginDriver({ onLogin }: LoginDriverProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "driver" }),
      });

      if (!response.ok) {
        toast({
          title: "Login Gagal",
          description: "Email atau password salah",
          variant: "destructive",
        });
        return;
      }

      const user = await response.json();
      onLogin("driver");
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, hsl(168, 76%, 42%) 0%, hsl(168, 76%, 36%) 100%)",
      }}
    >
      <div className="w-full max-w-md">
        <Link href="/">
          <div className="flex items-center gap-2 text-white mb-8 hover:opacity-80 cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
            <span>Kembali ke beranda</span>
          </div>
        </Link>

        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-4">
            <Truck className="h-12 w-12 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">BlueCycle</h1>
          <p className="text-white/90 text-lg">Masuk sebagai Pengemudi</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold">Selamat datang, Supir!</CardTitle>
            <CardDescription className="text-base">
              Masuk untuk menerima pesanan pickup dan tingkatkan penghasilan (komisi 80%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Alamat email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="anda@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">
                  Kata sandi
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                  data-testid="input-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold" 
                data-testid="button-login-submit"
                disabled={loading}
              >
                {loading ? "Sedang masuk..." : "Masuk Sekarang"}
              </Button>
            </form>
            <div className="text-center mt-4">
              <Link href="/forgot-password">
                <span className="text-sm text-primary hover:underline cursor-pointer">
                  Lupa kata sandi?
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-white/80 text-sm mt-6">
          Belum punya akun?{" "}
          <Link href="/register">
            <span className="font-semibold text-white hover:underline cursor-pointer">
              Daftar sebagai pengemudi
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}
