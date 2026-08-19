import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Erstellt einen Supabase-Client für den Browser.
 * Diese Funktion darf nur auf der Client-Seite verwendet werden.
 * Server-Komponenten sollten den Server-Client aus @supabase/ssr verwenden.
 */
export function createClient(): SupabaseClient {
  // Browser: einmal erstellten Client wiederverwenden
  if (typeof window !== "undefined" && client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase env vars not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  // Browser: Client erstellen und cachen
  if (typeof window !== "undefined") {
    client = createBrowserClient(url, anonKey);
    return client;
  }

  // SSR / Build: Dummy-Client mit klaren Fehlermeldungen
  // Wird nur während Next.js SSR oder Build verwendet.
  // Alle Datenbank-Funktionen müssen dies behandeln.
  console.warn(
    "[supabase] createClient() called during SSR – " +
    "returning proxy that will show clear warnings for any DB operation. " +
    "Ensure DB calls are wrapped in guard clauses (e.g. if (typeof window === 'undefined') return [])."
  );
  return new Proxy({} as SupabaseClient, {
    get(target, prop) {
      if (prop === "then") return undefined; // not a Promise
      return (...args: unknown[]) => {
        console.warn(`[supabase] Called "${String(prop)}" during SSR – no real DB access available.`);
        return Promise.reject(new Error(`Supabase operation "${String(prop)}" called during SSR`));
      };
    },
  });
}