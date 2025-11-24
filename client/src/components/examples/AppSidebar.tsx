import { AppSidebar } from "../app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppSidebarExample() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar
          userRole="admin"
          userName="John Smith"
          userEmail="john@example.com"
          onLogout={() => console.log("Logout clicked")}
        />
      </div>
    </SidebarProvider>
  );
}
