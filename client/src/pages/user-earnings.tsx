import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, DollarSign, Calendar, Wallet, Send } from "lucide-react";
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

interface BankAccount {
  id: string;
  bankName: string;
  bankAccount: string;
  isDefault: boolean;
}

export default function UserEarnings({ userId = 2 }: { userId?: number }) {
  const [pickups, setPickups] = useState<PickupOrder[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showAddBankDialog, setShowAddBankDialog] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState({ amount: "", bankName: "", bankAccount: "" });
  const [newBankData, setNewBankData] = useState({ bankName: "", bankAccount: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/pickups?requestedById=${userId}`);
        const data = await response.json();
        setPickups(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch pickups:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const completedPickups = pickups.filter((p) => p.status === "completed");
  const totalRewards = completedPickups.reduce((sum, p) => sum + p.price, 0);
  const totalWithdrawn = withdrawals.filter((w) => ["completed", "pending"].includes(w.status)).reduce((sum, w) => sum + w.amount, 0);
  const availableBalance = totalRewards - totalWithdrawn;

  const handleAddBankAccount = () => {
    if (newBankData.bankName && newBankData.bankAccount) {
      const newAccount: BankAccount = {
        id: Date.now().toString(),
        bankName: newBankData.bankName,
        bankAccount: newBankData.bankAccount,
        isDefault: bankAccounts.length === 0,
      };
      setBankAccounts([newAccount, ...bankAccounts]);
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
    setWithdrawals([newWithdrawal, ...withdrawals]);
    setWithdrawalData({ amount: "", bankName: "", bankAccount: "" });
    setShowWithdrawDialog(false);
  };

  const getStatusBadge = (status: string) => {
    if (status === "completed") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (status === "pending") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reward & Bonus</h1>
        <p className="text-gray-600 dark:text-gray-400">Dapatkan bonus dengan menjadi mitra aktif BlueCycle</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Total Reward
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              Rp {totalRewards.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Saldo Tersedia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              Rp {availableBalance.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Sudah Ditarik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              Rp {totalWithdrawn.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>

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
            <CardTitle>Riwayat Reward</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-500">Memuat data...</p>
            ) : completedPickups.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada reward yang diterima</p>
            ) : (
              completedPickups.map((pickup) => (
                <div key={pickup.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Gift className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Reward Selesai - {pickup.wasteType}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(pickup.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div className="font-semibold text-blue-600 dark:text-blue-400">
                    +Rp {pickup.price.toLocaleString("id-ID")}
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

      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajukan Penarikan Reward</DialogTitle>
            <DialogDescription>Tarik reward Anda ke rekening bank</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Jumlah Penarikan (Rp) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Contoh: 50000"
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
