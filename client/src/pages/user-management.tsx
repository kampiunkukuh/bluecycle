import { useState } from "react";
import { UserTable, User } from "@/components/user-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// TODO: Remove mock data when implementing real backend
const initialUsers: User[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "admin",
    status: "online",
    lastActive: "Active now",
  },
  {
    id: "2",
    name: "Mike Davis",
    email: "mike@example.com",
    role: "editor",
    status: "away",
    lastActive: "5 minutes ago",
  },
  {
    id: "3",
    name: "Alex Chen",
    email: "alex@example.com",
    role: "viewer",
    status: "offline",
    lastActive: "2 hours ago",
  },
  {
    id: "4",
    name: "Emma Wilson",
    email: "emma@example.com",
    role: "editor",
    status: "online",
    lastActive: "Active now",
  },
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"edit" | "role" | "add">("add");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "viewer" as User["role"],
  });

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setSelectedUser(user);
      setFormData({ name: user.name, email: user.email, role: user.role });
      setDialogType("edit");
      setShowDialog(true);
    }
  };

  const handleDelete = (id: string) => {
    console.log("Delete user:", id);
    setUsers(users.filter((u) => u.id !== id));
  };

  const handleChangeRole = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setSelectedUser(user);
      setFormData({ name: user.name, email: user.email, role: user.role });
      setDialogType("role");
      setShowDialog(true);
    }
  };

  const handleSave = () => {
    if (dialogType === "add") {
      const newUser: User = {
        id: String(Date.now()),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: "offline",
        lastActive: "Just added",
      };
      setUsers([...users, newUser]);
    } else if (selectedUser) {
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id
            ? { ...u, name: formData.name, email: formData.email, role: formData.role }
            : u
        )
      );
    }
    setShowDialog(false);
    setSelectedUser(null);
    setFormData({ name: "", email: "", role: "viewer" });
  };

  const openAddDialog = () => {
    setSelectedUser(null);
    setFormData({ name: "", email: "", role: "viewer" });
    setDialogType("add");
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage users and their roles
          </p>
        </div>
        <Button onClick={openAddDialog} data-testid="button-add-user">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-users"
          />
        </div>
      </div>

      <UserTable
        users={filteredUsers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onChangeRole={handleChangeRole}
      />

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === "add"
                ? "Add User"
                : dialogType === "edit"
                ? "Edit User"
                : "Change User Role"}
            </DialogTitle>
            <DialogDescription>
              {dialogType === "add"
                ? "Add a new user to the system"
                : dialogType === "edit"
                ? "Update user information"
                : "Change the user's role and permissions"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {dialogType !== "role" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter user name"
                    data-testid="input-user-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="user@example.com"
                    data-testid="input-user-email-form"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: User["role"]) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger id="role" data-testid="select-user-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.role === "admin" && "Full access to all features"}
                {formData.role === "editor" && "Can create and edit content"}
                {formData.role === "viewer" && "Read-only access"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} data-testid="button-cancel-user">
              Cancel
            </Button>
            <Button onClick={handleSave} data-testid="button-save-user">
              {dialogType === "add" ? "Add User" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
