import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }

  try {
    const { Body } = await req.json();

    if (!Body?.stkCallback) {
      return new Response(
        JSON.stringify({ ResultCode: 1, ResultDesc: "Invalid payload" }),
        { status: 400, headers: { ...corsHeaders(req), "Content-Type": "application/json" } },
      );
    }

    const { CheckoutRequestID, Amount, Msisdn } = Body.stkCallback;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (Body.stkCallback.ResultCode === 0) {
      const items = Body.stkCallback.CallbackMetadata?.Item || [];
      const receiptNumber =
        items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value || "";

      const { data: existing } = await supabase
        .from("payments")
        .select("id, amount")
        .eq("id", CheckoutRequestID)
        .maybeSingle();

      if (existing && existing.amount !== Amount) {
        return new Response(
          JSON.stringify({ ResultCode: 1, ResultDesc: "Amount mismatch" }),
          { headers: { ...corsHeaders(req), "Content-Type": "application/json" } },
        );
      }

      await supabase.from("payments").upsert({
        id: CheckoutRequestID,
        status: "completed",
        amount: Amount,
        phone: Msisdn,
        receipt_number: receiptNumber,
        paid_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Success" }),
        { headers: { ...corsHeaders(req), "Content-Type": "application/json" } },
      );
    }

    await supabase.from("payments").upsert({
      id: CheckoutRequestID,
      status: "failed",
      amount: Amount,
      phone: Msisdn,
      paid_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ ResultCode: 1, ResultDesc: "Failed" }),
      { headers: { ...corsHeaders(req), "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ ResultCode: 1, ResultDesc: error.message }),
      { headers: { ...corsHeaders(req), "Content-Type": "application/json" }, status: 500 },
    );
  }
});
