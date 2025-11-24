import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Check, Clock, Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentMethod {
  bankName: string;
  bankAccount: string;
  accountHolder: string;
}

interface Payment {
  id: number;
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  bankName: string;
  bankAccount: string;
  requestedAt: string;
  approvedAt?: string;
}

export default function DriverPaymentSettings({ driverId = 3 }: { driverId?: number }) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    bankName: "BCA",
    bankAccount: "1234567890",
    accountHolder: "Joko Wijaya",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(paymentMethod);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/driver-payments/${driverId}`);
        const data = await response.json();
        setPayments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [driverId]);

  const handleSave = () => {
    setPaymentMethod(formData);
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    if (status === "completed") return "bg-green-100 text-green-800 dark:bg-green-900";
    if (status === "approved") return "bg-blue-100 text-blue-800 dark:bg-blue-900";
    if (status === "pending") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900";
    return "bg-red-100 text-red-800 dark:bg-red-900";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pengaturan Pembayaran</h1>
        <p className="text-gray-600 dark:text-gray-400">Kelola metode pembayaran Anda sebagai Mitra BlueCycle</p>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings">Pengaturan Bank</TabsTrigger>
          <TabsTrigger value="history">Riwayat Penarikan</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Rekening Bank Tujuan
          </CardTitle>
          {!isEditing && <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">Aktif</Badge>}
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditing ? (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nama Pemilik Rekening</p>
                <p className="text-lg font-semibold">{paymentMethod.accountHolder}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bank</p>
                <p className="text-lg font-semibold">{paymentMethod.bankName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nomor Rekening</p>
                <p className="text-lg font-semibold font-mono">{paymentMethod.bankAccount}</p>
              </div>
              <Button onClick={() => { setFormData(paymentMethod); setIsEditing(true); }} variant="outline" className="w-full" data-testid="button-edit-payment">
                Edit Rekening
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="accountHolder">Nama Pemilik Rekening *</Label>
                <Input
                  id="accountHolder"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  data-testid="input-account-holder"
                />
              </div>
              <div>
                <Label htmlFor="bank">Bank *</Label>
                <Select value={formData.bankName} onValueChange={(val) => setFormData({ ...formData, bankName: val })}>
                  <SelectTrigger data-testid="select-bank-payment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BCA">BCA</SelectItem>
                    <SelectItem value="Mandiri">Mandiri</SelectItem>
                    <SelectItem value="BNI">BNI</SelectItem>
                    <SelectItem value="CIMB">CIMB Niaga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bankAccount">Nomor Rekening *</Label>
                <Input
                  id="bankAccount"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  data-testid="input-bank-account-payment"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                  Batal
                </Button>
                <Button onClick={handleSave} className="flex-1" data-testid="button-save-payment">
                  <Check className="h-4 w-4 mr-2" />
                  Simpan
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg">Informasi Penting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Komisi Partner:</strong> Anda akan menerima 80% dari harga setiap order sampah yang Anda terima. 20% sisanya masuk ke kas BlueCycle untuk operasional.
          </p>
          <p>
            <strong>Contoh:</strong> Jika order senilai Rp 50.000, Anda mendapat Rp 40.000 (80%).
          </p>
          <p>
            <strong>Pembayaran:</strong> Saldo Anda akan ditransfer ke rekening yang terdaftar sesuai jadwal pencairan yang Anda ajukan.
          </p>
          <p>
            <strong>Verifikasi:</strong> Pastikan data rekening Anda benar untuk menghindari kegagalan transfer.
          </p>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Riwayat Penarikan Dana</span>
                {loading && <Loader className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-center text-gray-500">Tidak ada riwayat penarikan</p>
              ) : (
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate">
                      <div className="flex-1">
                        <p className="font-semibold">{payment.bankName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Rp {payment.amount.toLocaleString("id-ID")}</p>
                        <p className="text-xs text-gray-500">{payment.requestedAt}</p>
                      </div>
                      <Badge className={getStatusBadge(payment.status)}>
                        {payment.status === "pending" && "Tertunda"}
                        {payment.status === "approved" && "Disetujui"}
                        {payment.status === "completed" && "Selesai"}
                        {payment.status === "rejected" && "Ditolak"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
