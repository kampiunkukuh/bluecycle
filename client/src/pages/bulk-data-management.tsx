import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, FileText, Loader, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportOption {
  id: string;
  name: string;
  description: string;
  endpoint: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function BulkDataManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedImportType, setSelectedImportType] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);

  const exportOptions: ExportOption[] = [
    {
      id: "pickups",
      name: "Data Pesanan",
      description: "Export semua data pesanan pickup (status, driver, lokasi, biaya)",
      endpoint: "/api/bulk-export/pickups",
    },
    {
      id: "users",
      name: "Data Users & Drivers",
      description: "Export semua data pengguna, driver, dan role mereka",
      endpoint: "/api/bulk-export/users",
    },
    {
      id: "payments",
      name: "Data Pembayaran",
      description: "Export data penarikan, pembayaran, dan komisi (20/80 split)",
      endpoint: "/api/bulk-export/payments",
    },
    {
      id: "disposals",
      name: "Data Pembuangan",
      description: "Export data pembuangan sampah ke TPA dan tempat daur ulang",
      endpoint: "/api/bulk-export/disposals",
    },
    {
      id: "collection",
      name: "Data Lokasi Pengumpulan",
      description: "Export data lokasi pengumpulan, kapasitas, dan status",
      endpoint: "/api/bulk-export/collection-points",
    },
  ];

  const importOptions = [
    { id: "pickups", name: "Import Pesanan", template: "pickup_id, waste_type, quantity, address, status" },
    { id: "users", name: "Import Users", template: "name, email, phone, role, bank_account" },
  ];

  const handleExport = async (endpoint: string, filename: string) => {
    setLoading(true);
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Export gagal");

      const csv = await response.text();
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
      element.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast({ title: "Export berhasil", description: `File ${filename} telah didownload` });
    } catch (error) {
      console.error("Export error:", error);
      toast({ title: "Export gagal", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleImportFile = async (file: File) => {
    if (!selectedImportType) {
      toast({ title: "Pilih tipe import terlebih dahulu", variant: "destructive" });
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());

      const response = await fetch(`/api/bulk-import/${selectedImportType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: lines }),
      });

      if (!response.ok) throw new Error("Import gagal");

      const result = await response.json();
      setImportResult(result);
      toast({
        title: "Import selesai",
        description: `${result.success} data berhasil, ${result.failed} gagal`,
      });
    } catch (error) {
      console.error("Import error:", error);
      toast({ title: "Import gagal", variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manajemen Data Bulk</h1>
        <p className="text-gray-600 dark:text-gray-400">Export & import data dalam format CSV untuk backup dan analisis</p>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportOptions.map((option) => (
              <div key={option.id} className="border rounded-lg p-4 hover-elevate flex flex-col justify-between" data-testid={`export-option-${option.id}`}>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{option.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{option.description}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleExport(option.endpoint, option.id)}
                  disabled={loading}
                  data-testid={`button-export-${option.id}`}
                >
                  {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Download CSV
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Pilih Tipe Import</Label>
              <select
                value={selectedImportType}
                onChange={(e) => setSelectedImportType(e.target.value)}
                className="w-full p-2 border rounded-md"
                data-testid="select-import-type"
              >
                <option value="">-- Pilih Tipe Data --</option>
                {importOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedImportType && (
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Format Template:</p>
                <code className="text-xs text-blue-800 dark:text-blue-200">{importOptions.find((o) => o.id === selectedImportType)?.template}</code>
              </div>
            )}

            <div className="border-2 border-dashed rounded-lg p-6 text-center hover-elevate cursor-pointer" onClick={() => fileInput?.click()}>
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 mb-1">Klik untuk upload file CSV</p>
              <input
                ref={setFileInput}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportFile(file);
                }}
                data-testid="input-csv-file"
              />
            </div>

            {importResult && (
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  {importResult.failed === 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  )}
                  <span className="font-semibold">
                    {importResult.success} berhasil, {importResult.failed} gagal
                  </span>
                </div>
                {importResult.errors.length > 0 && (
                  <ul className="text-sm text-red-600 space-y-1">
                    {importResult.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>- {err}</li>
                    ))}
                    {importResult.errors.length > 5 && <li>... dan {importResult.errors.length - 5} error lainnya</li>}
                  </ul>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Backup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Format:</span> Comma-Separated Values (CSV)
            </p>
            <p>
              <span className="font-semibold">Encoding:</span> UTF-8
            </p>
            <p>
              <span className="font-semibold">Use Case:</span> Analisis, backup reguler, migrasi data, laporan custom
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Semua file CSV yang di-export sudah tersertifikasi dan aman untuk digunakan di analytics tools atau database lain.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
