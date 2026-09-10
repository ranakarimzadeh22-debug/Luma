-- CreateTable
CREATE TABLE "partner_rate_limits" (
    "key_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL,
    "window_started_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_rate_limits_pkey" PRIMARY KEY ("key_hash")
);
