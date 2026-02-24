import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const amount = body.amount
    const currency = body.currency || 'INR'
    const receipt = typeof body.receipt === 'string' ? body.receipt.trim().substring(0, 200).replace(/[^a-zA-Z0-9_\-]/g, '') : undefined

    // Amount validation (in rupees)
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.error('Invalid amount:', amount)
      return new Response(
        JSON.stringify({ error: 'Invalid amount - must be a positive number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const MIN_AMOUNT = 1
    const MAX_AMOUNT = 50000
    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return new Response(
        JSON.stringify({ error: `Amount must be between ₹${MIN_AMOUNT} and ₹${MAX_AMOUNT}` }),
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

    const amountInPaise = Math.round(amount * 100)
    console.log('Creating Razorpay order — amount:', amount, 'paise:', amountInPaise)

    const auth = btoa(`${keyId}:${keySecret}`)
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: receipt || `o_${Date.now()}`.substring(0, 40),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Razorpay API error:', JSON.stringify(data))
      return new Response(
        JSON.stringify({ error: data.error?.description || 'Failed to create order' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Razorpay order created:', data.id)

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
