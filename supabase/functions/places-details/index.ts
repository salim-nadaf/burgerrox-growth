 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 };
 
 serve(async (req) => {
   if (req.method === 'OPTIONS') {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
     if (!GOOGLE_MAPS_API_KEY) {
       throw new Error('Google Maps API key not configured');
     }
 
     const { placeId, sessionToken } = await req.json();
 
     if (!placeId) {
       return new Response(
         JSON.stringify({ error: 'placeId is required' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     // Use Places API (New) - Get Place Details
     const response = await fetch(
       `https://places.googleapis.com/v1/places/${placeId}`,
       {
         method: 'GET',
         headers: {
           'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
           'X-Goog-FieldMask': 'id,displayName,formattedAddress,location',
         },
       }
     );
 
     const data = await response.json();
 
     console.log('Place details response:', JSON.stringify(data).substring(0, 500));
 
     if (data.location) {
       return new Response(
         JSON.stringify({
           placeId: data.id || placeId,
           name: data.displayName?.text || '',
           formattedAddress: data.formattedAddress || '',
           lat: data.location.latitude,
           lng: data.location.longitude,
         }),
         { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     } else if (data.error) {
       console.error('Places API error:', data.error);
       return new Response(
         JSON.stringify({ 
           error: data.error.message || 'Failed to get place details'
         }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     } else {
       return new Response(
         JSON.stringify({ 
           error: 'Could not get location details'
         }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
   } catch (error: any) {
     console.error('Error in places-details:', error);
     return new Response(
       JSON.stringify({ error: error.message || 'Failed to get place details' }),
       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   }
 });