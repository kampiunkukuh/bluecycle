import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface ModernStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  description?: string;
  color?: "primary" | "blue" | "orange" | "purple";
}

export function ModernStatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description,
  color = "primary"
}: ModernStatsCardProps) {
  const TrendIcon = trend?.direction === "up" ? TrendingUp : TrendingDown;
  const trendColor = trend?.direction === "up" 
    ? "text-green-600 dark:text-green-500" 
    : "text-red-600 dark:text-red-500";

  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-500",
    orange: "bg-orange-500/10 text-orange-600 dark:text-orange-500",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-500",
  };

  return (
    <Card className="shadow-md hover-elevate overflow-hidden" data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`h-12 w-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span data-testid="text-stat-trend">{trend.value}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold" data-testid="text-stat-value">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
