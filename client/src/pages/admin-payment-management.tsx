import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";

interface Payment {
  id: number;
  userId: number;
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  bankName: string;
  bankAccount: string;
  requestedAt: Date;
  approvedAt?: Date;
  rejectionReason?: string;
  adminNotes?: string;
  userType: "user" | "driver";
}

export default function AdminPaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [actionNotes, setActionNotes] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const [userPaymentsRes, driverPaymentsRes] = await Promise.all([
          fetch("/api/user-payments/2"),
          fetch("/api/driver-payments/3"),
        ]);
        
        const userPayments = await userPaymentsRes.json();
        const driverPayments = await driverPaymentsRes.json();
        
        const allPayments: Payment[] = [
          ...(Array.isArray(userPayments) ? userPayments.map((p: any) => ({ ...p, userType: "user" })) : []),
          ...(Array.isArray(driverPayments) ? driverPayments.map((p: any) => ({ ...p, userType: "driver" })) : []),
        ];
        
        setPayments(allPayments);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleApprove = async () => {
    if (!selectedPayment) return;
    
    const endpoint = selectedPayment.userType === "driver" 
      ? `/api/driver-payments/${selectedPayment.id}`
      : `/api/user-payments/${selectedPayment.id}`;
    
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "approved",
          adminNotes: actionNotes,
          approvedAt: new Date().toISOString(),
        }),
      });
      
      if (response.ok) {
        const updated = await response.json();
        setPayments(payments.map((p) => (p.id === selectedPayment.id ? { ...updated, userType: selectedPayment.userType } : p)));
        setShowDialog(false);
        setActionNotes("");
        setSelectedPayment(null);
      }
    } catch (error) {
      alert("Gagal approve pembayaran");
    }
  };

  const handleReject = async () => {
    if (!selectedPayment) return;
    
    const endpoint = selectedPayment.userType === "driver" 
      ? `/api/driver-payments/${selectedPayment.id}`
      : `/api/user-payments/${selectedPayment.id}`;
    
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          rejectionReason: actionNotes,
          adminNotes: actionNotes,
        }),
      });
      
      if (response.ok) {
        const updated = await response.json();
        setPayments(payments.map((p) => (p.id === selectedPayment.id ? { ...updated, userType: selectedPayment.userType } : p)));
        setShowDialog(false);
        setActionNotes("");
        setSelectedPayment(null);
      }
    } catch (error) {
      alert("Gagal reject pembayaran");
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === "rejected") return <XCircle className="h-4 w-4 text-red-600" />;
    if (status === "completed") return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <Clock className="h-4 w-4 text-yellow-600" />;
  };

  const getStatusColor = (status: string) => {
    if (status === "pending") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    if (status === "approved") return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (status === "rejected") return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  };

  const stats = {
    pending: payments.filter((p) => p.status === "pending").length,
    approved: payments.filter((p) => p.status === "approved").length,
    rejected: payments.filter((p) => p.status === "rejected").length,
    completed: payments.filter((p) => p.status === "completed").length,
    totalAmount: payments.filter((p) => p.status === "approved" || p.status === "pending").reduce((sum, p) => sum + p.amount, 0),
  };

  const filteredPayments = payments.filter((p) => p.status === filterStatus);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manajemen Pembayaran</h1>
        <p className="text-gray-600 dark:text-gray-400">Setujui atau tolak permintaan penarikan dana dari pengguna dan driver</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Menunggu Persetujuan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">pembayaran</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Disetujui</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.approved}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">dalam antrian</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ditolak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">pembayaran</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">diproses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Dana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600">Rp {(stats.totalAmount / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">menunggu/disetujui</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={filterStatus} onValueChange={setFilterStatus}>
        <TabsList>
          <TabsTrigger value="pending">Menunggu ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Disetujui ({stats.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Ditolak ({stats.rejected})</TabsTrigger>
          <TabsTrigger value="completed">Selesai ({stats.completed})</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-3">
          {loading ? (
            <div>Memuat...</div>
          ) : filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">Belum ada pembayaran</CardContent>
            </Card>
          ) : (
            filteredPayments.map((payment) => (
              <Card key={payment.id} className="hover-elevate" data-testid={`card-payment-${payment.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-semibold">
                            Rp {payment.amount.toLocaleString("id-ID")} 
                            {payment.userType === "driver" ? " (Driver - 80% Earnings)" : " (User - Reward)"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {payment.bankName} - {payment.bankAccount}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Diminta: {new Date(payment.requestedAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status === "pending" && "Menunggu"}
                          {payment.status === "approved" && "Disetujui"}
                          {payment.status === "rejected" && "Ditolak"}
                          {payment.status === "completed" && "Selesai"}
                        </Badge>
                      </div>
                      {payment.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowDialog(true);
                          }}
                          data-testid={`button-manage-payment-${payment.id}`}
                        >
                          Tindak Lanjuti
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent data-testid="dialog-payment-action">
          <DialogHeader>
            <DialogTitle>
              {selectedPayment?.status === "pending" ? "Tindak Lanjuti Pembayaran" : "Detail Pembayaran"}
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Amount:</span> Rp {selectedPayment.amount.toLocaleString("id-ID")}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Bank:</span> {selectedPayment.bankName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Rekening:</span> {selectedPayment.bankAccount}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Tipe:</span> {selectedPayment.userType === "driver" ? "Driver (80%)" : "User (Reward)"}
                </p>
              </div>

              {selectedPayment.status === "pending" && (
                <>
                  <Textarea
                    placeholder="Catatan untuk persetujuan/penolakan..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    data-testid="input-payment-notes"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleApprove}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      data-testid="button-approve-payment"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Setujui
                    </Button>
                    <Button
                      onClick={handleReject}
                      variant="destructive"
                      className="flex-1"
                      data-testid="button-reject-payment"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Tolak
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
