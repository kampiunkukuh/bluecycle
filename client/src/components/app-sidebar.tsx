import {
  LayoutDashboard,
  History,
  Package,
  TrendingUp,
  Settings,
  LogOut,
  Users,
  QrCode,
  Trash2,
  MapPin,
  FileText,
  CreditCard,
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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "wouter";

type UserRole = "admin" | "user" | "driver";

interface AppSidebarProps {
  userRole: UserRole;
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

export function AppSidebar({ userRole, userName, userEmail, onLogout }: AppSidebarProps) {
  const [location, setLocation] = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "user", "driver"],
    },
    {
      title: "Riwayat Pesanan",
      url: "/pickups",
      icon: History,
      roles: ["user", "driver"],
    },
    {
      title: "Katalog Sampah",
      url: "/catalog",
      icon: Package,
      roles: ["admin"],
    },
    {
      title: "Earning & Penarikan",
      url: "/earnings",
      icon: TrendingUp,
      roles: ["user", "driver"],
    },
    // Admin-only features
    {
      title: "Users",
      url: "/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      title: "Lokasi Pengumpulan",
      url: "/collection-points",
      icon: MapPin,
      roles: ["admin"],
    },
    {
      title: "Pembuangan Sampah",
      url: "/waste-disposal",
      icon: Trash2,
      roles: ["admin"],
    },
    {
      title: "QR Verification",
      url: "/qr-tracking",
      icon: QrCode,
      roles: ["admin"],
    },
    {
      title: "Laporan Kepatuhan",
      url: "/compliance",
      icon: FileText,
      roles: ["admin"],
    },
    {
      title: "Manajemen Pembayaran",
      url: "/payment-management",
      icon: CreditCard,
      roles: ["admin"],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      roles: ["admin"],
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
                    data-testid={`link-${item.title.toLowerCase()}`}
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
                <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">{userEmail}</p>
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
