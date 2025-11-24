import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Leaf, Zap, Wind, AlertCircle } from "lucide-react";

interface PickupOrder {
  id: number;
  wasteType: string;
  quantity?: string;
  status: string;
  createdAt: Date;
}

export default function EnvironmentalImpact() {
  const [pickups, setPickups] = useState<PickupOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/pickups?status=completed");
        const data = await response.json();
        setPickups(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch pickups:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate environmental impact metrics
  const completedPickups = pickups.filter((p) => p.status === "completed");
  const totalKg = completedPickups.reduce((sum, p) => sum + (parseInt(p.quantity || "0") || 0), 0);

  // CO2 saved per waste type (estimate)
  const co2Multiplier: { [key: string]: number } = {
    Plastik: 5.0,
    Kertas: 1.5,
    Logam: 8.0,
    Organik: 0.5,
  };

  // Trees equivalent
  const treesEquivalent = Math.round(totalKg / 20);

  // Energy saved (kWh)
  const energySaved = Math.round(totalKg * 2.5);

  // Impact data per waste type
  const impactByWaste = ["Plastik", "Kertas", "Logam", "Organik"].map((type) => {
    const kg = completedPickups.filter((p) => p.wasteType === type).reduce((sum, p) => sum + (parseInt(p.quantity || "0") || 0), 0);
    const co2 = kg * (co2Multiplier[type] || 1);
    return { type, kg, co2: Math.round(co2), trees: Math.round(kg / 20) };
  });

  // Daily impact trend
  const impactTrend = completedPickups
    .reduce((acc: any[], p) => {
      const date = new Date(p.createdAt).toLocaleDateString("id-ID");
      const existing = acc.find((d) => d.date === date);
      const kg = parseInt(p.quantity || "0") || 0;
      const co2 = kg * (co2Multiplier[p.wasteType] || 1);

      if (existing) {
        existing.kg += kg;
        existing.co2Saved += co2;
        existing.trees += kg / 20;
      } else {
        acc.push({ date, kg, co2Saved: co2, trees: kg / 20 });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);

  // Milestone achievements
  const milestones = [
    { target: 100, unit: "kg", icon: "🎯", label: "Milestone 100kg", reached: totalKg >= 100 },
    { target: 500, unit: "kg", icon: "🏆", label: "Milestone 500kg", reached: totalKg >= 500 },
    { target: 1000, unit: "kg", icon: "👑", label: "Milestone 1000kg", reached: totalKg >= 1000 },
    { target: 50, unit: "trees", icon: "🌳", label: "50 Pohon", reached: treesEquivalent >= 50 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Environmental Impact 🌍</h1>
        <p className="text-gray-600 dark:text-gray-400">Lihat dampak lingkungan dari aktivitas BlueCycle</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Total kg Terkumpul
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{totalKg}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">kg sampah</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wind className="h-4 w-4" />
              CO2 Terhemat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(impactByWaste.reduce((sum, w) => sum + w.co2, 0))}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">kg CO2</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Pohon Setara
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{treesEquivalent}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">pohon ditanam</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Energi Terhemat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{energySaved}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">kWh</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{completedPickups.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">order selesai</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="trends">Tren Dampak</TabsTrigger>
          <TabsTrigger value="milestones">Pencapaian</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dampak per Jenis Sampah</CardTitle>
            </CardHeader>
            <CardContent>
              {impactByWaste.some((w) => w.kg > 0) ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={impactByWaste}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="kg" fill="#10b981" name="kg Terkumpul" />
                    <Bar yAxisId="right" dataKey="co2" fill="#3b82f6" name="kg CO2 Terhemat" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">Belum ada data</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistik Detail Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold">Jenis Sampah</th>
                      <th className="text-right py-2 px-3 font-semibold">Total kg</th>
                      <th className="text-right py-2 px-3 font-semibold">CO2 Terhemat</th>
                      <th className="text-right py-2 px-3 font-semibold">Pohon Setara</th>
                    </tr>
                  </thead>
                  <tbody>
                    {impactByWaste.map((waste) => (
                      <tr key={waste.type} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="py-3 px-3 font-medium">{waste.type}</td>
                        <td className="text-right py-3 px-3">{waste.kg} kg</td>
                        <td className="text-right py-3 px-3 font-semibold text-blue-600 dark:text-blue-400">{waste.co2} kg</td>
                        <td className="text-right py-3 px-3 font-semibold text-green-600 dark:text-green-400">{waste.trees}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tren Dampak Lingkungan (7 Hari)</CardTitle>
            </CardHeader>
            <CardContent>
              {impactTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={impactTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="kg" stroke="#10b981" name="kg Terkumpul" strokeWidth={2} dot={{ fill: "#10b981", r: 5 }} />
                    <Line yAxisId="right" type="monotone" dataKey="co2Saved" stroke="#3b82f6" name="kg CO2 Terhemat" strokeWidth={2} dot={{ fill: "#3b82f6", r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">Belum ada data</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pencapaian & Milestone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {milestones.map((milestone) => (
                <div key={milestone.label} className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{milestone.icon}</span>
                    <div>
                      <p className="font-semibold">{milestone.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Target: {milestone.target} {milestone.unit}</p>
                    </div>
                  </div>
                  {milestone.reached ? (
                    <div className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-semibold">
                      Tercapai
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full text-sm">
                      Dalam Proses
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Environmental Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>Dengan mengumpulkan <strong>{totalKg} kg sampah</strong>, BlueCycle telah:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Menyelamatkan <strong>{treesEquivalent} pohon</strong></li>
                  <li>Mengurangi emisi CO2 sebesar <strong>{Math.round(impactByWaste.reduce((sum, w) => sum + w.co2, 0))} kg</strong></li>
                  <li>Menghemat energi setara <strong>{energySaved} kWh</strong></li>
                  <li>Mendukung <strong>{completedPickups.length} transaksi sampah</strong> ramah lingkungan</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
