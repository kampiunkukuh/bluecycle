import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Recycle, Shield, Truck, User } from "lucide-react";

export default function BlueCycleLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password });
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: "linear-gradient(135deg, hsl(168, 76%, 42%) 0%, hsl(168, 76%, 36%) 100%)"
    }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-4">
            <Recycle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">BlueCycle</h1>
          <p className="text-white/90 text-lg">Manajemen Sampah Pintar</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold">Selamat datang</CardTitle>
            <CardDescription className="text-base">
              Masuk untuk mengelola pengumpulan sampah
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="demo" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="demo">Demo Cepat</TabsTrigger>
                <TabsTrigger value="email">Login Email</TabsTrigger>
              </TabsList>
              
              <TabsContent value="demo" className="space-y-3 mt-0">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Pilih role untuk mencoba BlueCycle
                </p>
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 justify-start hover-elevate"
                  onClick={() => {
                    console.log("Demo login as Admin");
                    setLocation("/dashboard");
                  }}
                  data-testid="button-demo-admin"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-semibold text-base">Admin</span>
                      <span className="text-sm text-muted-foreground">Kelola pengguna & analitik</span>
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 justify-start hover-elevate"
                  onClick={() => {
                    console.log("Demo login as User");
                    setLocation("/dashboard");
                  }}
                  data-testid="button-demo-user"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-semibold text-base">Pengguna</span>
                      <span className="text-sm text-muted-foreground">Minta & lacak pengambilan</span>
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 justify-start hover-elevate"
                  onClick={() => {
                    console.log("Demo login as Driver");
                    setLocation("/dashboard");
                  }}
                  data-testid="button-demo-driver"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <Truck className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-semibold text-base">Supir</span>
                      <span className="text-sm text-muted-foreground">Selesaikan rute & pengambilan</span>
                    </div>
                  </div>
                </Button>
              </TabsContent>

              <TabsContent value="email" className="space-y-4 mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base">Alamat email</Label>
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
                    <Label htmlFor="password" className="text-base">Kata sandi</Label>
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
                  <Button type="submit" className="w-full h-12 text-base font-semibold" data-testid="button-login">
                    Masuk
                  </Button>
                </form>
                <div className="text-center">
                  <a href="#" className="text-sm text-primary hover:underline">
                    Lupa kata sandi?
                  </a>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-white/80 text-sm mt-6">
          Baru di BlueCycle?{" "}
          <a href="#" className="font-semibold text-white hover:underline">
            Buat akun
          </a>
        </p>
      </div>
    </div>
  );
}
