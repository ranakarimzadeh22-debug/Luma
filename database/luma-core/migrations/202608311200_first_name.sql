ALTER TABLE new_users
  ADD COLUMN first_name TEXT;

ALTER TABLE new_users
  ADD CONSTRAINT new_users_first_name_valid
  CHECK (
    first_name IS NULL
    OR (
      CHAR_LENGTH(first_name) BETWEEN 1 AND 50
      AND first_name = BTRIM(first_name)
    )
  );

COMMENT ON COLUMN new_users.first_name IS
  'Normalized first name used only for the personal greeting in the new Luma path.';
