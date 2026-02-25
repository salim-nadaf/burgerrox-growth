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

    const body = await req.json();
    const {
      customer_name,
      customer_whatsapp,
      customer_address,
      items,
      total_amount,
      payment_method,
      payment_status,
      payment_id,
      user_id,
    } = body;

    // Validate required fields
    if (!customer_name || !customer_whatsapp || !items || !total_amount || !payment_method) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize phone: strip non-digits, take last 10
    const phone = customer_whatsapp.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate amount
    if (typeof total_amount !== "number" || total_amount <= 0 || total_amount > 50000) {
      return new Response(
        JSON.stringify({ error: "Invalid order amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Upsert customer
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("whatsapp", phone)
      .maybeSingle();

    let customerId: string;
    if (existingCustomer) {
      customerId = existingCustomer.id;
      // Update name/address if changed
      await supabase
        .from("customers")
        .update({
          name: customer_name.trim(),
          address: customer_address || null,
        })
        .eq("id", customerId);
      console.log("[place-order] Updated existing customer:", customerId);
    } else {
      const { data: newCustomer, error: custErr } = await supabase
        .from("customers")
        .insert({
          name: customer_name.trim(),
          whatsapp: phone,
          address: customer_address || null,
        })
        .select("id")
        .single();

      if (custErr) {
        console.error("[place-order] Customer creation error:", custErr);
        throw custErr;
      }
      customerId = newCustomer.id;
      console.log("[place-order] Created new customer:", customerId);
    }

    // Step 2: Generate sequential order number atomically
    const { data: orderNumber, error: seqErr } = await supabase.rpc("next_order_number");
    if (seqErr) {
      console.error("[place-order] Sequence error:", seqErr);
      throw seqErr;
    }
    console.log("[place-order] Generated order number:", orderNumber);

    // Step 3: Create order
    // For guest orders, use customer_id as user_id (no FK constraint on user_id)
    const effectiveUserId = user_id || customerId;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: effectiveUserId,
        customer_id: customerId,
        order_number: orderNumber,
        items,
        total_amount,
        payment_method,
        payment_status: payment_status || "pending",
        payment_id: payment_id || null,
        customer_name: customer_name.trim(),
        customer_whatsapp: phone,
        customer_area: customer_address || null,
        status: "pending",
      })
      .select()
      .single();

    if (orderErr) {
      console.error("[place-order] Order creation error:", orderErr);
      throw orderErr;
    }

    console.log("[place-order] Order created successfully:", order.id);

    return new Response(
      JSON.stringify({
        order,
        customer_id: customerId,
        order_number: orderNumber,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[place-order] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to place order" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
