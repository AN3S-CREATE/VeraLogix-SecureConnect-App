"use client";

import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, KeyRound, Ticket, Building, CreditCard, MessageSquare, Car, Menu, Wrench, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/icons/logo";
import Image from "next/image";

export default function TenLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/ten/home", icon: Home, label: "Home" },
    { href: "/ten/keys", icon: KeyRound, label: "Digital Keys" },
    { href: "/ten/passes", icon: Ticket, label: "Visitor Passes" },
    { href: "/ten/amenities", icon: Building, label: "Amenities" },
    { href: "/ten/wallet", icon: CreditCard, label: "Payments" },
    { href: "/ten/maintenance", icon: Wrench, label: "Maintenance" },
    { href: "/ten/ev", icon: Car, label: "EV Charging" },
    { href: "/ten/concierge", icon: MessageSquare, label: "Concierge" },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Logo className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">VeraLogix</span>
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
                  <Link href="/ten/home" className="flex items-center gap-2 md:hidden">
                      <Logo className="w-6 h-6 text-primary" />
                      <span className="text-lg font-semibold">VeraLogix</span>
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