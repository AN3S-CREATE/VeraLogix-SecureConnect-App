
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { HardHat, LayoutDashboard, Menu, Wrench, ReceiptText, Search } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons/logo";
import { Button } from "@/components/ui/button";

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
        <header className="flex items-center justify-between p-4 bg-background border-b border-border">
            <Link href="/ven/dashboard" className="flex items-center gap-2 md:hidden">
                <Logo className="w-6 h-6 text-primary" />
                <span className="text-lg font-semibold">VeraLogix Vendor</span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Button variant="outline" size="icon" className="h-8 w-8"><Search className="h-4 w-4"/></Button>
              <p className="text-sm text-muted-foreground">Top bar placeholder</p>
            </div>
            <SidebarTrigger className="md:hidden">
                <Menu className="w-6 h-6" />
            </SidebarTrigger>
            <div className="hidden md:flex items-center gap-4">
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
