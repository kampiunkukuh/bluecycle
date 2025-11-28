import { ActivityFeed } from "../activity-feed";

export default function ActivityFeedExample() {
  const activities = [
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
  ];

  return (
    <div className="p-4 max-w-md">
      <ActivityFeed activities={activities} />
    </div>
  );
}
