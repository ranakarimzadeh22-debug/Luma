export function generatePartnerCode(name: string): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const prefix = name.slice(0, 3).toUpperCase();
  return `${prefix}-${random}`;
}
