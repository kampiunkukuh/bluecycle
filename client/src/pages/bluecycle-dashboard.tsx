import { StatsCard } from "@/components/stats-card";
import { ActivityFeed } from "@/components/activity-feed";
import { Trash2, Truck, Users, TrendingUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

// TODO: Remove mock data when implementing real backend
const mockStats = [
  {
    title: "Pending Pickups",
    value: 42,
    icon: Trash2,
    trend: { value: 8, direction: "up" as const },
    description: "From last week",
  },
  {
    title: "Active Drivers",
    value: 12,
    icon: Truck,
    trend: { value: 2, direction: "up" as const },
    description: "Currently on routes",
  },
  {
    title: "Total Users",
    value: 1248,
    icon: Users,
    trend: { value: 15, direction: "up" as const },
    description: "Registered users",
  },
  {
    title: "Waste Collected",
    value: "3.2 tons",
    icon: TrendingUp,
    trend: { value: 12, direction: "up" as const },
    description: "This month",
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
  {
    id: "5",
    user: "David Brown",
    userInitials: "DB",
    action: "requested pickup at",
    target: "456 Oak Avenue",
    timestamp: "3 hours ago",
  },
];

export default function BlueCycleDashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to BlueCycle! Monitor waste management operations.
          </p>
        </div>
        <Button onClick={() => setLocation("/pickups")} data-testid="button-request-pickup">
          <Trash2 className="mr-2 h-4 w-4" />
          Request Pickup
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockStats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ActivityFeed activities={mockActivities} />
        
        <Card data-testid="card-quick-actions">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage waste collection operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setLocation("/pickups")}
              data-testid="button-new-pickup"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Schedule Pickup
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setLocation("/routes")}
              data-testid="button-view-routes"
            >
              <MapPin className="mr-2 h-4 w-4" />
              View Routes
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setLocation("/fleet")}
              data-testid="button-fleet-status"
            >
              <Truck className="mr-2 h-4 w-4" />
              Fleet Status
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
