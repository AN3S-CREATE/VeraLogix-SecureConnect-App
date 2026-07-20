-- 0001_init.sql — SecureConnect core schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE role AS ENUM ('resident', 'agent', 'trustee', 'vendor', 'estate_manager', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE door_state AS ENUM ('locked', 'unlocked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE access_result AS ENUM ('granted', 'denied');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE pass_status AS ENUM ('active', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('paid', 'unpaid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE severity AS ENUM ('critical', 'high', 'medium', 'low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ev_status AS ENUM ('charging', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE deletion_status AS ENUM ('pending', 'processing', 'completed', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(200) NOT NULL,
  slug varchar(100) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS sites_slug_uidx ON sites (slug);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keycloak_sub varchar(100) NOT NULL,
  email varchar(320) NOT NULL,
  name varchar(200) NOT NULL,
  unit_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS users_keycloak_sub_uidx ON users (keycloak_sub);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_uidx ON users (email);

CREATE TABLE IF NOT EXISTS units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  label varchar(100) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS units_site_idx ON units (site_id);

CREATE TABLE IF NOT EXISTS user_site_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  site_id uuid NOT NULL REFERENCES sites(id),
  role role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS user_site_roles_uidx ON user_site_roles (user_id, site_id, role);
CREATE INDEX IF NOT EXISTS user_site_roles_site_idx ON user_site_roles (site_id);

CREATE TABLE IF NOT EXISTS consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  purpose varchar(200) NOT NULL,
  version varchar(50) NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  withdrawn_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS consents_user_idx ON consents (user_id);

CREATE TABLE IF NOT EXISTS doors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  name varchar(200) NOT NULL,
  state door_state NOT NULL DEFAULT 'locked',
  proximity_ready boolean NOT NULL DEFAULT false,
  health varchar(50) NOT NULL DEFAULT 'ok',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS doors_site_created_idx ON doors (site_id, created_at);

CREATE TABLE IF NOT EXISTS access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  door_id uuid NOT NULL REFERENCES doors(id),
  user_id uuid REFERENCES users(id),
  ts timestamptz NOT NULL DEFAULT now(),
  result access_result NOT NULL,
  name varchar(200),
  location varchar(200),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS access_logs_site_ts_idx ON access_logs (site_id, ts);
CREATE INDEX IF NOT EXISTS access_logs_door_idx ON access_logs (door_id);

CREATE TABLE IF NOT EXISTS passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  unit_id uuid NOT NULL REFERENCES units(id),
  code varchar(100) NOT NULL,
  areas jsonb NOT NULL DEFAULT '[]'::jsonb,
  start timestamptz NOT NULL,
  "end" timestamptz NOT NULL,
  status pass_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS passes_site_idx ON passes (site_id);
CREATE UNIQUE INDEX IF NOT EXISTS passes_code_uidx ON passes (code);

CREATE TABLE IF NOT EXISTS amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  name varchar(200) NOT NULL,
  rules text NOT NULL DEFAULT '',
  price_rule_id varchar(100) NOT NULL DEFAULT 'default',
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS amenities_site_idx ON amenities (site_id);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  amenity_id uuid NOT NULL REFERENCES amenities(id),
  user_id uuid NOT NULL REFERENCES users(id),
  slot_start timestamptz NOT NULL,
  slot_end timestamptz NOT NULL,
  price numeric(12,2) NOT NULL DEFAULT 0,
  status booking_status NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS bookings_site_idx ON bookings (site_id, created_at);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  user_id uuid NOT NULL REFERENCES users(id),
  amount numeric(12,2) NOT NULL,
  due timestamptz NOT NULL,
  status invoice_status NOT NULL DEFAULT 'unpaid',
  ledger jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS invoices_site_idx ON invoices (site_id, created_at);

CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  unit_id uuid NOT NULL REFERENCES units(id),
  category varchar(100) NOT NULL,
  "desc" text NOT NULL,
  media jsonb DEFAULT '[]'::jsonb,
  status varchar(50) NOT NULL DEFAULT 'open',
  sla_deadline timestamptz NOT NULL,
  timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  severity severity DEFAULT 'medium',
  assignee uuid REFERENCES users(id),
  sla integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS tickets_site_idx ON tickets (site_id, created_at);

CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  severity severity NOT NULL DEFAULT 'medium',
  status varchar(50) NOT NULL DEFAULT 'open',
  sla_deadline timestamptz NOT NULL,
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_ids jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS incidents_site_idx ON incidents (site_id, created_at);

CREATE TABLE IF NOT EXISTS energy_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  ts timestamptz NOT NULL DEFAULT now(),
  kwh numeric(14,4) NOT NULL,
  water_l numeric(14,4) NOT NULL,
  iaq_index integer NOT NULL,
  zone varchar(100) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS energy_site_ts_idx ON energy_readings (site_id, ts);

CREATE TABLE IF NOT EXISTS ev_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  bay_id varchar(100) NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id),
  kwh numeric(12,4) NOT NULL DEFAULT 0,
  cost numeric(12,2) NOT NULL DEFAULT 0,
  status ev_status NOT NULL DEFAULT 'charging',
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS ev_sessions_site_idx ON ev_sessions (site_id, created_at);

CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  owner_id uuid NOT NULL REFERENCES users(id),
  bucket varchar(100) NOT NULL,
  object_key varchar(500) NOT NULL,
  filename varchar(255) NOT NULL,
  mime varchar(150) NOT NULL,
  size_bytes bigint NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS files_site_idx ON files (site_id);
CREATE INDEX IF NOT EXISTS files_owner_idx ON files (owner_id);
CREATE UNIQUE INDEX IF NOT EXISTS files_object_key_uidx ON files (bucket, object_key);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action varchar(100) NOT NULL,
  resource_type varchar(100) NOT NULL,
  resource_id varchar(100),
  site_id uuid,
  ip varchar(64),
  correlation_id varchar(100),
  payload_hash varchar(64),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs (created_at);
CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON audit_logs (actor_id);

CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  status deletion_status NOT NULL DEFAULT 'pending',
  reason text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  notes text
);
CREATE INDEX IF NOT EXISTS deletion_requests_user_idx ON data_deletion_requests (user_id);
