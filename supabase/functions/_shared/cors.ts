const ALLOWED_ORIGINS = [
  "https://gogourmet.co.ke",
  "https://gogourmet.vercel.app",
  "https://gogourmet-staging.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((a) => origin.startsWith(a)) || origin.endsWith(".vercel.app");
}

export function corsHeaders(req?: Request): Record<string, string> {
  const origin = req?.headers?.get("Origin") || "";
  const allowed = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  };
}
