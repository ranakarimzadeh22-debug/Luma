ALTER TABLE new_partner_connections
  ADD COLUMN calendar_shared BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN new_partner_connections.calendar_shared IS
  'WP-004 Version 9: vom Owner bewusst ein-/ausgeschaltete Freigabe des lesenden Grundkalenders (nur tatsächlich bestätigte Periodentage) für den verbundenen Partner. Default false. Getrennt von cycle_ring_shared. Gehört zur aktiven Verbindung, damit ein Widerruf der Verbindung die Freigabe automatisch mit beendet.';
