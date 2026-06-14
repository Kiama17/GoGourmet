import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getUser, unauthorized } from "../_shared/auth.ts";

const ENV = Deno.env.get("MPESA_ENV") === "production" ? "production" : "sandbox";
const BASE_URL = ENV === "production"
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";

const MPESA_CONSUMER_KEY = Deno.env.get("MPESA_CONSUMER_KEY")!;
const MPESA_CONSUMER_SECRET = Deno.env.get("MPESA_CONSUMER_SECRET")!;
const MPESA_PASSKEY = Deno.env.get("MPESA_PASSKEY")!;
const MPESA_SHORTCODE = Deno.env.get("MPESA_SHORTCODE")!;

function getTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function getPassword(): string {
  const timestamp = getTimestamp();
  const str = MPESA_SHORTCODE + MPESA_PASSKEY + timestamp;
  return btoa(str);
}

async function getAccessToken(): Promise<string> {
  const auth = btoa(MPESA_CONSUMER_KEY + ":" + MPESA_CONSUMER_SECRET);
  const response = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: "Basic " + auth } },
  );
  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }

  const user = await getUser(req);
  if (!user) return unauthorized();

  try {
    const { checkoutRequestID } = await req.json();
    const token = await getAccessToken();
    const timestamp = getTimestamp();
    const password = getPassword();

    const queryPayload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    };

    const response = await fetch(
      `${BASE_URL}/mpesa/stkpushquery/v1/query`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryPayload),
      },
    );
    const data = await response.json();

    return new Response(
      JSON.stringify({
        success: data.ResultCode === "0",
        message: data.ResultDesc || "Unknown",
        checkoutRequestID,
        responseCode: data.ResultCode,
      }),
      { headers: { ...corsHeaders(req), "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders(req), "Content-Type": "application/json" }, status: 500 },
    );
  }
});
