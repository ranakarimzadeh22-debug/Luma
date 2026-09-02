import { redirect } from "next/navigation";
import { getNewAuthSession } from "@/lib/new-auth";
import { getNewCycleProfile } from "@/lib/new-cycle-profile";
import NewCycleProfileWizard from "@/components/NewCycleProfileWizard";

export const dynamic = "force-dynamic";

export default async function NewCycleProfilePage() {
  const session = await getNewAuthSession();
  if (!session) redirect("/neu/anmelden");
  if (!session.firstName) redirect("/neu");

  const profile = await getNewCycleProfile(session.userId);

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-6 py-10">
      <NewCycleProfileWizard initialProfile={profile ? {
        lastPeriodStart: profile.lastPeriodStart,
        bleedingDurationDays: profile.bleedingDurationDays,
        cycleLengthDays: profile.cycleLengthDays,
        regularity: profile.regularity,
      } : null} />
    </main>
  );
}
