import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { BlueCycleSidebar } from "@/components/bluecycle-sidebar";
import { NotificationBell } from "@/components/notification-bell";
import { useState } from "react";
import BlueCycleLogin from "@/pages/bluecycle-login";
import BlueCycleDashboard from "@/pages/bluecycle-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import DriverDashboard from "@/pages/driver-dashboard";
import PickupRequests from "@/pages/pickup-requests";
import UserManagement from "@/pages/user-management";
import Settings from "@/pages/settings";
import WasteCatalog from "@/pages/waste-catalog";
import DriverEarnings from "@/pages/driver-earnings";
import UserEarnings from "@/pages/user-earnings";
import DriverPaymentSettings from "@/pages/driver-payment-settings";
import UserDashboard from "@/pages/user-dashboard";
import EnvironmentalImpact from "@/pages/environmental-impact";
import OrderCheckout from "@/pages/order-checkout";
import CollectionPoints from "@/pages/collection-points";
import WasteDisposal from "@/pages/waste-disposal";
import ComplianceReports from "@/pages/compliance-reports";
import AdminPaymentManagement from "@/pages/admin-payment-management";
import NotFound from "@/pages/not-found";

function Router() {
  const [location, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    role: "admin" | "user" | "driver";
    name: string;
    email: string;
  } | null>(null);

  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Permintaan pickup baru",
      message: "Sarah Johnson minta pickup di Jl. Sudirman No. 123",
      timestamp: "2 menit lalu",
      read: false,
    },
    {
      id: "2",
      title: "Rute selesai",
      message: "Supir #3 menyelesaikan rute Distrik Utara",
      timestamp: "1 jam lalu",
      read: false,
    },
    {
      id: "3",
      title: "Supir baru ditugaskan",
      message: "Mike Davis ditugaskan ke Armada #05",
      timestamp: "3 jam lalu",
      read: true,
    },
  ]);

  const isLoginPage = location === "/" || location === "/login" || !currentUser;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleLogout = () => {
    console.log("Logging out...");
    setCurrentUser(null);
    setLocation("/");
  };

  const handleLogin = (role: "admin" | "user" | "driver") => {
    const userData = {
      admin: { id: 1, name: "Admin BlueCycle", email: "admin@bluecycle.com", role: "admin" as const },
      user: { id: 2, name: "Budi Santoso", email: "budi@example.com", role: "user" as const },
      driver: { id: 3, name: "Joko Wijaya", email: "joko@bluecycle.com", role: "driver" as const },
    };
    setCurrentUser(userData[role]);
    setLocation("/dashboard");
  };

  if (isLoginPage) {
    const LoginPage = () => <BlueCycleLogin onLogin={handleLogin} />;
    return (
      <Switch>
        <Route path="/" component={LoginPage} />
        <Route path="/login" component={LoginPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        {currentUser && (
          <BlueCycleSidebar
            userRole={currentUser.role}
            userName={currentUser.name}
            userEmail={currentUser.email}
            onLogout={handleLogout}
          />
        )}
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <NotificationBell
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
              />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Switch>
              <Route path="/dashboard" component={() => {
                if (currentUser?.role === "driver") return <DriverDashboard />;
                if (currentUser?.role === "user") return <UserDashboard userId={currentUser?.id} userName={currentUser?.name} />;
                if (currentUser?.role === "admin") return <AdminDashboard />;
                return <BlueCycleDashboard />;
              }} />
              <Route path="/pickups" component={() => <PickupRequests userId={currentUser?.id} userName={currentUser?.name} />} />
              <Route path="/catalog" component={() => <WasteCatalog userRole={currentUser?.role} />} />
              <Route path="/earnings" component={() => currentUser?.role === "driver" ? <DriverEarnings /> : <UserEarnings />} />
              <Route path="/payment-settings" component={DriverPaymentSettings} />
              <Route path="/order/:itemId" component={(props) => <OrderCheckout itemId={props.params.itemId} userId={currentUser?.id} />} />
              <Route path="/payment-management" component={AdminPaymentManagement} />
              <Route path="/collection-points" component={CollectionPoints} />
              <Route path="/waste-disposal" component={WasteDisposal} />
              <Route path="/compliance" component={ComplianceReports} />
              <Route path="/environmental-impact" component={EnvironmentalImpact} />
              <Route path="/routes" component={BlueCycleDashboard} />
              <Route path="/fleet" component={BlueCycleDashboard} />
              <Route path="/users" component={UserManagement} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
