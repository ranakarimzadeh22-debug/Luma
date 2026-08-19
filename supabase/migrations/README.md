# Historical migrations

These SQL files were written for Supabase and are kept only as a historical record of the schema's evolution. The app no longer uses Supabase — it connects directly to PostgreSQL via Prisma.

The current schema lives in `prisma/schema.prisma`, and its migrations are in `prisma/migrations/`. Do not run these files against the database; they predate the RLS-less, Prisma-managed schema and reference `auth.users`, which no longer exists.
