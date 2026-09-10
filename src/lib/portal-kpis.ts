'use client';

import { useMemo } from 'react';
import type { Invoice, Incident, Ticket, Energy, EVSession } from '@/lib/entities';

function num(v: number | string | undefined) {
  if (v === undefined || v === null) return 0;
  return typeof v === 'number' ? v : Number(v) || 0;
}

export function useInvoiceKpis(invoices: Invoice[] | null | undefined) {
  return useMemo(() => {
    const rows = invoices ?? [];
    const paid = rows.filter((i) => i.status === 'paid');
    const unpaid = rows.filter((i) => i.status === 'unpaid');
    const paidTotal = paid.reduce((s, i) => s + num(i.amount), 0);
    const arrears = unpaid.reduce((s, i) => s + num(i.amount), 0);
    const now = Date.now();
    const aging = {
      current: 0,
      d30: 0,
      d60: 0,
      d90: 0,
    };
    for (const inv of unpaid) {
      const due = new Date(inv.due).getTime();
      const days = Math.floor((now - due) / 86_400_000);
      const amt = num(inv.amount);
      if (days < 30) aging.current += amt;
      else if (days < 60) aging.d30 += amt;
      else if (days < 90) aging.d60 += amt;
      else aging.d90 += amt;
    }
    return {
      paidTotal,
      arrears,
      unpaidCount: unpaid.length,
      paidCount: paid.length,
      aging,
      cashflow: buildCashflowFromInvoices(rows),
    };
  }, [invoices]);
}

function buildCashflowFromInvoices(rows: Invoice[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const bucket = new Map<string, { income: number; expenses: number }>();
  for (const inv of rows) {
    const d = new Date(inv.due);
    const key = months[d.getMonth()] ?? 'Jan';
    const cur = bucket.get(key) ?? { income: 0, expenses: 0 };
    if (inv.status === 'paid') cur.income += num(inv.amount);
    else cur.expenses += num(inv.amount) * 0.35; // proxy opex against open invoices
    bucket.set(key, cur);
  }
  const order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return order.map((month) => ({
    month,
    income: Math.round(bucket.get(month)?.income ?? 0),
    expenses: Math.round(bucket.get(month)?.expenses ?? 0),
  }));
}

export function useSecurityKpis(incidents: Incident[] | null | undefined) {
  return useMemo(() => {
    const rows = incidents ?? [];
    const open = rows.filter((i) => !['closed', 'resolved'].includes(i.status));
    const breached = rows.filter((i) => i.status === 'sla_breached').length;
    const critical = rows.filter((i) => i.severity === 'critical' || i.severity === 'high').length;
    const byMonth = new Map<string, number>();
    for (const i of rows) {
      const month = new Date(i.slaDeadline).toLocaleString('en', { month: 'long' });
      byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
    }
    const trend = [...byMonth.entries()].slice(0, 6).map(([month, count]) => ({
      month,
      incidents: count,
    }));
    return {
      total: rows.length,
      open: open.length,
      breached,
      critical,
      trend: trend.length
        ? trend
        : [
            { month: 'January', incidents: 0 },
            { month: 'February', incidents: 0 },
            { month: 'March', incidents: 0 },
          ],
    };
  }, [incidents]);
}

export function useTicketKpis(tickets: Ticket[] | null | undefined) {
  return useMemo(() => {
    const rows = tickets ?? [];
    const open = rows.filter((t) => !['closed', 'resolved'].includes(t.status));
    const breached = rows.filter((t) => t.status === 'sla_breached').length;
    const byCategory = new Map<string, number>();
    for (const t of rows) {
      byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + 1);
    }
    return {
      total: rows.length,
      open: open.length,
      breached,
      categories: [...byCategory.entries()].map(([category, count]) => ({ category, count })),
    };
  }, [tickets]);
}

export function useEnergyKpis(readings: Energy[] | null | undefined) {
  return useMemo(() => {
    const rows = readings ?? [];
    const kwh = rows.reduce((s, r) => s + num(r.kwh), 0);
    const water = rows.reduce((s, r) => s + num(r.waterL), 0);
    const iaq =
      rows.length === 0 ? 0 : Math.round(rows.reduce((s, r) => s + r.iaqIndex, 0) / rows.length);
    return { kwh, water, iaq, count: rows.length };
  }, [readings]);
}

export function useEvKpis(sessions: EVSession[] | null | undefined) {
  return useMemo(() => {
    const rows = sessions ?? [];
    const charging = rows.filter((s) => s.status === 'charging').length;
    const revenue = rows.reduce((s, r) => s + num(r.cost), 0);
    const kwh = rows.reduce((s, r) => s + num(r.kwh), 0);
    return { charging, revenue, kwh, total: rows.length };
  }, [sessions]);
}

export function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n).toLocaleString('en-US')}`;
  return `$${n.toFixed(2)}`;
}

export type ReportPackInput = {
  templateId: string;
  templateName: string;
  narrative: string;
  sections: string[];
  finance: {
    paidTotal: number;
    arrears: number;
    unpaidCount: number;
    paidCount: number;
    aging: { current: number; d30: number; d60: number; d90: number };
  };
  security: { total: number; open: number; breached: number; critical: number };
  tickets: { total: number; open: number; breached: number };
  energy: { kwh: number; water: number; iaq: number };
  ev: { charging: number; revenue: number; kwh: number; total: number };
};

/** Pure pack builder used by cmd/reports export + Phase 5 contract tests. */
export function buildCmdReportPack(input: ReportPackInput) {
  return {
    id: `pack-${input.templateId}`,
    title: input.templateName,
    narrative: input.narrative,
    sections: input.sections,
    generatedAt: new Date().toISOString(),
    metrics: {
      finance: input.finance,
      security: input.security,
      tickets: input.tickets,
      energy: input.energy,
      ev: input.ev,
    },
    summary: [
      `Collections ${formatMoney(input.finance.paidTotal)}; arrears ${formatMoney(input.finance.arrears)}.`,
      `${input.security.open} open incidents (${input.security.critical} critical/high).`,
      `${input.tickets.open} open tickets; energy ${input.energy.kwh.toFixed(1)} kWh; EV revenue ${formatMoney(input.ev.revenue)}.`,
    ].join(' '),
  };
}
