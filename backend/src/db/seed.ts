import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from '../config/env.js';
import { createLogger } from '../config/logger.js';
import { createDb } from './client.js';
import {
  sites,
  units,
  users,
  userSiteRoles,
  doors,
  accessLogs,
  amenities,
  passes,
  incidents,
  tickets,
  invoices,
  tenants,
  tenantSubscriptions,
  energyReadings,
  evSessions,
} from './schema.js';
import { eq } from 'drizzle-orm';

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../.env') });

async function seed() {
  const env = loadEnv();
  const log = createLogger(env);
  const { db, pool } = createDb(env);

  try {
    let [tenant] = await db.select().from(tenants).where(eq(tenants.slug, 'veralogix-demo')).limit(1);
    if (!tenant) {
      [tenant] = await db
        .insert(tenants)
        .values({
          name: 'VeraLogix Demo Tenant',
          slug: 'veralogix-demo',
          billingEmail: 'billing@veralogix.com',
          planCode: 'growth',
        })
        .returning();
      const renews = new Date();
      renews.setDate(renews.getDate() + 30);
      await db.insert(tenantSubscriptions).values({
        tenantId: tenant.id,
        planCode: 'growth',
        status: 'active',
        seats: 25,
        renewsAt: renews,
      });
      log.info({ tenantId: tenant.id }, 'Created demo tenant');
    }

    let [site] = await db.select().from(sites).where(eq(sites.slug, 'demo-estate')).limit(1);
    if (!site) {
      [site] = await db
        .insert(sites)
        .values({ name: 'Demo Estate', slug: 'demo-estate', tenantId: tenant.id })
        .returning();
      log.info({ siteId: site.id }, 'Created demo site');
    } else if (!site.tenantId) {
      [site] = await db
        .update(sites)
        .set({ tenantId: tenant.id, updatedAt: new Date() })
        .where(eq(sites.id, site.id))
        .returning();
    }

    let [unit] = await db.select().from(units).where(eq(units.siteId, site.id)).limit(1);
    if (!unit) {
      [unit] = await db
        .insert(units)
        .values({ siteId: site.id, label: 'Apt 101' })
        .returning();
    }

    let [admin] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@veralogix.com'))
      .limit(1);
    if (!admin) {
      [admin] = await db
        .insert(users)
        .values({
          keycloakSub: 'seed-admin',
          email: 'admin@veralogix.com',
          name: 'Admin User',
          unitId: unit.id,
        })
        .returning();
    }

    await db
      .insert(userSiteRoles)
      .values([
        { userId: admin.id, siteId: site.id, role: 'admin' },
        { userId: admin.id, siteId: site.id, role: 'agent' },
      ])
      .onConflictDoNothing();

    const existingDoors = await db.select().from(doors).where(eq(doors.siteId, site.id)).limit(1);
    if (!existingDoors.length) {
      const created = await db
        .insert(doors)
        .values([
          { siteId: site.id, name: 'Main Gate', state: 'locked', proximityReady: true, health: 'ok' },
          { siteId: site.id, name: 'Lobby', state: 'locked', proximityReady: true, health: 'ok' },
          { siteId: site.id, name: 'Parking', state: 'locked', proximityReady: false, health: 'warn' },
        ])
        .returning();

      await db.insert(accessLogs).values(
        created.map((d: { id: string; name: string }, i: number) => ({
          siteId: site.id,
          doorId: d.id,
          userId: admin.id,
          result: (i % 2 === 0 ? 'granted' : 'denied') as 'granted' | 'denied',
          name: admin.name,
          location: d.name,
        })),
      );
    }

    const existingAmenities = await db.select().from(amenities).where(eq(amenities.siteId, site.id)).limit(1);
    if (!existingAmenities.length) {
      await db.insert(amenities).values({
        siteId: site.id,
        name: 'Clubhouse',
        rules: 'Book 24h in advance',
        priceRuleId: 'default',
        photos: [],
      });
    }

    const existingPasses = await db.select().from(passes).where(eq(passes.siteId, site.id)).limit(1);
    if (!existingPasses.length) {
      const start = new Date();
      const end = new Date(Date.now() + 7 * 24 * 3600 * 1000);
      await db.insert(passes).values({
        siteId: site.id,
        unitId: unit.id,
        code: 'PASS-DEMO-001',
        areas: ['lobby', 'parking'],
        start,
        end,
        status: 'active',
      });
    }

    const existingIncidents = await db.select().from(incidents).where(eq(incidents.siteId, site.id)).limit(1);
    if (!existingIncidents.length) {
      const sla = new Date(Date.now() + 4 * 60 * 60 * 1000);
      await db.insert(incidents).values([
        {
          siteId: site.id,
          severity: 'high',
          status: 'open',
          slaDeadline: sla,
          evidence: ['Unauthorised access attempt on main entrance.'],
        },
        {
          siteId: site.id,
          severity: 'critical',
          status: 'assigned',
          slaDeadline: sla,
          evidence: [
            'Perimeter fence breach detected near Sector 4.',
            'assignee:John Doe',
          ],
        },
        {
          siteId: site.id,
          severity: 'medium',
          status: 'open',
          slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
          evidence: ['CCTV camera offline in parking garage P2.'],
        },
      ]);
    }

    const existingTickets = await db.select().from(tickets).where(eq(tickets.siteId, site.id)).limit(1);
    if (!existingTickets.length) {
      const sla = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await db.insert(tickets).values([
        {
          siteId: site.id,
          unitId: unit.id,
          category: "plumbing",
          description: "Leaky Faucet in kitchen",
          status: "open",
          severity: "low",
          slaDeadline: sla,
          timeline: ["Seeded open ticket"],
        },
        {
          siteId: site.id,
          unitId: unit.id,
          category: "hvac",
          description: "AC Not Cooling",
          status: "open",
          severity: "high",
          slaDeadline: sla,
          timeline: ["Seeded open ticket"],
        },
      ]);
    }

    const existingInvoices = await db.select().from(invoices).where(eq(invoices.siteId, site.id)).limit(1);
    if (!existingInvoices.length) {
      await db.insert(invoices).values({
        siteId: site.id,
        userId: admin.id,
        amount: "850.50",
        due: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "unpaid",
        ledger: ["ElectriX", "WO-003"],
      });
    }

    const existingEnergy = await db.select().from(energyReadings).where(eq(energyReadings.siteId, site.id)).limit(1);
    if (!existingEnergy.length) {
      const now = Date.now();
      await db.insert(energyReadings).values([
        {
          siteId: site.id,
          ts: new Date(now - 3 * 3600_000),
          kwh: "42.5",
          waterL: "120.0",
          iaqIndex: 82,
          zone: "Lobby",
        },
        {
          siteId: site.id,
          ts: new Date(now - 2 * 3600_000),
          kwh: "55.1",
          waterL: "98.2",
          iaqIndex: 76,
          zone: "Tower A",
        },
        {
          siteId: site.id,
          ts: new Date(now - 1 * 3600_000),
          kwh: "61.0",
          waterL: "140.5",
          iaqIndex: 71,
          zone: "Parking",
        },
        {
          siteId: site.id,
          ts: new Date(now),
          kwh: "48.2",
          waterL: "110.0",
          iaqIndex: 88,
          zone: "Clubhouse",
        },
      ]);
    }

    const existingEv = await db.select().from(evSessions).where(eq(evSessions.siteId, site.id)).limit(1);
    if (!existingEv.length) {
      await db.insert(evSessions).values([
        {
          siteId: site.id,
          bayId: "Bay-1",
          userId: admin.id,
          kwh: "12.5",
          cost: "4.38",
          status: "charging",
        },
        {
          siteId: site.id,
          bayId: "Bay-2",
          userId: admin.id,
          kwh: "28.1",
          cost: "9.80",
          status: "completed",
          endedAt: new Date(),
        },
      ]);
    }

    log.info('Seed complete');
  } finally {
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
