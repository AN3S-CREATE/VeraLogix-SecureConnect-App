"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Download, Book, LineChart, ShieldCheck, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useCollection } from "@/backend";
import type { Energy, EVSession, Incident, Invoice, Ticket } from "@/lib/entities";
import {
  buildCmdReportPack,
  formatMoney,
  useEnergyKpis,
  useEvKpis,
  useInvoiceKpis,
  useSecurityKpis,
  useTicketKpis,
} from "@/lib/portal-kpis";

const templates = [
  { id: "quarterly", name: "Quarterly Review", description: "Comprehensive financial and security overview." },
  { id: "agm", name: "AGM Pack", description: "Full report for the Annual General Meeting." },
  { id: "esg", name: "ESG Focus", description: "Energy, sustainability, and governance report." },
];

const sectionDefs = [
  { id: "finance", name: "Finance", icon: <LineChart /> },
  { id: "security", name: "Security", icon: <ShieldCheck /> },
  { id: "esg", name: "ESG", icon: <Zap /> },
  { id: "projects", name: "Projects", icon: <Book /> },
];

export default function ReportsPage() {
  const { data: invoices, isLoading } = useCollection<Invoice & { id: string }>("invoices");
  const { data: tickets } = useCollection<Ticket & { id: string }>("tickets");
  const { data: incidents } = useCollection<Incident & { id: string }>("incidents");
  const { data: energyRows } = useCollection<Energy & { id: string }>("energy");
  const { data: sessions } = useCollection<EVSession & { id: string }>("ev-sessions");

  const finance = useInvoiceKpis(invoices);
  const ticketK = useTicketKpis(tickets);
  const security = useSecurityKpis(incidents);
  const energy = useEnergyKpis(energyRows);
  const ev = useEvKpis(sessions);

  const [selectedTemplate, setSelectedTemplate] = useState("quarterly");
  const [narrative, setNarrative] = useState("");
  const [enabledSections, setEnabledSections] = useState<Record<string, boolean>>({
    finance: true,
    security: true,
    esg: true,
    projects: true,
  });

  const template = templates.find((t) => t.id === selectedTemplate) ?? templates[0];
  const activeSections = useMemo(
    () => sectionDefs.filter((s) => enabledSections[s.id]).map((s) => s.id),
    [enabledSections],
  );

  const pack = useMemo(
    () =>
      buildCmdReportPack({
        templateId: template.id,
        templateName: template.name,
        narrative,
        sections: activeSections,
        finance: {
          paidTotal: finance.paidTotal,
          arrears: finance.arrears,
          unpaidCount: finance.unpaidCount,
          paidCount: finance.paidCount,
          aging: finance.aging,
        },
        security: {
          total: security.total,
          open: security.open,
          breached: security.breached,
          critical: security.critical,
        },
        tickets: {
          total: ticketK.total,
          open: ticketK.open,
          breached: ticketK.breached,
        },
        energy: { kwh: energy.kwh, water: energy.water, iaq: energy.iaq },
        ev: {
          charging: ev.charging,
          revenue: ev.revenue,
          kwh: ev.kwh,
          total: ev.total,
        },
      }),
    [template, narrative, activeSections, finance, security, ticketK, energy, ev],
  );

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.id}-report-pack.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && !invoices) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Report Builder</h1>
          <p className="text-sm text-muted-foreground">
            Live aggregates from invoices, tickets, incidents, energy, and EV
          </p>
        </div>
        <Button variant="outline" className="vx-focus" onClick={handleExport}>
          <Download className="mr-2" /> Export JSON pack
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card className="vx-card">
            <CardHeader>
              <CardTitle>1. Select a Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={cn(
                    "p-4 rounded-lg border-2 cursor-pointer transition-all",
                    selectedTemplate === t.id ? "border-primary" : "border-border hover:border-primary/50",
                  )}
                >
                  <div className="h-16 rounded-md bg-gradient-to-br from-primary to-secondary mb-2" />
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="vx-card">
            <CardHeader>
              <CardTitle>2. Configure Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sectionDefs.map((section) => (
                <div key={section.id} className="flex items-center justify-between p-3 border rounded-md">
                  <Label htmlFor={`section-${section.id}`} className="flex items-center gap-2 font-medium">
                    {section.icon} {section.name}
                  </Label>
                  <Switch
                    id={`section-${section.id}`}
                    checked={Boolean(enabledSections[section.id])}
                    className="vx-focus"
                    onCheckedChange={(v) =>
                      setEnabledSections((prev) => ({ ...prev, [section.id]: v }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="vx-card">
            <CardHeader>
              <CardTitle>3. Add Narrative</CardTitle>
              <CardDescription>Optional trustee / board commentary</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Type your opening statement or key takeaways here..."
                className="vx-focus min-h-[120px]"
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card className="vx-card">
            <CardHeader>
              <CardTitle>4. Live Preview — {template.name}</CardTitle>
              <CardDescription>{pack.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <PreviewStat label="Collections" value={formatMoney(finance.paidTotal)} />
                <PreviewStat label="Arrears" value={formatMoney(finance.arrears)} />
                <PreviewStat label="Open incidents" value={String(security.open)} />
                <PreviewStat label="Open tickets" value={String(ticketK.open)} />
                <PreviewStat label="Energy kWh" value={energy.kwh.toFixed(1)} />
                <PreviewStat label="Water L" value={String(Math.round(energy.water))} />
                <PreviewStat label="EV sessions" value={String(ev.total)} />
                <PreviewStat label="EV revenue" value={formatMoney(ev.revenue)} />
              </div>
              {activeSections.includes("finance") ? (
                <div className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
                  Aging — current {formatMoney(finance.aging.current)} · 30d{" "}
                  {formatMoney(finance.aging.d30)} · 60d {formatMoney(finance.aging.d60)} · 90+{" "}
                  {formatMoney(finance.aging.d90)}
                </div>
              ) : null}
              {narrative ? (
                <p className="rounded-lg bg-muted/40 p-3 text-sm text-foreground whitespace-pre-wrap">
                  {narrative}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
