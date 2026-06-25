import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const customerId = url.searchParams.get("customer_id");
    const whatsappRaw = url.searchParams.get("whatsapp") || "";
    const whatsapp = whatsappRaw.replace(/\D/g, "").slice(-10);

    if (!customerId) {
      return new Response(
        JSON.stringify({ error: "customer_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customerId)) {
      return new Response(
        JSON.stringify({ error: "Invalid customer_id format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Require the caller to prove ownership by also supplying the WhatsApp
    // number associated with this customer. This prevents enumeration of
    // other customers' order history just by knowing a UUID.
    if (!/^[6-9]\d{9}$/.test(whatsapp)) {
      return new Response(
        JSON.stringify({ error: "whatsapp is required to verify ownership" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: customer, error: custErr } = await supabase
      .from("customers")
      .select("id, whatsapp")
      .eq("id", customerId)
      .maybeSingle();

    if (custErr) throw custErr;
    if (!customer || customer.whatsapp !== whatsapp) {
      return new Response(
        JSON.stringify({ error: "Not authorized for this customer" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, order_number, items, total_amount, payment_method, payment_status, payment_id, status, created_at, updated_at, customer_name, customer_whatsapp, customer_area")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[guest-orders] Error:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ orders: orders || [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[guest-orders] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch orders" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
