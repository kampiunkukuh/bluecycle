import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, CheckCircle2, AlertCircle, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SMSNotification {
  id: number;
  recipientPhone: string;
  recipientName: string;
  messageType: string; // "pickup_confirmed", "withdrawal_approved", "delivery_completed"
  message: string;
  status: string; // "sent", "failed", "pending"
  sentAt: Date;
  deliveredAt?: Date;
}

export default function NotificationLog() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<SMSNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/sms-notifications");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast({ title: "Gagal memuat notifikasi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "sent" || status === "delivered") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    if (status === "failed") return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
  };

  const getMessageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      pickup_confirmed: "Pickup Dikonfirmasi",
      withdrawal_approved: "Penarikan Disetujui",
      delivery_completed: "Pengiriman Selesai",
      payment_reminder: "Pengingat Pembayaran",
      driver_assigned: "Driver Ditugaskan",
      order_cancelled: "Pesanan Dibatalkan",
    };
    return labels[type] || type;
  };

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.status === filter);

  const sentCount = notifications.filter((n) => n.status === "sent").length;
  const failedCount = notifications.filter((n) => n.status === "failed").length;
  const pendingCount = notifications.filter((n) => n.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Log Notifikasi SMS</h1>
        <p className="text-gray-600 dark:text-gray-400">Pantau semua pesan SMS yang dikirim ke user dan driver</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Terkirim</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sentCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Gagal</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{failedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "sent", "failed", "pending"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
            data-testid={`button-filter-${status}`}
          >
            {status === "all" ? "Semua" : status === "sent" ? "Terkirim" : status === "failed" ? "Gagal" : "Pending"}
          </Button>
        ))}
      </div>

      {/* Notification List */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pesan</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Belum ada notifikasi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => (
                <div key={notif.id} className="border rounded-lg p-4 hover-elevate" data-testid={`sms-notif-${notif.id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Send className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">{notif.recipientName}</span>
                        <Badge variant="secondary">{getMessageTypeLabel(notif.messageType)}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{notif.recipientPhone}</p>
                    </div>
                    <Badge className={getStatusColor(notif.status)}>
                      {notif.status === "sent" || notif.status === "delivered" ? "✓ Terkirim" : notif.status === "failed" ? "✗ Gagal" : "⏳ Pending"}
                    </Badge>
                  </div>

                  <p className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded mb-2">{notif.message}</p>

                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Dikirim: {new Date(notif.sentAt).toLocaleString("id-ID")}</span>
                    {notif.deliveredAt && <span>Terima: {new Date(notif.deliveredAt).toLocaleString("id-ID")}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">Tentang Notifikasi SMS</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>✓ Notifikasi otomatis untuk pickup baru & pengiriman selesai</p>
          <p>✓ Alert pembayaran untuk driver & user</p>
          <p>✓ Pengingat untuk pickup yang ditunda</p>
          <p>✓ Integrasi dengan Twilio untuk pengiriman SMS real-time</p>
        </CardContent>
      </Card>
    </div>
  );
}
