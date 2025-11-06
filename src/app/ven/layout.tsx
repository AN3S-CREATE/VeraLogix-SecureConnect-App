

import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { HardHat, LayoutDashboard, Menu, Wrench, ReceiptText, Search } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons/logo";
import Image from "next/image";

export default function VenLayout({
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
            <span className="text-lg font-semibold">VeraLogix Vendor</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard">
                <Link href="/ven/dashboard"><LayoutDashboard /><span>Dashboard</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Work Orders">
                <Link href="/ven/work-orders"><Wrench /><span>Work Orders</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Safety & Permits">
                <Link href="/ven/safety"><HardHat /><span>Safety & Permits</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Invoicing">
                <Link href="/ven/invoices"><ReceiptText /><span>Invoicing</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <header className="flex h-14 items-center justify-between p-4 bg-background border-b border-border">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden">
                    <Menu className="w-6 h-6" />
                </SidebarTrigger>
                <Link href="/ven/dashboard" className="flex items-center gap-2 md:hidden">
                    <Logo className="w-6 h-6 text-primary" />
                    <span className="text-lg font-semibold">VeraLogix Vendor</span>
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
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
          </main>
           <footer className="py-2 px-4">
            <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-muted-foreground">Powered by</span>
                <Link href="https://veralogix.com" target="_blank" rel="noopener noreferrer">
                  <Image src="https://iili.io/KeG9tjt.png" alt="VeraLogix Logo" width={80} height={16} />
                </Link>
            </div>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
