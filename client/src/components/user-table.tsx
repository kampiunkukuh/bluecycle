import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, Shield } from "lucide-react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "online" | "offline" | "away";
  lastActive: string;
}

interface UserTableProps {
  users: User[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onChangeRole: (id: string) => void;
}

export function UserTable({ users, onEdit, onDelete, onChangeRole }: UserTableProps) {
  const roleColors: Record<string, string> = {
    admin: "bg-destructive text-destructive-foreground",
    editor: "bg-primary text-primary-foreground",
    viewer: "bg-secondary text-secondary-foreground",
  };

  const statusColors: Record<string, string> = {
    online: "bg-status-online",
    offline: "bg-status-offline",
    away: "bg-status-away",
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const initials = user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${statusColors[user.status]}`}
                      />
                    </div>
                    <span className="font-medium" data-testid="text-user-name">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground" data-testid="text-user-email">{user.email}</TableCell>
                <TableCell>
                  <Badge className={roleColors[user.role]} data-testid={`badge-role-${user.role}`}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm capitalize">{user.status}</span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.lastActive}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-user-actions-${user.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(user.id)} data-testid="button-edit-user">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onChangeRole(user.id)} data-testid="button-change-role">
                        <Shield className="mr-2 h-4 w-4" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(user.id)}
                        className="text-destructive"
                        data-testid="button-delete-user"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
