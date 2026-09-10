import "server-only";

import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";

const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function consumePartnerRateLimit(key: string): Promise<boolean> {
  const keyHash = sha256(key);
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);

  const result = await prisma.$queryRaw<{ attempts: number }[]>`
    INSERT INTO partner_rate_limits (key_hash, attempts, window_started_at)
    VALUES (${keyHash}, 1, ${now})
    ON CONFLICT (key_hash) DO UPDATE
    SET attempts = CASE
          WHEN partner_rate_limits.window_started_at < ${windowStart} THEN 1
          ELSE partner_rate_limits.attempts + 1
        END,
        window_started_at = CASE
          WHEN partner_rate_limits.window_started_at < ${windowStart} THEN ${now}
          ELSE partner_rate_limits.window_started_at
        END
    RETURNING attempts
  `;

  return result[0].attempts <= RATE_LIMIT_MAX_ATTEMPTS;
}
