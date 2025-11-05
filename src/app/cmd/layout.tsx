
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Shield, Home, KeyRound, Menu, User, Settings, Plug, ShieldAlert, Wrench, ReceiptText, DollarSign, Zap, MessageSquare, Search, Droplets, BookOpen } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons/logo";
import { Button } from "@/components/ui/button";

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
              <SidebarMenuButton asChild tooltip="Concierge">
                <Link href="/cmd/concierge"><MessageSquare /><span>Concierge</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Maintenance">
                <Link href="/cmd/maintenance"><Wrench /><span>Maintenance</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Invoices">
                <Link href="/cmd/invoices"><ReceiptText /><span>Invoices</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Pricing">
                <Link href="/cmd/pricing"><DollarSign /><span>Pricing</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Energy">
                <Link href="/cmd/energy"><Droplets /><span>Energy</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="EV Charging">
                <Link href="/cmd/ev-charging"><Zap /><span>EV Charging</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Reports">
                <Link href="/cmd/reports"><BookOpen /><span>Reports</span></Link>
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
        <header className="flex h-14 items-center justify-between p-4 bg-background border-b border-border">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden">
                  <Menu className="w-6 h-6" />
              </SidebarTrigger>
              <Link href="/cmd" className="flex items-center gap-2 md:hidden">
                  <Logo className="w-6 h-6 text-primary" />
                  <span className="text-lg font-semibold">VeraLogix CMD</span>
              </Link>
              <div className="hidden md:flex items-center gap-2 rounded-md border p-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4"/>
                <span>Search...</span>
                <span className="ml-4 rounded-sm bg-muted px-1.5 py-0.5 text-xs">⌘K</span>
              </div>
            </div>
             <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">Notifications</p>
                <p className="text-sm text-muted-foreground">User Menu</p>
            </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
