import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Calendar, BarChart3 } from "lucide-react";

interface ComplianceReport {
  id: number;
  month: number;
  year: number;
  totalWasteCollected: number;
  wasteRecycled: number;
  wasteLandfilled: number;
  activeCitizens: number;
  activeDrivers: number;
  totalTransactions: number;
  adminCommission: number;
  driverEarnings: number;
  status: "draft" | "pending" | "approved" | "submitted";
  generatedDate: Date;
  approvedBy?: string;
  submittedToGovernment?: boolean;
}

export default function ComplianceReports() {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        // Mock data for demo
        const mockReports: ComplianceReport[] = [
          {
            id: 1,
            month: 11,
            year: 2024,
            totalWasteCollected: 45000,
            wasteRecycled: 30000,
            wasteLandfilled: 15000,
            activeCitizens: 245,
            activeDrivers: 32,
            totalTransactions: 1250,
            adminCommission: 3750000,
            driverEarnings: 15000000,
            status: "draft",
            generatedDate: new Date(),
          },
          {
            id: 2,
            month: 10,
            year: 2024,
            totalWasteCollected: 42000,
            wasteRecycled: 28500,
            wasteLandfilled: 13500,
            activeCitizens: 230,
            activeDrivers: 28,
            totalTransactions: 1100,
            adminCommission: 3300000,
            driverEarnings: 13200000,
            status: "approved",
            generatedDate: new Date(),
            approvedBy: "Admin BlueCycle",
            submittedToGovernment: true,
          },
        ];
        setReports(mockReports);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const generateReport = async () => {
    alert("Laporan baru sedang digenerate untuk bulan ini...");
  };

  const exportPDF = (report: ComplianceReport) => {
    alert(`Export PDF laporan ${report.month}/${report.year} - Coming soon`);
  };

  const exportExcel = (report: ComplianceReport) => {
    alert(`Export Excel laporan ${report.month}/${report.year} - Coming soon`);
  };

  const currentReports = reports.filter((r) => r.year === selectedYear);
  const monthNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Laporan Kepatuhan DLH</h1>
          <p className="text-gray-600 dark:text-gray-400">Laporan bulanan & tahunan untuk Dinas Lingkungan Hidup</p>
        </div>
        <Button onClick={generateReport} data-testid="button-generate-report">
          <FileText className="h-4 w-4 mr-2" />
          Generate Laporan Baru
        </Button>
      </div>

      <div className="flex gap-4">
        {[2024, 2023, 2022].map((year) => (
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
        <div>Memuat laporan...</div>
      ) : currentReports.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">Belum ada laporan untuk tahun ini</CardContent>
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
                      Laporan {monthNames[report.month]} {report.year}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Generated: {new Date(report.generatedDate).toLocaleDateString("id-ID")}</p>
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Sampah Dikumpulkan</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{report.totalWasteCollected.toLocaleString("id-ID")} kg</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sampah Didaur Ulang</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{report.wasteRecycled.toLocaleString("id-ID")} kg</p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sampah ke TPA</p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{report.wasteLandfilled.toLocaleString("id-ID")} kg</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Warga Aktif</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{report.activeCitizens}</p>
                  </div>
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Driver Aktif</p>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{report.activeDrivers}</p>
                  </div>
                  <div className="p-3 bg-pink-50 dark:bg-pink-950 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Transaksi</p>
                    <p className="text-lg font-bold text-pink-600 dark:text-pink-400">{report.totalTransactions}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-semibold mb-2">Distribusi Keuangan</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Komisi Admin (20%)</p>
                      <p className="text-lg font-bold">Rp {report.adminCommission.toLocaleString("id-ID")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Penghasilan Driver (80%)</p>
                      <p className="text-lg font-bold">Rp {report.driverEarnings.toLocaleString("id-ID")}</p>
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
