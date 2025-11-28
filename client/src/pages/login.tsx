import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Recycle, User, Truck, Shield, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Login() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, hsl(168, 76%, 42%) 0%, hsl(168, 76%, 36%) 100%)",
      }}
    >
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-4 hover-elevate cursor-pointer">
              <Recycle className="h-12 w-12 text-primary" />
            </div>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">BlueCycle</h1>
          <p className="text-white/90 text-lg">Pilih akun Anda</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold">Masuk ke BlueCycle</CardTitle>
            <CardDescription className="text-base">
              Pilih tipe akun yang ingin Anda gunakan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link href="/login-user">
                <Button
                  variant="outline"
                  className="w-full h-auto py-6 justify-between hover-elevate"
                  data-testid="button-login-user"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-lg">Pengguna</span>
                      <span className="text-sm text-muted-foreground">Minta pengambilan & dapatkan reward</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              </Link>

              <Link href="/login-driver">
                <Button
                  variant="outline"
                  className="w-full h-auto py-6 justify-between hover-elevate"
                  data-testid="button-login-driver"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <Truck className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-lg">Pengemudi</span>
                      <span className="text-sm text-muted-foreground">Terima pesanan & raih komisi 80%</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              </Link>

              <Link href="/login-admin">
                <Button
                  variant="outline"
                  className="w-full h-auto py-6 justify-between hover-elevate"
                  data-testid="button-login-admin"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-lg">Administrator</span>
                      <span className="text-sm text-muted-foreground">Kelola sistem & analitik</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-white/80 text-sm mt-6">
          Belum punya akun?{" "}
          <Link href="/register">
            <span className="font-semibold text-white hover:underline cursor-pointer">
              Daftar di sini
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}
