-- AlterTable
ALTER TABLE "partner_connection_codes" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "consumed_at" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "partner_connections" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "ended_at" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "partner_rate_limits" ALTER COLUMN "window_started_at" SET DATA TYPE TIMESTAMPTZ;
