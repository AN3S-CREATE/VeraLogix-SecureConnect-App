import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Shield, Home, KeyRound, Menu, User, Settings, Plug, ShieldAlert, Wrench } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons/logo";

export default function CmdLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">VeraLogix CMD</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard">
                <Link href="/cmd"><Home /><span>Dashboard</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Access Control">
                <Link href="/cmd/access"><KeyRound /><span>Access Control</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Incidents">
                <Link href="/cmd/incidents"><ShieldAlert /><span>Incidents</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Work Orders">
                <Link href="/cmd/work-orders"><Wrench /><span>Work Orders</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Integrations">
                <Link href="/cmd/integrations"><Plug /><span>Integrations</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Users">
                <Link href="#"><User /><span>User Management</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <Link href="#"><Settings /><span>System Settings</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 bg-background border-b border-border md:hidden">
            <Link href="/cmd" className="flex items-center gap-2">
                <Logo className="w-6 h-6 text-primary" />
                <span className="text-lg font-semibold">VeraLogix CMD</span>
            </Link>
            <SidebarTrigger>
                <Menu className="w-6 h-6" />
            </SidebarTrigger>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
