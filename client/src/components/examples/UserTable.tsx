import { UserTable } from "../user-table";

export default function UserTableExample() {
  const users = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "admin" as const,
      status: "online" as const,
      lastActive: "Active now",
    },
    {
      id: "2",
      name: "Mike Davis",
      email: "mike@example.com",
      role: "editor" as const,
      status: "away" as const,
      lastActive: "5 minutes ago",
    },
    {
      id: "3",
      name: "Alex Chen",
      email: "alex@example.com",
      role: "viewer" as const,
      status: "offline" as const,
      lastActive: "2 hours ago",
    },
  ];

  return (
    <div className="p-4">
      <UserTable
        users={users}
        onEdit={(id) => console.log("Edit user", id)}
        onDelete={(id) => console.log("Delete user", id)}
        onChangeRole={(id) => console.log("Change role", id)}
      />
    </div>
  );
}
