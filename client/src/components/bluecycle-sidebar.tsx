import {
  LayoutDashboard,
  Trash2,
  Truck,
  Users,
  MapPin,
  Settings,
  LogOut,
  Recycle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "wouter";

type UserRole = "admin" | "user" | "driver";

interface BlueCycleSidebarProps {
  userRole: UserRole;
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

export function BlueCycleSidebar({ userRole, userName, userEmail, onLogout }: BlueCycleSidebarProps) {
  const [location, setLocation] = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "user", "driver"],
    },
    {
      title: "Pickup Requests",
      url: "/pickups",
      icon: Trash2,
      roles: ["admin", "user"],
    },
    {
      title: "My Routes",
      url: "/routes",
      icon: MapPin,
      roles: ["driver"],
    },
    {
      title: "Fleet Management",
      url: "/fleet",
      icon: Truck,
      roles: ["admin"],
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      roles: ["admin", "user", "driver"],
    },
  ];

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <Recycle className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">BlueCycle</h2>
            <p className="text-xs text-muted-foreground">Waste Management</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <a href={item.url} onClick={(e) => {
                      e.preventDefault();
                      setLocation(item.url);
                    }}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback data-testid="text-user-initials">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" data-testid="text-user-name">{userName}</p>
                <p className="text-xs text-muted-foreground truncate capitalize" data-testid="text-user-role">{userRole}</p>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout} data-testid="button-logout">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
