import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { amount, currency = 'INR', receipt } = await req.json()

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const keyId = Deno.env.get('RAZORPAY_KEY_ID')
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!keyId || !keySecret) {
      console.error('Razorpay credentials not configured. KEY_ID:', !!keyId, 'KEY_SECRET:', !!keySecret)
      return new Response(
        JSON.stringify({ error: 'Payment configuration error. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Using Razorpay Key ID:', keyId.substring(0, 10) + '...')

    // Create Razorpay order
    const auth = btoa(`${keyId}:${keySecret}`)
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency,
        receipt: receipt || `order_${Date.now()}`,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Razorpay error:', data)
      return new Response(
        JSON.stringify({ error: data.error?.description || 'Failed to create order' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        orderId: data.id,
        amount: data.amount,
        currency: data.currency,
        keyId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
