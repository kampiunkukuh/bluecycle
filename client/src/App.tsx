import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppSidebar } from "@/components/app-sidebar";
import { NotificationBell } from "@/components/notification-bell";
import { useState } from "react";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import ContentManagement from "@/pages/content-management";
import UserManagement from "@/pages/user-management";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  const [location, setLocation] = useLocation();
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

  const isLoginPage = location === "/" || location === "/login";

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleLogout = () => {
    console.log("Logging out...");
    setLocation("/");
  };

  // TODO: Replace with real user data from authentication
  const currentUser = {
    role: "admin" as const,
    name: "John Smith",
    email: "john@example.com",
  };

  if (isLoginPage) {
    return (
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/login" component={Login} />
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
        <AppSidebar
          userRole={currentUser.role}
          userName={currentUser.name}
          userEmail={currentUser.email}
          onLogout={handleLogout}
        />
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
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/content" component={ContentManagement} />
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
