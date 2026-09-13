ALTER TABLE new_partner_connections
  ADD COLUMN cycle_ring_shared BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN new_partner_connections.cycle_ring_shared IS
  'WP-004 Version 6: vom Owner bewusst ein-/ausgeschaltete Freigabe des lesenden Zyklus-Kreises für den verbundenen Partner. Default false. Gehört zur aktiven Verbindung, damit ein Widerruf der Verbindung die Freigabe automatisch mit beendet.';
