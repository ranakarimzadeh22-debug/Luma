import Link from "next/link";
import { redirect } from "next/navigation";
import { getNewAuthSession } from "@/lib/new-auth";
import NewLogoutButton from "@/components/NewLogoutButton";
import NewFirstNameForm from "@/components/NewFirstNameForm";
import NewCycleExample from "@/components/NewCycleExample";
import NewPeriodHistoryOnboarding from "@/components/NewPeriodHistoryOnboarding";
import NewOwnerMobileNav from "@/components/NewOwnerMobileNav";
import { getNewPeriodEntries } from "@/lib/new-periods";
import { getNewCycleProfile } from "@/lib/new-cycle-profile";
import { predictCycle } from "@/lib/new-cycle-prediction";
import { computePersonalCycleView } from "@/lib/personal-cycle-view";
import { getNewPeriodPlans } from "@/lib/new-period-plans";
import { getPmsSymptomDays } from "@/lib/new-pms-symptoms";
import { todayBerlinDateOnly } from "@/lib/berlin-date";

export const dynamic = "force-dynamic";

export default async function NewAppPage() {
  const session = await getNewAuthSession();

  if (!session) {
    redirect("/neu/rolle");
  }

  if (!session.firstName) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-50 px-6">
        <section className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-500">Nur noch ein Schritt</p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
              Wie dürfen wir dich nennen?
            </h1>
            <p className="text-sm leading-6 text-neutral-600">
              Ergänze deinen Vornamen einmalig für deine persönliche Begrüßung.
            </p>
          </div>
          <NewFirstNameForm />
          <NewLogoutButton />
        </section>
      </main>
    );
  }

  const [periodEntries, periodPlans, profile, pmsSymptomDays] = await Promise.all([
    getNewPeriodEntries(session.userId),
    getNewPeriodPlans(session.userId),
    getNewCycleProfile(session.userId),
    getPmsSymptomDays(session.userId),
  ]);

  if (periodEntries.length === 0 && !session.periodHistoryOnboardingSkipped) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-50 px-6 py-10">
        <NewPeriodHistoryOnboarding />
      </main>
    );
  }

  const today = todayBerlinDateOnly();
  const prediction = predictCycle(periodEntries, profile, today);
  const personalCycleView = computePersonalCycleView(periodEntries, profile, today);

  return (
    <>
    <main className="min-h-[100dvh] overflow-x-hidden bg-[radial-gradient(circle_at_8%_4%,rgba(255,224,229,0.78),transparent_32%),radial-gradient(circle_at_94%_30%,rgba(242,222,239,0.62),transparent_30%),linear-gradient(180deg,#fffaf6_0%,#fff4f2_48%,#fff9f7_100%)] px-4 pb-[max(5rem,calc(3.5rem+env(safe-area-inset-bottom)))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-7 sm:pb-[max(2rem,env(safe-area-inset-bottom))] sm:pt-[max(2rem,env(safe-area-inset-top))]">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
        <div className="hidden justify-end sm:flex">
          <Link href="/neu/einstellungen" className="text-sm text-neutral-500 hover:text-neutral-900">
            Einstellungen
          </Link>
        </div>
        <NewCycleExample
          initialPeriods={periodEntries}
          initialPeriodPlans={periodPlans}
          prediction={prediction}
          personalCycleView={personalCycleView}
          cycleProfile={profile}
          initialPmsSymptomDays={pmsSymptomDays}
        />
      </section>
    </main>
    <NewOwnerMobileNav />
    </>
  );
}
