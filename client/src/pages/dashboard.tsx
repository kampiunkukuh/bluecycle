import { useState } from "react";
import { StatsCard } from "@/components/stats-card";
import { ActivityFeed } from "@/components/activity-feed";
import { FileText, Users, Eye, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

// TODO: Remove mock data when implementing real backend
const mockStats = [
  {
    title: "Total Content",
    value: 248,
    icon: FileText,
    trend: { value: 12, direction: "up" as const },
    description: "From last month",
  },
  {
    title: "Active Users",
    value: 1423,
    icon: Users,
    trend: { value: 5, direction: "down" as const },
    description: "From last month",
  },
  {
    title: "Page Views",
    value: "12.4k",
    icon: Eye,
    trend: { value: 23, direction: "up" as const },
    description: "From last month",
  },
  {
    title: "Engagement Rate",
    value: "68%",
    icon: TrendingUp,
    trend: { value: 8, direction: "up" as const },
    description: "From last month",
  },
];

const mockActivities = [
  {
    id: "1",
    user: "Sarah Johnson",
    userInitials: "SJ",
    action: "published",
    target: "Getting Started Guide",
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    user: "Mike Davis",
    userInitials: "MD",
    action: "edited",
    target: "API Documentation",
    timestamp: "15 minutes ago",
  },
  {
    id: "3",
    user: "Alex Chen",
    userInitials: "AC",
    action: "created",
    target: "New Feature Announcement",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    user: "Emma Wilson",
    userInitials: "EW",
    action: "deleted",
    target: "Old Tutorial",
    timestamp: "2 hours ago",
  },
  {
    id: "5",
    user: "David Brown",
    userInitials: "DB",
    action: "commented on",
    target: "Release Notes",
    timestamp: "3 hours ago",
  },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <Button onClick={() => setLocation("/content")} data-testid="button-create-content">
          Create Content
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
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setLocation("/content")}
              data-testid="button-new-article"
            >
              <FileText className="mr-2 h-4 w-4" />
              New Article
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setLocation("/users")}
              data-testid="button-manage-users"
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => console.log("View analytics")}
              data-testid="button-view-analytics"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
