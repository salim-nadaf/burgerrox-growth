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

    if (req.method === "POST") {
      // Save / upsert customer profile
      const { name, whatsapp, address } = await req.json();

      if (!name || typeof name !== "string" || name.trim().length < 2) {
        return new Response(
          JSON.stringify({ error: "Name must be at least 2 characters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const phone = (whatsapp || "").replace(/\D/g, "").slice(-10);
      if (!/^[6-9]\d{9}$/.test(phone)) {
        return new Response(
          JSON.stringify({ error: "Invalid WhatsApp number" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if customer exists by whatsapp
      const { data: existing } = await supabase
        .from("customers")
        .select("id, name, whatsapp, address, created_at")
        .eq("whatsapp", phone)
        .maybeSingle();

      let customer;
      let isNew = false;

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("customers")
          .update({ name: name.trim(), address: address?.trim() || null })
          .eq("id", existing.id)
          .select("id, name, whatsapp, address")
          .single();

        if (error) throw error;
        customer = data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("customers")
          .insert({
            name: name.trim(),
            whatsapp: phone,
            address: address?.trim() || null,
          })
          .select("id, name, whatsapp, address")
          .single();

        if (error) throw error;
        customer = data;
        isNew = true;
      }

      console.log(`[save-customer] ${isNew ? "Created" : "Updated"} customer:`, customer.id);

      return new Response(
        JSON.stringify({ customer, is_new: isNew }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "GET") {
      // Lookup customer by whatsapp
      const url = new URL(req.url);
      const phone = (url.searchParams.get("whatsapp") || "").replace(/\D/g, "").slice(-10);

      if (!/^[6-9]\d{9}$/.test(phone)) {
        return new Response(
          JSON.stringify({ error: "Invalid WhatsApp number" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: customer } = await supabase
        .from("customers")
        .select("id, name, whatsapp, address")
        .eq("whatsapp", phone)
        .maybeSingle();

      return new Response(
        JSON.stringify({ customer }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[save-customer] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
