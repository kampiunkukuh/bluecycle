import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Calendar, Wallet, Send, CreditCard, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PickupOrder {
  id: number;
  wasteType: string;
  price: number;
  status: string;
  createdAt: Date;
  address: string;
}

interface WithdrawalRequest {
  id: string;
  date: string;
  amount: number;
  status: "pending" | "approved" | "completed";
  bankName: string;
  bankAccount: string;
}

interface Payment {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  bankName: string;
  bankAccount: string;
  requestedAt: string;
  approvedAt?: string;
  adminNotes?: string;
}

interface BankAccount {
  id: string;
  bankName: string;
  bankAccount: string;
  isDefault: boolean;
}

export default function DriverEarnings({ driverId = 3 }: { driverId?: number }) {
  const [pickups, setPickups] = useState<PickupOrder[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showAddBankDialog, setShowAddBankDialog] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState({ amount: "", bankName: "", bankAccount: "" });
  const [newBankData, setNewBankData] = useState({ bankName: "", bankAccount: "" });
  const [loading, setLoading] = useState(true);

  // Load bank accounts and withdrawals from localStorage
  useEffect(() => {
    const savedAccounts = localStorage.getItem(`driver_bank_accounts_${driverId}`);
    if (savedAccounts) {
      try {
        setBankAccounts(JSON.parse(savedAccounts));
      } catch (e) {
        console.error("Failed to load bank accounts:", e);
      }
    }
    
    const savedWithdrawals = localStorage.getItem(`driver_withdrawals_${driverId}`);
    if (savedWithdrawals) {
      try {
        setWithdrawals(JSON.parse(savedWithdrawals));
      } catch (e) {
        console.error("Failed to load withdrawals:", e);
      }
    }
  }, [driverId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pickupsRes, paymentsRes] = await Promise.all([
          fetch(`/api/pickups?assignedDriverId=${driverId}`),
          fetch(`/api/driver-payments/${driverId}`),
        ]);
        
        const pickupsData = await pickupsRes.json();
        setPickups(Array.isArray(pickupsData) ? pickupsData : []);
        
        const paymentsData = await paymentsRes.json();
        if (Array.isArray(paymentsData)) {
          setPayments(paymentsData.map((p: any) => ({
            id: p.id.toString(),
            amount: p.amount,
            status: p.status,
            bankName: p.bankName,
            bankAccount: p.bankAccount,
            requestedAt: new Date(p.requestedAt).toLocaleDateString("id-ID"),
            approvedAt: p.approvedAt ? new Date(p.approvedAt).toLocaleDateString("id-ID") : undefined,
            adminNotes: p.adminNotes,
          })));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [driverId]);

  const completedPickups = pickups.filter((p) => p.status === "completed");
  const totalEarnings = completedPickups.reduce((sum, p) => sum + Math.floor(p.price * 0.8), 0);
  const totalWithdrawn = withdrawals.filter((w) => ["completed", "pending"].includes(w.status)).reduce((sum, w) => sum + w.amount, 0);
  const availableBalance = totalEarnings - totalWithdrawn;
  const dailyEarnings = pickups
    .filter((p) => p.status === "completed" && new Date(p.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, p) => sum + Math.floor(p.price * 0.8), 0);

  const handleAddBankAccount = () => {
    if (newBankData.bankName && newBankData.bankAccount) {
      const newAccount: BankAccount = {
        id: Date.now().toString(),
        bankName: newBankData.bankName,
        bankAccount: newBankData.bankAccount,
        isDefault: bankAccounts.length === 0,
      };
      const updatedAccounts = [newAccount, ...bankAccounts];
      setBankAccounts(updatedAccounts);
      localStorage.setItem(`driver_bank_accounts_${driverId}`, JSON.stringify(updatedAccounts));
      setNewBankData({ bankName: "", bankAccount: "" });
      setShowAddBankDialog(false);
    }
  };

  const handleWithdrawal = () => {
    if (!withdrawalData.amount || !withdrawalData.bankName || !withdrawalData.bankAccount) {
      alert("Semua field harus diisi");
      return;
    }
    const amount = parseInt(withdrawalData.amount);
    if (amount > availableBalance) {
      alert("Jumlah penarikan melebihi saldo tersedia");
      return;
    }
    const newWithdrawal: WithdrawalRequest = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("id-ID"),
      amount: amount,
      status: "pending",
      bankName: withdrawalData.bankName,
      bankAccount: withdrawalData.bankAccount,
    };
    const updatedWithdrawals = [newWithdrawal, ...withdrawals];
    setWithdrawals(updatedWithdrawals);
    localStorage.setItem(`driver_withdrawals_${driverId}`, JSON.stringify(updatedWithdrawals));
    setWithdrawalData({ amount: "", bankName: "", bankAccount: "" });
    setShowWithdrawDialog(false);
  };

  const getStatusBadge = (status: string) => {
    if (status === "completed") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (status === "approved") return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (status === "pending") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    if (status === "rejected") return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const getStatusIcon = (status: string) => {
    if (status === "completed" || status === "approved") return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === "pending") return <Clock className="h-4 w-4 text-yellow-600" />;
    return null;
  };

  const pendingPayments = payments.filter(p => p.status === "pending");
  const outstandingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pendapatan & Penarikan</h1>
        <p className="text-gray-600 dark:text-gray-400">Kelola penghasilan Anda sebagai Mitra BlueCycle</p>
      </div>

      <Tabs defaultValue="overview" className="w-full" data-testid="tabs-earnings">
        <TabsList className="grid w-full grid-cols-3" data-testid="tabs-list-earnings">
          <TabsTrigger value="overview" data-testid="tab-overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="payments" data-testid="tab-payments">Pembayaran</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Pendapatan Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              Rp {dailyEarnings.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Saldo Tersedia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              Rp {availableBalance.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Diterima
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              Rp {totalEarnings.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg">Sistem Komisi</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>Komisi Partner:</strong> 80% dari harga order</p>
          <p><strong>Komisi Admin:</strong> 20% dari harga order (untuk operasional BlueCycle)</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
            Contoh: Order Rp 100.000 → Anda dapat Rp 80.000 (80%), Admin dapat Rp 20.000 (20%)
          </p>
        </CardContent>
      </Card>

      {/* Bank Accounts Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Akun Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bankAccounts.length === 0 ? (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Belum ada akun pembayaran terdaftar</p>
              <Button variant="outline" size="sm" onClick={() => setShowAddBankDialog(true)} className="w-full" data-testid="button-add-bank">
                + Tambah Akun Pembayaran
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {bankAccounts.map((account) => (
                <div key={account.id} className="p-3 border rounded-lg flex items-center justify-between hover-elevate">
                  <div>
                    <p className="font-medium text-sm">{account.bankName}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{account.bankAccount}</p>
                  </div>
                  {account.isDefault && <Badge variant="secondary">Utama</Badge>}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setShowAddBankDialog(true)} className="w-full mt-2" data-testid="button-add-bank-more">
                + Tambah Akun Lainnya
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Riwayat Pendapatan (80% dari Harga Order)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-500">Memuat data...</p>
            ) : completedPickups.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada order yang diselesaikan</p>
            ) : (
              completedPickups.map((pickup) => (
                <div key={pickup.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Pickup di {pickup.address.split(",")[0]} (80% dari Rp {pickup.price.toLocaleString("id-ID")})</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(pickup.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div className="font-semibold text-green-600 dark:text-green-400">
                    +Rp {Math.floor(pickup.price * 0.8).toLocaleString("id-ID")}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Penarikan Dana</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => setShowWithdrawDialog(true)} className="w-full h-10" data-testid="button-request-withdrawal">
              <Send className="h-4 w-4 mr-2" />
              Ajukan Penarikan
            </Button>
            {withdrawals.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada riwayat penarikan</p>
            ) : (
              <div className="space-y-2">
                {withdrawals.slice(0, 5).map((w) => (
                  <div key={w.id} className="text-sm p-2 border rounded">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{w.bankName}</span>
                      <Badge className={getStatusBadge(w.status)}>
                        {w.status === "completed" ? "Selesai" : "Tertunda"}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Rp {w.amount.toLocaleString("id-ID")}</p>
                    <p className="text-xs text-gray-500">{w.date}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4" data-testid="tab-content-payments">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pembayaran Tertunda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                Rp {outstandingAmount.toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{pendingPayments.length} pembayaran menunggu persetujuan admin</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Pembayaran Anda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {payments.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada pembayaran yang diajukan</p>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} className="p-4 border rounded-lg hover-elevate space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <div>
                          <p className="font-medium">{payment.bankName} - {payment.bankAccount}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Diajukan: {payment.requestedAt}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">Rp {payment.amount.toLocaleString("id-ID")}</p>
                        <Badge className={getStatusBadge(payment.status)} data-testid={`badge-payment-status-${payment.id}`}>
                          {payment.status === "pending" && "Menunggu Persetujuan"}
                          {payment.status === "approved" && "Disetujui"}
                          {payment.status === "completed" && "Selesai"}
                          {payment.status === "rejected" && "Ditolak"}
                        </Badge>
                      </div>
                    </div>
                    {payment.adminNotes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 border-l-2 border-blue-300 pl-2 italic">
                        💬 {payment.adminNotes}
                      </p>
                    )}
                    {payment.approvedAt && payment.status !== "pending" && (
                      <p className="text-xs text-gray-500">Disetujui: {payment.approvedAt}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4" data-testid="tab-content-history">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Lengkap Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {payments.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada riwayat pembayaran</p>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate">
                    <div className="flex-1">
                      <p className="font-medium">{payment.bankName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{payment.bankAccount}</p>
                      <p className="text-xs text-gray-500">{payment.requestedAt}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Rp {payment.amount.toLocaleString("id-ID")}</p>
                      <Badge className={getStatusBadge(payment.status)}>
                        {payment.status === "pending" && "Tertunda"}
                        {payment.status === "approved" && "Disetujui"}
                        {payment.status === "completed" && "Selesai"}
                        {payment.status === "rejected" && "Ditolak"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajukan Penarikan Dana</DialogTitle>
            <DialogDescription>Tarik penghasilan Anda ke rekening bank</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Jumlah Penarikan (Rp) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Contoh: 500000"
                value={withdrawalData.amount}
                onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: e.target.value })}
                data-testid="input-withdrawal-amount"
              />
              <p className="text-xs text-gray-500 mt-1">Saldo tersedia: Rp {availableBalance.toLocaleString("id-ID")}</p>
            </div>
            <div>
              <Label htmlFor="bank">Bank Tujuan *</Label>
              <Select value={withdrawalData.bankName} onValueChange={(val) => setWithdrawalData({ ...withdrawalData, bankName: val })}>
                <SelectTrigger data-testid="select-bank">
                  <SelectValue placeholder="Pilih bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BCA">BCA</SelectItem>
                  <SelectItem value="Mandiri">Mandiri</SelectItem>
                  <SelectItem value="BNI">BNI</SelectItem>
                  <SelectItem value="CIMB">CIMB Niaga</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bankAccounts.length > 0 ? (
              <div>
                <Label htmlFor="account-select">Akun Pembayaran *</Label>
                <Select value={withdrawalData.bankAccount} onValueChange={(val) => {
                  const account = bankAccounts.find(a => a.id === val);
                  if (account) {
                    setWithdrawalData({ ...withdrawalData, bankAccount: account.bankAccount, bankName: account.bankName });
                  }
                }}>
                  <SelectTrigger data-testid="select-bank-account">
                    <SelectValue placeholder="Pilih akun pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bankName} - {account.bankAccount}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label htmlFor="account">Nomor Rekening *</Label>
                <Input
                  id="account"
                  placeholder="Masukkan nomor rekening"
                  value={withdrawalData.bankAccount}
                  onChange={(e) => setWithdrawalData({ ...withdrawalData, bankAccount: e.target.value })}
                  data-testid="input-bank-account"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleWithdrawal} data-testid="button-submit-withdrawal">
              Ajukan Penarikan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bank Account Dialog */}
      <Dialog open={showAddBankDialog} onOpenChange={setShowAddBankDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Akun Pembayaran</DialogTitle>
            <DialogDescription>Tambahkan rekening bank untuk penarikan dana</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-bank">Bank *</Label>
              <Select value={newBankData.bankName} onValueChange={(val) => setNewBankData({ ...newBankData, bankName: val })}>
                <SelectTrigger data-testid="select-new-bank">
                  <SelectValue placeholder="Pilih bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BCA">BCA</SelectItem>
                  <SelectItem value="Mandiri">Mandiri</SelectItem>
                  <SelectItem value="BNI">BNI</SelectItem>
                  <SelectItem value="CIMB">CIMB Niaga</SelectItem>
                  <SelectItem value="Permata">Permata Bank</SelectItem>
                  <SelectItem value="Danamon">Danamon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-account">Nomor Rekening *</Label>
              <Input
                id="new-account"
                placeholder="Masukkan nomor rekening"
                value={newBankData.bankAccount}
                onChange={(e) => setNewBankData({ ...newBankData, bankAccount: e.target.value })}
                data-testid="input-new-bank-account"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBankDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleAddBankAccount} data-testid="button-save-bank">
              Simpan Akun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
