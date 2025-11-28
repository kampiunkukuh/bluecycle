import { StatsCard } from "../stats-card";
import { FileText, Users, Eye } from "lucide-react";

export default function StatsCardExample() {
  return (
    <div className="p-4 grid grid-cols-3 gap-4">
      <StatsCard
        title="Total Content"
        value={248}
        icon={FileText}
        trend={{ value: 12, direction: "up" }}
        description="From last month"
      />
      <StatsCard
        title="Active Users"
        value={1423}
        icon={Users}
        trend={{ value: 5, direction: "down" }}
        description="From last month"
      />
      <StatsCard
        title="Page Views"
        value="12.4k"
        icon={Eye}
        trend={{ value: 23, direction: "up" }}
        description="From last month"
      />
    </div>
  );
}
