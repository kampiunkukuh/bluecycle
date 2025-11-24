import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Recycle, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function ForgotPassword() {
  const [_, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Email tidak valid");
      return;
    }

    console.log("Password reset requested for:", email);
    setSubmitted(true);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, hsl(168, 76%, 42%) 0%, hsl(168, 76%, 36%) 100%)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-4 hover-elevate cursor-pointer">
              <Recycle className="h-12 w-12 text-primary" />
            </div>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">BlueCycle</h1>
          <p className="text-white/90 text-lg">Reset kata sandi</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold">Lupa kata sandi?</CardTitle>
            <CardDescription className="text-base">
              Masukkan email Anda dan kami akan mengirimkan link reset
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="h-12"
                    data-testid="input-forgot-email"
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>

                <Button type="submit" className="w-full h-12 text-base font-semibold" data-testid="button-reset-submit">
                  Kirim Link Reset
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="inline-flex h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-4">
                  <Recycle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold">Email dikirim!</h3>
                <p className="text-muted-foreground">
                  Kami telah mengirimkan link reset password ke <strong>{email}</strong>. Periksa email Anda untuk melanjutkan.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Link href="/login">
          <div className="text-center text-white/80 text-sm mt-6 hover:text-white flex items-center justify-center gap-2 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke login
          </div>
        </Link>
      </div>
    </div>
  );
}
