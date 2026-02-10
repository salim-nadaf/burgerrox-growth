import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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
    // Authentication check - verify JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized - missing auth token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify the user's JWT and get claims
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
    
    if (claimsError || !claimsData?.claims) {
      console.error('JWT verification failed:', claimsError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = claimsData.claims.sub
    console.log('Authenticated user:', userId)

    const body = await req.json()
    const amount = body.amount
    const currency = body.currency || 'INR'
    const receipt = typeof body.receipt === 'string' ? body.receipt.trim().substring(0, 200).replace(/[^a-zA-Z0-9_\-]/g, '') : undefined

    // Enhanced amount validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount - must be a positive number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Set reasonable min/max limits for amount (in rupees)
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

    console.log('Creating Razorpay order for user:', userId, 'amount:', amount)

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
        receipt: receipt || `order_${userId}_${Date.now()}`,
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
