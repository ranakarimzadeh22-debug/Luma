-- CreateTable
CREATE TABLE "partner_connection_codes" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),

    CONSTRAINT "partner_connection_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_connections" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "partner_user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "partner_connections_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "partner_connections_status_check" CHECK ("status" IN ('active', 'ended')),
    CONSTRAINT "partner_connections_distinct_accounts" CHECK ("owner_user_id" <> "partner_user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partner_connection_codes_code_hash_key" ON "partner_connection_codes"("code_hash");

-- CreateIndex
CREATE INDEX "partner_connection_codes_owner_user_id_idx" ON "partner_connection_codes"("owner_user_id");

-- CreateIndex: höchstens eine aktive Verbindung pro Owner-Konto
CREATE UNIQUE INDEX "partner_connections_owner_active_idx" ON "partner_connections"("owner_user_id") WHERE "status" = 'active';

-- CreateIndex
CREATE INDEX "partner_connections_partner_user_id_idx" ON "partner_connections"("partner_user_id") WHERE "status" = 'active';

-- AddForeignKey
ALTER TABLE "partner_connection_codes" ADD CONSTRAINT "partner_connection_codes_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_connections" ADD CONSTRAINT "partner_connections_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_connections" ADD CONSTRAINT "partner_connections_partner_user_id_fkey" FOREIGN KEY ("partner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
