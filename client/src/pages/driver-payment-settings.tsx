import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Check, Clock, Loader, Plus, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

interface BankAccount {
  id: string;
  bankName: string;
  bankAccount: string;
  isDefault: boolean;
}

const WITHDRAWAL_PRESETS = [20000, 50000, 100000, 250000, 500000, 1000000];
const MIN_WITHDRAWAL = 20000;
const MAX_WITHDRAWAL = 100000000;

export default function DriverPaymentSettings({ driverId = 3 }: { driverId?: number }) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    bankName: "BCA",
    bankAccount: "1234567890",
    accountHolder: "Joko Wijaya",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(paymentMethod);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showAddBankDialog, setShowAddBankDialog] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState({ amount: "", selectedAccount: "", bankTujuan: "" });
  const [newBankData, setNewBankData] = useState({ bankName: "", bankAccount: "" });
  const [driverBalance, setDriverBalance] = useState(0);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // Load bank accounts from localStorage
  useEffect(() => {
    const savedAccounts = localStorage.getItem(`driver_bank_accounts_${driverId}`);
    if (savedAccounts) {
      try {
        setBankAccounts(JSON.parse(savedAccounts));
      } catch (e) {
        console.error("Failed to load bank accounts:", e);
      }
    }
  }, [driverId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [paymentsRes, earningsRes] = await Promise.all([
          fetch(`/api/driver-payments/${driverId}`),
          fetch(`/api/driver-earnings/${driverId}`),
        ]);
        const paymentsData = await paymentsRes.json();
        const earningsData = await earningsRes.json();
        
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
        
        // Calculate driver balance from earnings
        if (Array.isArray(earningsData)) {
          const totalEarnings = earningsData.reduce((sum: number, earning: any) => sum + (earning.amount || 0), 0);
          setDriverBalance(Math.max(0, totalEarnings));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [driverId]);

  const handleSave = () => {
    setPaymentMethod(formData);
    setIsEditing(false);
  };

  const handleAddBankAccount = () => {
    if (newBankData.bankName && newBankData.bankAccount) {
      if (editingAccountId) {
        const updatedAccounts = bankAccounts.map(acc => 
          acc.id === editingAccountId ? { ...acc, ...newBankData } : acc
        );
        setBankAccounts(updatedAccounts);
        localStorage.setItem(`driver_bank_accounts_${driverId}`, JSON.stringify(updatedAccounts));
        setEditingAccountId(null);
      } else {
        const newAccount: BankAccount = {
          id: Date.now().toString(),
          bankName: newBankData.bankName,
          bankAccount: newBankData.bankAccount,
          isDefault: bankAccounts.length === 0,
        };
        const updatedAccounts = [newAccount, ...bankAccounts];
        setBankAccounts(updatedAccounts);
        localStorage.setItem(`driver_bank_accounts_${driverId}`, JSON.stringify(updatedAccounts));
      }
      setNewBankData({ bankName: "", bankAccount: "" });
      setShowAddBankDialog(false);
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    const updatedAccounts = bankAccounts.filter(acc => acc.id !== accountId);
    setBankAccounts(updatedAccounts);
    localStorage.setItem(`driver_bank_accounts_${driverId}`, JSON.stringify(updatedAccounts));
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccountId(account.id);
    setNewBankData({ bankName: account.bankName, bankAccount: account.bankAccount });
    setShowAddBankDialog(true);
  };

  const handleWithdrawalSubmit = async () => {
    const amount = parseInt(withdrawalData.amount);
    if (!amount || amount < MIN_WITHDRAWAL || amount > MAX_WITHDRAWAL) {
      alert(`Jumlah harus antara Rp ${MIN_WITHDRAWAL.toLocaleString("id-ID")} - Rp ${MAX_WITHDRAWAL.toLocaleString("id-ID")}`);
      return;
    }

    if (amount > driverBalance) {
      alert("Saldo tidak cukup untuk penarikan");
      return;
    }

    if (!withdrawalData.selectedAccount) {
      alert("Pilih akun pembayaran");
      return;
    }

    try {
      const account = bankAccounts.find(acc => acc.id === withdrawalData.selectedAccount);
      if (!account) {
        alert("Akun tidak ditemukan");
        return;
      }

      const response = await fetch(`/api/driver-payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: driverId,
          amount: amount,
          bankName: account.bankName,
          bankAccount: account.bankAccount,
          status: "pending",
        }),
      });

      if (response.ok) {
        alert("Permintaan penarikan berhasil dibuat!");
        setWithdrawalData({ amount: "", selectedAccount: "", bankTujuan: "" });
        setShowWithdrawDialog(false);
        // Refresh data
        const paymentsRes = await fetch(`/api/driver-payments/${driverId}`);
        const paymentsData = await paymentsRes.json();
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      } else {
        alert("Gagal membuat permintaan penarikan");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan");
    }
  };

  const formatRupiah = (amount: number): string => {
    return amount.toLocaleString("id-ID");
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

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Saldo Pengemudi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-2xl font-bold text-green-600">Rp {formatRupiah(driverBalance)}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Dari komisi 80% pickup selesai</p>
          </div>
          <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
            <DialogTrigger asChild>
              <Button className="w-full" data-testid="button-request-withdrawal-driver">
                <Plus className="h-4 w-4 mr-2" />
                Ajukan Penarikan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Ajukan Penarikan Dana</DialogTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tarik penghasilan Anda ke rekening bank</p>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Jumlah Penarikan (Rp) *</Label>
                  <Input
                    type="number"
                    value={withdrawalData.amount}
                    onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: e.target.value })}
                    placeholder="Contoh: 500000"
                    data-testid="input-withdrawal-amount-driver"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Saldo tersedia: Rp {formatRupiah(driverBalance)}</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {WITHDRAWAL_PRESETS.map((preset) => (
                    <Button
                      key={preset}
                      variant={withdrawalData.amount === String(preset) ? "default" : "outline"}
                      size="sm"
                      onClick={() => setWithdrawalData({ ...withdrawalData, amount: String(preset) })}
                      disabled={preset > driverBalance}
                      data-testid={`button-preset-${preset}`}
                    >
                      Rp {formatRupiah(preset / 1000)}K
                    </Button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-select">Bank Tujuan *</Label>
                  <Select value={withdrawalData.bankTujuan} onValueChange={(val) => setWithdrawalData({ ...withdrawalData, bankTujuan: val, selectedAccount: "" })}>
                    <SelectTrigger id="bank-select" data-testid="select-bank-tujuan">
                      <SelectValue placeholder="Pilih bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set(bankAccounts.map(acc => acc.bankName))).map((bankName) => (
                        <SelectItem key={bankName} value={bankName}>
                          {bankName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-select">Akun Pembayaran *</Label>
                  <Select value={withdrawalData.selectedAccount} onValueChange={(val) => setWithdrawalData({ ...withdrawalData, selectedAccount: val })}>
                    <SelectTrigger id="account-select" data-testid="select-akun-pembayaran">
                      <SelectValue placeholder="Pilih akun pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.length === 0 ? (
                        <div className="p-2 text-sm text-gray-600">Belum ada akun pembayaran</div>
                      ) : (
                        bankAccounts
                          .filter(acc => !withdrawalData.bankTujuan || acc.bankName === withdrawalData.bankTujuan)
                          .map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.bankName} - {account.bankAccount}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowWithdrawDialog(false)}>
                    Batal
                  </Button>
                  <Button className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={handleWithdrawalSubmit} data-testid="button-submit-withdrawal-driver">
                    Ajukan Penarikan
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Sistem Komisi */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg">Sistem Komisi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <p>
              <strong className="text-blue-600 dark:text-blue-400">Komisi Partner:</strong> 80% dari harga order
            </p>
            <p>
              <strong className="text-gray-600 dark:text-gray-400">Komisi Admin:</strong> 20% dari harga order (untuk operasional BlueCycle)
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="font-medium text-gray-900 dark:text-white mb-2">Contoh Perhitungan:</p>
            <p className="text-gray-700 dark:text-gray-300">
              Order Rp 100.000 → Anda dapat <span className="font-semibold text-blue-600 dark:text-blue-400">Rp 80.000 (80%)</span>, Admin dapat <span className="font-semibold">Rp 20.000 (20%)</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Akun Pembayaran */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Akun Pembayaran</CardTitle>
          <Dialog open={showAddBankDialog} onOpenChange={setShowAddBankDialog}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-payment-account">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Akun
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingAccountId ? "Edit Rekening" : "Tambah Rekening Baru"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bank-type">Bank *</Label>
                  <Select value={newBankData.bankName} onValueChange={(val) => setNewBankData({ ...newBankData, bankName: val })}>
                    <SelectTrigger data-testid="select-bank-type">
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
                  <Label htmlFor="account-number">Nomor Rekening *</Label>
                  <Input
                    id="account-number"
                    value={newBankData.bankAccount}
                    onChange={(e) => setNewBankData({ ...newBankData, bankAccount: e.target.value })}
                    placeholder="Nomor rekening"
                    data-testid="input-account-number"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => { setShowAddBankDialog(false); setEditingAccountId(null); }}>
                    Batal
                  </Button>
                  <Button className="flex-1" onClick={handleAddBankAccount} data-testid="button-save-bank">
                    {editingAccountId ? "Update" : "Tambah"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-3">
          {bankAccounts.length === 0 ? (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Belum ada akun pembayaran terdaftar</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddBankDialog(true)} 
                className="w-full"
                data-testid="button-add-account-empty"
              >
                + Tambah Akun Pembayaran
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {bankAccounts.map((account) => (
                <div key={account.id} className="p-3 border rounded-lg flex items-center justify-between hover-elevate">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{account.bankName}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{account.bankAccount}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.isDefault && <Badge variant="secondary">Utama</Badge>}
                    <Button size="sm" variant="ghost" onClick={() => handleEditAccount(account)} data-testid={`button-edit-account-${account.id}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteAccount(account.id)} data-testid={`button-delete-account-${account.id}`}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddBankDialog(true)} 
                className="w-full mt-2"
                data-testid="button-add-account-more"
              >
                + Tambah Akun Lainnya
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Pengaturan Bank</TabsTrigger>
          <TabsTrigger value="accounts">Rekening Saya</TabsTrigger>
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

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Rekening Bank</CardTitle>
              <Dialog open={showAddBankDialog} onOpenChange={setShowAddBankDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-add-bank-account">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Rekening
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingAccountId ? "Edit Rekening" : "Tambah Rekening Baru"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bank-type">Bank *</Label>
                      <Select value={newBankData.bankName} onValueChange={(val) => setNewBankData({ ...newBankData, bankName: val })}>
                        <SelectTrigger data-testid="select-bank-type">
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
                      <Label htmlFor="account-number">Nomor Rekening *</Label>
                      <Input
                        id="account-number"
                        value={newBankData.bankAccount}
                        onChange={(e) => setNewBankData({ ...newBankData, bankAccount: e.target.value })}
                        placeholder="Nomor rekening"
                        data-testid="input-account-number"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => { setShowAddBankDialog(false); setEditingAccountId(null); }}>
                        Batal
                      </Button>
                      <Button className="flex-1" onClick={handleAddBankAccount} data-testid="button-save-bank">
                        {editingAccountId ? "Update" : "Tambah"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {bankAccounts.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Belum ada rekening bank terdaftar</p>
              ) : (
                <div className="space-y-2">
                  {bankAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate">
                      <div className="flex-1">
                        <p className="font-semibold">{account.bankName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{account.bankAccount}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEditAccount(account)} data-testid={`button-edit-account-${account.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteAccount(account.id)} data-testid={`button-delete-account-${account.id}`}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
