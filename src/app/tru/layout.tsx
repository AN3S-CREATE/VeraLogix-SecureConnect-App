
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ShieldCheck, Building, Menu, LineChart, DollarSign, Zap, ClipboardList, BookUser, ClipboardCheck, Search, Database } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons/logo";
import { Button } from "@/components/ui/button";

export default function TruLayout({
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
            <span className="text-lg font-semibold">VeraLogix Trust</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Portfolio">
                <Link href="/tru/overview"><Building /><span>Portfolio</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Security Posture">
                <Link href="/tru/security"><ShieldCheck /><span>Security Posture</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Financials">
                <Link href="/tru/financials"><LineChart /><span>Financials</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Collections">
                <Link href="/tru/collections"><ClipboardList /><span>Collections</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Pricing">
                <Link href="/tru/pricing"><DollarSign /><span>Pricing</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Energy">
                <Link href="/tru/energy"><Zap /><span>Energy</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Pack Builder">
                <Link href="/tru/pack-builder"><BookUser /><span>Pack Builder</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Resolutions">
                <Link href="/tru/resolutions"><ClipboardCheck /><span>Resolutions</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Audit Log">
                <Link href="/tru/audit"><Database /><span>Audit Log</span></Link>
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
              <Link href="/tru/overview" className="flex items-center gap-2 md:hidden">
                  <Logo className="w-6 h-6 text-primary" />
                  <span className="text-lg font-semibold">VeraLogix Trust</span>
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
