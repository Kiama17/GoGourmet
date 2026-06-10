export function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, "").replace(/[<>"'\\]/g, "").trim();
}

export function sanitizeOptional(input?: string | null): string {
  if (!input) return "";
  return sanitize(input);
}
