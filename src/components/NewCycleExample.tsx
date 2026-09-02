const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function monthDetails(now: Date) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = (new Date(year, month, 1).getDay() + 6) % 7;
  const monthName = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(now);
  return { daysInMonth, leadingDays, monthName };
}

function examplePhase(day: number): "P" | "E" | "M" | null {
  if (day >= 3 && day <= 6) return "P";
  if (day === 14 || day === 15) return "E";
  if (day >= 23 && day <= 26) return "M";
  return null;
}

const phaseStyles = {
  P: "bg-rose-100 text-rose-800",
  E: "bg-amber-100 text-amber-900",
  M: "bg-violet-100 text-violet-800",
};

export default function NewCycleExample() {
  const now = new Date();
  const today = now.getDate();
  const { daysInMonth, leadingDays, monthName } = monthDetails(now);
  const cells = Array.from({ length: leadingDays + daysInMonth }, (_, index) =>
    index < leadingDays ? null : index - leadingDays + 1,
  );

  return (
    <div className="space-y-7">
      <section aria-labelledby="cycle-example-title" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="cycle-example-title" className="text-lg font-semibold text-neutral-950">
            Zyklusübersicht
          </h2>
          <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold text-neutral-700">
            Nur Beispiel
          </span>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-72 rounded-full bg-[conic-gradient(#fecdd3_0deg_82deg,#f5f5f5_82deg_142deg,#fde68a_142deg_190deg,#f5f5f5_190deg_245deg,#ddd6fe_245deg_318deg,#f5f5f5_318deg_360deg)] p-5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
          <div className="relative grid h-full place-items-center rounded-full bg-white shadow-sm">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Beispielansicht</p>
              <p className="mt-1 text-2xl font-semibold text-neutral-950">Ein Zyklus</p>
            </div>
            <span className="absolute left-1/2 top-1 -translate-x-1/2 rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-800">P · Periode</span>
            <span className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">E · Eisprung</span>
            <span className="absolute bottom-5 left-2 rounded-full bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-800">M · PMS</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="example-calendar-title" className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="example-calendar-title" className="text-lg font-semibold text-neutral-950">Kalender</h2>
          <p className="capitalize text-sm text-neutral-500">{monthName}</p>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekdayLabels.map((label) => <div key={label} className="py-1 text-xs font-medium text-neutral-400">{label}</div>)}
          {cells.map((day, index) => {
            const phase = day ? examplePhase(day) : null;
            const isToday = day === today;
            return (
              <div key={`${day ?? "empty"}-${index}`} className="relative min-h-11">
                {day && (
                  <div className={`relative flex h-10 items-center justify-center rounded-lg text-sm ${isToday ? "ring-2 ring-neutral-900 ring-offset-1" : ""} ${phase ? phaseStyles[phase] : "text-neutral-700"}`}>
                    <span>{day}</span>
                    {phase && <span className="absolute right-1 top-0.5 text-[9px] font-bold" aria-label={phase === "P" ? "Periode" : phase === "E" ? "Eisprung" : "PMS"}>{phase}</span>}
                    {isToday && <span className="absolute -bottom-3 text-[9px] font-bold text-neutral-950">Heute</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-neutral-700" aria-label="Legende">
          <span><strong className="text-rose-700">P</strong> Periode</span>
          <span><strong className="text-amber-700">E</strong> Eisprung</span>
          <span><strong className="text-violet-700">M</strong> PMS</span>
          <span><strong className="rounded border border-neutral-900 px-1 text-neutral-900">Heute</strong></span>
        </div>
      </section>
    </div>
  );
}
