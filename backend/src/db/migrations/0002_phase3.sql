-- Phase 3: evidence locker hardening + multi-tenant SaaS foundation

DO $$ BEGIN
  CREATE TYPE scan_status AS ENUM ('pending', 'clean', 'quarantined', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(200) NOT NULL,
  slug varchar(100) NOT NULL,
  billing_email varchar(320),
  plan_code varchar(50) NOT NULL DEFAULT 'starter',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS tenants_slug_uidx ON tenants (slug);

CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  plan_code varchar(50) NOT NULL,
  status subscription_status NOT NULL DEFAULT 'trialing',
  seats integer NOT NULL DEFAULT 5,
  renews_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tenant_subscriptions_tenant_idx ON tenant_subscriptions (tenant_id);

ALTER TABLE sites ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS sites_tenant_idx ON sites (tenant_id);

ALTER TABLE files ADD COLUMN IF NOT EXISTS sha256 varchar(64);
ALTER TABLE files ADD COLUMN IF NOT EXISTS scan_status scan_status NOT NULL DEFAULT 'pending';
ALTER TABLE files ADD COLUMN IF NOT EXISTS scanned_at timestamptz;
ALTER TABLE files ADD COLUMN IF NOT EXISTS scan_notes text;
