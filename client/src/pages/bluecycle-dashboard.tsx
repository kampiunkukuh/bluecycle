import { ModernStatsCard } from "@/components/modern-stats-card";
import { ActivityFeed } from "@/components/activity-feed";
import { Trash2, Truck, Users, TrendingUp, MapPin, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

const mockStats = [
  {
    title: "Pending Pickups",
    value: 42,
    icon: Trash2,
    trend: { value: 8, direction: "up" as const },
    description: "Awaiting collection",
    color: "primary" as const,
  },
  {
    title: "Active Drivers",
    value: 12,
    icon: Truck,
    trend: { value: 2, direction: "up" as const },
    description: "On route now",
    color: "orange" as const,
  },
  {
    title: "Total Users",
    value: "1.2K",
    icon: Users,
    trend: { value: 15, direction: "up" as const },
    description: "Registered accounts",
    color: "blue" as const,
  },
  {
    title: "Waste Collected",
    value: "3.2T",
    icon: TrendingUp,
    trend: { value: 12, direction: "up" as const },
    description: "This month",
    color: "purple" as const,
  },
];

const mockActivities = [
  {
    id: "1",
    user: "Sarah Johnson",
    userInitials: "SJ",
    action: "requested pickup at",
    target: "123 Main Street",
    timestamp: "5 minutes ago",
  },
  {
    id: "2",
    user: "Mike Davis",
    userInitials: "MD",
    action: "completed route",
    target: "North District",
    timestamp: "20 minutes ago",
  },
  {
    id: "3",
    user: "Alex Chen",
    userInitials: "AC",
    action: "started route",
    target: "East Side Area",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    user: "Emma Wilson",
    userInitials: "EW",
    action: "joined as driver",
    target: "Fleet #05",
    timestamp: "2 hours ago",
  },
];

const upcomingPickups = [
  {
    id: "1",
    address: "123 Main Street",
    time: "10:00 AM",
    type: "Organic",
    status: "scheduled",
  },
  {
    id: "2",
    address: "456 Oak Avenue",
    time: "11:30 AM",
    type: "Recyclable",
    status: "in-progress",
  },
  {
    id: "3",
    address: "789 Pine Road",
    time: "2:00 PM",
    type: "General",
    status: "scheduled",
  },
];

export default function BlueCycleDashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Good morning! 👋</h1>
          <p className="text-muted-foreground text-base">
            Here's what's happening with BlueCycle today
          </p>
        </div>
        <Button 
          onClick={() => setLocation("/pickups")} 
          size="lg"
          className="h-12 px-6 text-base font-semibold shadow-md"
          data-testid="button-request-pickup"
        >
          <Trash2 className="mr-2 h-5 w-5" />
          Request Pickup
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {mockStats.map((stat) => (
          <ModernStatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Today's Schedule</CardTitle>
                  <CardDescription className="mt-1">Upcoming waste collections</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/pickups")}>
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingPickups.map((pickup) => (
                <div 
                  key={pickup.id} 
                  className="flex items-center gap-4 p-4 rounded-lg border hover-elevate"
                  data-testid={`pickup-item-${pickup.id}`}
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{pickup.address}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {pickup.time}
                      </span>
                      <span>•</span>
                      <span>{pickup.type}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={pickup.status === "in-progress" ? "default" : "secondary"}
                    className="flex-shrink-0"
                  >
                    {pickup.status === "in-progress" ? "In Progress" : "Scheduled"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-md" data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription className="mt-1">Common tasks and operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2 hover-elevate"
                  onClick={() => setLocation("/pickups")}
                  data-testid="button-new-pickup"
                >
                  <Trash2 className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">New Pickup</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2 hover-elevate"
                  onClick={() => setLocation("/routes")}
                  data-testid="button-view-routes"
                >
                  <MapPin className="h-6 w-6 text-orange-600" />
                  <span className="text-sm font-medium">Routes</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col gap-2 hover-elevate"
                  onClick={() => setLocation("/fleet")}
                  data-testid="button-fleet-status"
                >
                  <Truck className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium">Fleet</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <ActivityFeed activities={mockActivities} />
        </div>
      </div>
    </div>
  );
}
