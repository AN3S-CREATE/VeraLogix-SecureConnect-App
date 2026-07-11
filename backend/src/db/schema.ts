import {
  boolean,
  bigint,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', [
  'resident',
  'agent',
  'trustee',
  'vendor',
  'estate_manager',
  'admin',
]);

export const doorStateEnum = pgEnum('door_state', ['locked', 'unlocked']);
export const accessResultEnum = pgEnum('access_result', ['granted', 'denied']);
export const passStatusEnum = pgEnum('pass_status', ['active', 'expired']);
export const bookingStatusEnum = pgEnum('booking_status', ['confirmed', 'cancelled']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['paid', 'unpaid']);
export const severityEnum = pgEnum('severity', ['critical', 'high', 'medium', 'low']);
export const evStatusEnum = pgEnum('ev_status', ['charging', 'completed']);
export const deletionStatusEnum = pgEnum('deletion_status', [
  'pending',
  'processing',
  'completed',
  'rejected',
]);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
};

export const sites = pgTable('sites', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  ...timestamps,
}, (t) => [
  uniqueIndex('sites_slug_uidx').on(t.slug),
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  keycloakSub: varchar('keycloak_sub', { length: 100 }).notNull(),
  email: varchar('email', { length: 320 }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  unitId: uuid('unit_id'),
  ...timestamps,
}, (t) => [
  uniqueIndex('users_keycloak_sub_uidx').on(t.keycloakSub),
  uniqueIndex('users_email_uidx').on(t.email),
]);

export const units = pgTable('units', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  label: varchar('label', { length: 100 }).notNull(),
  ...timestamps,
}, (t) => [
  index('units_site_idx').on(t.siteId),
]);

export const userSiteRoles = pgTable('user_site_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  role: roleEnum('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('user_site_roles_uidx').on(t.userId, t.siteId, t.role),
  index('user_site_roles_site_idx').on(t.siteId),
]);

export const consents = pgTable('consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  purpose: varchar('purpose', { length: 200 }).notNull(),
  version: varchar('version', { length: 50 }).notNull(),
  grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
  withdrawnAt: timestamp('withdrawn_at', { withTimezone: true }),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
}, (t) => [
  index('consents_user_idx').on(t.userId),
]);

export const doors = pgTable('doors', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  name: varchar('name', { length: 200 }).notNull(),
  state: doorStateEnum('state').notNull().default('locked'),
  proximityReady: boolean('proximity_ready').notNull().default(false),
  health: varchar('health', { length: 50 }).notNull().default('ok'),
  ...timestamps,
}, (t) => [
  index('doors_site_created_idx').on(t.siteId, t.createdAt),
]);

export const accessLogs = pgTable('access_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  doorId: uuid('door_id').notNull().references(() => doors.id),
  userId: uuid('user_id').references(() => users.id),
  ts: timestamp('ts', { withTimezone: true }).notNull().defaultNow(),
  result: accessResultEnum('result').notNull(),
  name: varchar('name', { length: 200 }),
  location: varchar('location', { length: 200 }),
  ...timestamps,
}, (t) => [
  index('access_logs_site_ts_idx').on(t.siteId, t.ts),
  index('access_logs_door_idx').on(t.doorId),
]);

export const passes = pgTable('passes', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  unitId: uuid('unit_id').notNull().references(() => units.id),
  code: varchar('code', { length: 100 }).notNull(),
  areas: jsonb('areas').$type<string[]>().notNull().default([]),
  start: timestamp('start', { withTimezone: true }).notNull(),
  end: timestamp('end', { withTimezone: true }).notNull(),
  status: passStatusEnum('status').notNull().default('active'),
  ...timestamps,
}, (t) => [
  index('passes_site_idx').on(t.siteId),
  uniqueIndex('passes_code_uidx').on(t.code),
]);

export const amenities = pgTable('amenities', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  name: varchar('name', { length: 200 }).notNull(),
  rules: text('rules').notNull().default(''),
  priceRuleId: varchar('price_rule_id', { length: 100 }).notNull().default('default'),
  photos: jsonb('photos').$type<string[]>().notNull().default([]),
  ...timestamps,
}, (t) => [
  index('amenities_site_idx').on(t.siteId),
]);

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  amenityId: uuid('amenity_id').notNull().references(() => amenities.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  slotStart: timestamp('slot_start', { withTimezone: true }).notNull(),
  slotEnd: timestamp('slot_end', { withTimezone: true }).notNull(),
  price: numeric('price', { precision: 12, scale: 2 }).notNull().default('0'),
  status: bookingStatusEnum('status').notNull().default('confirmed'),
  ...timestamps,
}, (t) => [
  index('bookings_site_idx').on(t.siteId, t.createdAt),
]);

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  due: timestamp('due', { withTimezone: true }).notNull(),
  status: invoiceStatusEnum('status').notNull().default('unpaid'),
  ledger: jsonb('ledger').$type<string[]>().notNull().default([]),
  ...timestamps,
}, (t) => [
  index('invoices_site_idx').on(t.siteId, t.createdAt),
]);

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  unitId: uuid('unit_id').notNull().references(() => units.id),
  category: varchar('category', { length: 100 }).notNull(),
  description: text('desc').notNull(),
  media: jsonb('media').$type<string[]>().default([]),
  status: varchar('status', { length: 50 }).notNull().default('open'),
  slaDeadline: timestamp('sla_deadline', { withTimezone: true }).notNull(),
  timeline: jsonb('timeline').$type<string[]>().notNull().default([]),
  severity: severityEnum('severity').default('medium'),
  assignee: uuid('assignee').references(() => users.id),
  sla: integer('sla'),
  ...timestamps,
}, (t) => [
  index('tickets_site_idx').on(t.siteId, t.createdAt),
]);

export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  severity: severityEnum('severity').notNull().default('medium'),
  status: varchar('status', { length: 50 }).notNull().default('open'),
  slaDeadline: timestamp('sla_deadline', { withTimezone: true }).notNull(),
  evidence: jsonb('evidence').$type<string[]>().notNull().default([]),
  relatedIds: jsonb('related_ids').$type<string[]>().default([]),
  ...timestamps,
}, (t) => [
  index('incidents_site_idx').on(t.siteId, t.createdAt),
]);

export const energyReadings = pgTable('energy_readings', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  ts: timestamp('ts', { withTimezone: true }).notNull().defaultNow(),
  kwh: numeric('kwh', { precision: 14, scale: 4 }).notNull(),
  waterL: numeric('water_l', { precision: 14, scale: 4 }).notNull(),
  iaqIndex: integer('iaq_index').notNull(),
  zone: varchar('zone', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('energy_site_ts_idx').on(t.siteId, t.ts),
]);

export const evSessions = pgTable('ev_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  bayId: varchar('bay_id', { length: 100 }).notNull(),
  userId: uuid('user_id').notNull().references(() => users.id),
  kwh: numeric('kwh', { precision: 12, scale: 4 }).notNull().default('0'),
  cost: numeric('cost', { precision: 12, scale: 2 }).notNull().default('0'),
  status: evStatusEnum('status').notNull().default('charging'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  ...timestamps,
}, (t) => [
  index('ev_sessions_site_idx').on(t.siteId, t.createdAt),
]);

export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  bucket: varchar('bucket', { length: 100 }).notNull(),
  objectKey: varchar('object_key', { length: 500 }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  mime: varchar('mime', { length: 150 }).notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  ...timestamps,
}, (t) => [
  index('files_site_idx').on(t.siteId),
  index('files_owner_idx').on(t.ownerId),
  uniqueIndex('files_object_key_uidx').on(t.bucket, t.objectKey),
]);

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id'),
  action: varchar('action', { length: 100 }).notNull(),
  resourceType: varchar('resource_type', { length: 100 }).notNull(),
  resourceId: varchar('resource_id', { length: 100 }),
  siteId: uuid('site_id'),
  ip: varchar('ip', { length: 64 }),
  correlationId: varchar('correlation_id', { length: 100 }),
  payloadHash: varchar('payload_hash', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('audit_logs_created_idx').on(t.createdAt),
  index('audit_logs_actor_idx').on(t.actorId),
]);

export const dataDeletionRequests = pgTable('data_deletion_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  status: deletionStatusEnum('status').notNull().default('pending'),
  reason: text('reason'),
  requestedAt: timestamp('requested_at', { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  notes: text('notes'),
}, (t) => [
  index('deletion_requests_user_idx').on(t.userId),
]);

/** SQL for realtime NOTIFY triggers (applied in migrate). */
export const REALTIME_NOTIFY_SQL = `
CREATE OR REPLACE FUNCTION notify_table_change() RETURNS trigger AS $$
DECLARE
  payload json;
  sid uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    sid := OLD.site_id;
    payload := json_build_object('op', TG_OP, 'table', TG_TABLE_NAME, 'id', OLD.id, 'siteId', sid);
  ELSE
    sid := NEW.site_id;
    payload := json_build_object('op', TG_OP, 'table', TG_TABLE_NAME, 'id', NEW.id, 'siteId', sid, 'row', row_to_json(NEW));
  END IF;
  PERFORM pg_notify('secureconnect_changes', payload::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'doors_notify') THEN
    CREATE TRIGGER doors_notify AFTER INSERT OR UPDATE OR DELETE ON doors
      FOR EACH ROW EXECUTE FUNCTION notify_table_change();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'access_logs_notify') THEN
    CREATE TRIGGER access_logs_notify AFTER INSERT OR UPDATE OR DELETE ON access_logs
      FOR EACH ROW EXECUTE FUNCTION notify_table_change();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tickets_notify') THEN
    CREATE TRIGGER tickets_notify AFTER INSERT OR UPDATE OR DELETE ON tickets
      FOR EACH ROW EXECUTE FUNCTION notify_table_change();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'incidents_notify') THEN
    CREATE TRIGGER incidents_notify AFTER INSERT OR UPDATE OR DELETE ON incidents
      FOR EACH ROW EXECUTE FUNCTION notify_table_change();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'bookings_notify') THEN
    CREATE TRIGGER bookings_notify AFTER INSERT OR UPDATE OR DELETE ON bookings
      FOR EACH ROW EXECUTE FUNCTION notify_table_change();
  END IF;
END $$;
`;

export type Site = typeof sites.$inferSelect;
export type User = typeof users.$inferSelect;
export type Door = typeof doors.$inferSelect;
export type AccessLog = typeof accessLogs.$inferSelect;
