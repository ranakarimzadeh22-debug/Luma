export const NEW_AUTH_PASSWORD_MIN_LENGTH = 8;
export const NEW_AUTH_PASSWORD_MAX_LENGTH = 128;
export const NEW_AUTH_EMAIL_MAX_LENGTH = 254;
export const NEW_AUTH_FIRST_NAME_MAX_LENGTH = 50;

export function normalizeNewAuthFirstName(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const firstName = value.normalize("NFKC").trim().replace(/\s+/g, " ");
  if (firstName.length === 0 || firstName.length > NEW_AUTH_FIRST_NAME_MAX_LENGTH) return null;
  if (/[\u0000-\u001f\u007f]/.test(firstName)) return null;

  return firstName;
}

export function normalizeNewAuthEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const email = value.trim().toLowerCase();
  if (email.length === 0 || email.length > NEW_AUTH_EMAIL_MAX_LENGTH) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;

  return email;
}

export function validateNewAuthPassword(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (
    value.length < NEW_AUTH_PASSWORD_MIN_LENGTH ||
    value.length > NEW_AUTH_PASSWORD_MAX_LENGTH
  ) {
    return null;
  }

  return value;
}

export function validateNewRegistrationInput(body: unknown):
  | { ok: true; firstName: string; email: string; password: string }
  | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Bitte fülle alle Felder aus." };
  }

  const input = body as Record<string, unknown>;
  const firstName = normalizeNewAuthFirstName(input.firstName);
  const email = normalizeNewAuthEmail(input.email);
  const password = validateNewAuthPassword(input.password);

  if (!firstName) {
    return {
      ok: false,
      message: `Bitte gib einen Vornamen mit höchstens ${NEW_AUTH_FIRST_NAME_MAX_LENGTH} Zeichen ein.`,
    };
  }
  if (!email) {
    return { ok: false, message: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }
  if (!password) {
    return {
      ok: false,
      message: `Das Passwort muss ${NEW_AUTH_PASSWORD_MIN_LENGTH} bis ${NEW_AUTH_PASSWORD_MAX_LENGTH} Zeichen haben.`,
    };
  }
  if (input.passwordConfirmation !== password) {
    return { ok: false, message: "Die Passwörter stimmen nicht überein." };
  }

  return { ok: true, firstName, email, password };
}

export function validateNewFirstNameInput(body: unknown):
  | { ok: true; firstName: string }
  | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Bitte gib deinen Vornamen ein." };
  }

  const firstName = normalizeNewAuthFirstName((body as Record<string, unknown>).firstName);
  if (!firstName) {
    return {
      ok: false,
      message: `Bitte gib einen Vornamen mit höchstens ${NEW_AUTH_FIRST_NAME_MAX_LENGTH} Zeichen ein.`,
    };
  }

  return { ok: true, firstName };
}

export function validateNewLoginInput(body: unknown):
  | { ok: true; email: string; password: string }
  | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "E-Mail oder Passwort ist falsch." };
  }

  const input = body as Record<string, unknown>;
  const email = normalizeNewAuthEmail(input.email);
  const password = validateNewAuthPassword(input.password);

  if (!email || !password) {
    return { ok: false, message: "E-Mail oder Passwort ist falsch." };
  }

  return { ok: true, email, password };
}
