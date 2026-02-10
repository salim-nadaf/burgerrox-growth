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

    const body = await req.json();
    const input = typeof body.input === 'string' ? body.input.trim().substring(0, 500) : '';

    if (!input || input.length < 3) {
      return new Response(
        JSON.stringify({ predictions: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geocodeUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    geocodeUrl.searchParams.set('address', input + ', Pune, Maharashtra, India');
    geocodeUrl.searchParams.set('key', GOOGLE_MAPS_API_KEY);
    geocodeUrl.searchParams.set('region', 'in');
    geocodeUrl.searchParams.set('language', 'en');
    geocodeUrl.searchParams.set('bounds', '18.3,73.5|18.9,74.2');

    const response = await fetch(geocodeUrl.toString());
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const predictions = data.results.slice(0, 5).map((r: any) => {
        const parts = r.formatted_address.split(',');
        return {
          placeId: r.place_id,
          mainText: parts[0]?.trim() || r.formatted_address,
          secondaryText: parts.slice(1).join(',').trim(),
          fullText: r.formatted_address,
          lat: r.geometry?.location?.lat,
          lng: r.geometry?.location?.lng,
        };
      });

      return new Response(
        JSON.stringify({ predictions, status: 'OK' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (data.status === 'ZERO_RESULTS') {
      return new Response(
        JSON.stringify({ predictions: [], status: 'ZERO_RESULTS' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('Geocoding API error:', data.status);
      return new Response(
        JSON.stringify({ predictions: [], status: data.status, error: 'Search failed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('Error in places-autocomplete:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to search places', predictions: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
