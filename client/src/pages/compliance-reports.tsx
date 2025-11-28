import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Calendar, BarChart3, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ComplianceReport {
  id: number;
  reportMonth: string;
  reportType: string;
  totalOrders?: number;
  totalKgCollected?: number;
  totalRevenue?: number;
  recyclablePercentage?: number;
  reportUrl?: string;
  createdAt: Date;
}

export default function ComplianceReports() {
  const { toast } = useToast();
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/compliance-reports");
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      toast({ title: "Gagal memuat laporan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    setGenerating(true);
    try {
      const res = await fetch(`/api/compliance-reports/generate/${month}/${year}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to generate report");

      const newReport = await res.json();
      setReports([newReport, ...reports]);
      toast({ title: "Laporan berhasil dibuat!", description: `Laporan ${month}/${year} telah disimpan ke database` });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({ title: "Gagal membuat laporan", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const exportPDF = (report: ComplianceReport) => {
    toast({ title: "Fitur PDF sedang dalam pengembangan", description: "Segera hadir di versi berikutnya" });
  };

  const exportExcel = (report: ComplianceReport) => {
    toast({ title: "Fitur Excel sedang dalam pengembangan", description: "Segera hadir di versi berikutnya" });
  };

  const currentReports = reports.filter((r) => r.reportMonth.startsWith(String(selectedYear)));
  const monthNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const monthNum = parseInt(month);
    return `${monthNames[monthNum]} ${year}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Laporan Kepatuhan DLH</h1>
          <p className="text-gray-600 dark:text-gray-400">Laporan bulanan & tahunan untuk Dinas Lingkungan Hidup</p>
        </div>
        <Button onClick={generateReport} disabled={generating} data-testid="button-generate-report">
          {generating ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
          {generating ? "Membuat..." : "Generate Laporan"}
        </Button>
      </div>

      <div className="flex gap-4 flex-wrap">
        {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map((year) => (
          <Button
            key={year}
            variant={selectedYear === year ? "default" : "outline"}
            onClick={() => setSelectedYear(year)}
            data-testid={`button-year-${year}`}
          >
            {year}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : currentReports.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">Belum ada laporan untuk tahun ini. Klik "Generate Laporan" untuk membuat laporan baru.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {currentReports.map((report) => (
            <Card key={report.id} data-testid={`card-report-${report.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Laporan {getMonthName(report.reportMonth)}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Dibuat: {new Date(report.createdAt).toLocaleDateString("id-ID")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => exportPDF(report)} data-testid={`button-export-pdf-${report.id}`}>
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => exportExcel(report)} data-testid={`button-export-excel-${report.id}`}>
                      <Download className="h-4 w-4 mr-1" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Pesanan</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{report.totalOrders || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Sampah Dikumpulkan</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{(report.totalKgCollected || 0).toLocaleString("id-ID")} kg</p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Persentase Daur Ulang</p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{report.recyclablePercentage || 0}%</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-semibold mb-2">Total Pendapatan & Distribusi</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Transaksi</p>
                      <p className="text-lg font-bold">Rp {((report.totalRevenue || 0) / 100).toLocaleString("id-ID")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Komisi Admin (20%)</p>
                      <p className="text-lg font-bold">Rp {(((report.totalRevenue || 0) * 0.2) / 100).toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
