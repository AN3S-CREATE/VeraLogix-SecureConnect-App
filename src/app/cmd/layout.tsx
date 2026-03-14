"use client";

import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Home, KeyRound, Menu, User, Settings, Plug, ShieldAlert, Wrench, ReceiptText, DollarSign, Zap, MessageSquare, Search, Droplets, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/icons/logo";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import Image from "next/image";

export default function CmdLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/cmd", icon: Home, label: "Dashboard" },
    { href: "/cmd/access", icon: KeyRound, label: "Access Control" },
    { href: "/cmd/incidents", icon: ShieldAlert, label: "Incidents" },
    { href: "/cmd/concierge", icon: MessageSquare, label: "Concierge" },
    { href: "/cmd/maintenance", icon: Wrench, label: "Maintenance" },
    { href: "/cmd/invoices", icon: ReceiptText, label: "Invoices" },
    { href: "/cmd/pricing", icon: DollarSign, label: "Pricing" },
    { href: "/cmd/energy", icon: Droplets, label: "Energy" },
    { href: "/cmd/ev-charging", icon: Zap, label: "EV Charging" },
    { href: "/cmd/reports", icon: BookOpen, label: "Reports" },
    { href: "/cmd/integrations", icon: Plug, label: "Integrations" },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Logo className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">VeraLogix CMD</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.label}
                  isActive={pathname === item.href}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Users" isActive={pathname === "/cmd/users"}>
                <Link href="#"><User /><span>User Management</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings" isActive={pathname === "/cmd/settings"}>
                <Link href="#"><Settings /><span>System Settings</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <header className="flex h-14 items-center justify-between p-4 bg-background border-b border-border sticky top-0 z-30">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden">
                    <Menu className="w-6 h-6" />
                </SidebarTrigger>
                <Link href="/cmd" className="flex items-center gap-2 md:hidden">
                    <Logo className="w-6 h-6 text-primary" />
                    <span className="text-lg font-semibold">VeraLogix CMD</span>
                </Link>
                <div className="hidden md:flex items-center gap-2 rounded-md border p-2 text-sm text-muted-foreground w-64">
                  <Search className="h-4 w-4"/>
                  <span>Search...</span>
                  <span className="ml-auto rounded-sm bg-muted px-1.5 py-0.5 text-xs">⌘K</span>
                </div>
              </div>
               <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">Notifications</p>
                  <p className="text-sm text-muted-foreground">User Menu</p>
              </div>
          </header>
          <OfflineIndicator />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
          </main>
          <footer className="py-2 px-4 border-t border-border/10 bg-black/5">
            <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">Powered by</span>
                <Link href="https://veralogix.com" target="_blank" rel="noopener noreferrer">
                  <Image src="https://iili.io/KeG9tjt.png" alt="VeraLogix Logo" width={80} height={16} className="opacity-80 hover:opacity-100 transition-opacity" />
                </Link>
            </div>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}