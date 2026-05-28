import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { Body } = await req.json();

    if (Body?.stkCallback?.ResultCode === 0) {
      const { CheckoutRequestID, Amount, Msisdn } = Body.stkCallback;
      const items = Body.stkCallback.CallbackMetadata?.Item || [];
      const receiptNumber =
        items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value || "";

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

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
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ ResultCode: 1, ResultDesc: "Failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ ResultCode: 1, ResultDesc: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
