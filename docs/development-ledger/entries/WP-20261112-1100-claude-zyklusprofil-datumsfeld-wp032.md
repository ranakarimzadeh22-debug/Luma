---
id: WP-20261112-1100-claude-zyklusprofil-datumsfeld-wp032
date: 2026-11-12
time: 11:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Zyklusprofil: Datumsfeld wieder bedienbar (WP-032)

## Was wurde gemacht?

In der ersten Frage des Zyklusprofils lässt sich das Datumsfeld wieder anklicken, antippen und ausfüllen. Vorher war das Feld gesperrt, sobald „Ich weiß es nicht“ gewählt war oder das gespeicherte Profil kein Datum hatte. Jetzt ist es immer offen. Wer ein Datum wählt, hebt „Ich weiß es nicht“ damit auf. Alles andere im Zyklusprofil ist gleich geblieben.

## Warum?

Beim Owner-Test am 12.11.2026 ließ sich das Feld nicht bedienen. Das steht im freigegebenen Arbeitspaket WP-032.

## Prüfung und Stand

Neues Prüfskript, TypeScript und Build bestehen. Kein Browserlauf auf Desktop und Mobil. Nicht deployed.

## Offene Punkte

- Das Verhalten im Browser prüft die Owner-Abnahme.

## Nächster Schritt

Owner prüft `/neu/zyklusprofil` lokal.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleProfileWizard.tsx`, `scripts/verify-cycle-profile-date-wp032.ts` (neu)
- Ursache: `disabled={draft.lastPeriodUnknown}` am Datumsfeld
- Tests: siehe oben
- Commit oder Referenz: pending
