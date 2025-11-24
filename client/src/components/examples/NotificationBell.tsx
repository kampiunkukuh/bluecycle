import { NotificationBell } from "../notification-bell";
import { useState } from "react";

export default function NotificationBellExample() {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "New content published",
      message: "Sarah Johnson published 'Getting Started Guide'",
      timestamp: "2 minutes ago",
      read: false,
    },
    {
      id: "2",
      title: "User role changed",
      message: "Mike Davis was promoted to Editor",
      timestamp: "1 hour ago",
      read: false,
    },
    {
      id: "3",
      title: "Content updated",
      message: "Alex Chen edited 'API Documentation'",
      timestamp: "3 hours ago",
      read: true,
    },
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    console.log(`Marked notification ${id} as read`);
  };

  return (
    <div className="p-4">
      <NotificationBell notifications={notifications} onMarkAsRead={handleMarkAsRead} />
    </div>
  );
}
