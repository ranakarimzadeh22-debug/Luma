---
id: WP-20260906-1400-claude-persoenlicher-zyklus-kreis
date: 2026-09-06
time: 14:00
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-002
commits: pending
---

# Persönlicher Zyklus-Kreis aus echten Daten

## Was wurde gemacht?

Der Kreis oben auf `/neu` zeigt jetzt den heutigen persönlichen Zyklusstand statt einer reinen Illustration. Ohne Daten bleibt er neutral mit dem Hinweis „Noch nicht genügend Daten für deine persönliche Zyklusansicht“. Mit einer freiwillig eingetragenen ungefähren Zykluslänge zeigt er eine erste Orientierung, klar markiert mit „Kann abweichen“. Erst ab vier echten eingetragenen Perioden berechnet Luma einen persönlichen Median aus den echten Abständen und zeigt `Zyklus: X Tage`. Der Kreis nennt nie mehr die nächste Periode. Der Startweg nach der letzten Periode bietet jetzt freiwillig an, bis zu drei frühere Perioden zu ergänzen und eine ungefähre Zykluslänge einzutragen.

## Warum?

Owner-Auftrag WP-002: Der Kreis wirkte wie eine Grafik und zeigte nicht verlässlich den echten persönlichen Zyklusstand; er sollte auch keine unsichere Sicherheit vortäuschen.

## Prüfung und Stand

`npm run build` (Next.js 16, Turbopack) erfolgreich, TypeScript-Prüfung ohne Fehler, alle 28 Routen erzeugt. Eigenständige Berechnungsprobe bestätigt: mit drei echten Perioden bleibt der persönliche Median unberechnet, ab vier echten Perioden wird er korrekt gebildet. Kein Testframework im Projekt vorhanden, daher keine automatisierten Unit-Tests ergänzt. Mobile Sichtprüfung im echten Browser wurde nicht durchgeführt.

## Offene Punkte

- Owner-Prüfschritt (neutraler Kreis ohne Daten, danach freiwillige Zykluslänge mit „Kann abweichen“) steht aus.

## Nächster Schritt

Auf `/neu` ohne gespeicherte Perioden den neutralen Kreis prüfen, danach beim Startweg eine ungefähre Zykluslänge eintragen und die als unsicher markierte Orientierung sehen.

## Technische Nachweise

- Betroffene Dateien: `src/lib/personal-cycle-view.ts` (neu), `src/lib/cycle-ring-geometry.ts`, `src/components/NewCycleExample.tsx`, `src/components/NewPeriodHistoryOnboarding.tsx`, `src/app/neu/page.tsx`, `docs/work-packages/WP-002-persoenlicher-zyklus-kreis.md`
- Tests: `npm run build` bestanden; manuelle Berechnungsprobe für die Vier-Perioden-Schwelle bestanden
- Commit oder Referenz: pending
