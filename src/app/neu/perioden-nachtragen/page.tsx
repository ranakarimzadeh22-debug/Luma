import { redirect } from "next/navigation";
import { getNewAuthSession } from "@/lib/new-auth";
import NewPeriodHistoryOnboarding from "@/components/NewPeriodHistoryOnboarding";

export const dynamic = "force-dynamic";

export default async function PeriodenNachtragenPage() {
  const session = await getNewAuthSession();
  if (!session) redirect("/neu/anmelden");
  if (!session.firstName) redirect("/neu");

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-6 py-10">
      <NewPeriodHistoryOnboarding />
    </main>
  );
}
