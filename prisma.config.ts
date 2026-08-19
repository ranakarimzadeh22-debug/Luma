import { config } from "dotenv";
config({ path: ".env.local" });
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

// `adapter` is accepted at runtime (required by `prisma migrate dev` for driver adapters)
// but missing from @prisma/config's published PrismaMigrateConfig type in 7.9.1.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    adapter: async () => new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    seed: "tsx prisma/seed.ts",
  } as Parameters<typeof defineConfig>[0]["migrations"],
});
