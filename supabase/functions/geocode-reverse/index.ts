import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function isValidCoordinate(lat: number, lng: number): boolean {
  return typeof lat === 'number' && typeof lng === 'number' &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 &&
    isFinite(lat) && isFinite(lng);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    const { lat, lng } = await req.json();

    if (!isValidCoordinate(Number(lat), Number(lng))) {
      return new Response(
        JSON.stringify({ error: 'Invalid coordinates. Latitude must be -90 to 90, longitude -180 to 180.', formattedAddress: null }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('latlng', `${Number(lat)},${Number(lng)}`);
    url.searchParams.set('key', GOOGLE_MAPS_API_KEY);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== 'OK' || !data.results?.[0]) {
      return new Response(
        JSON.stringify({
          formattedAddress: null,
          error: data.status === 'ZERO_RESULTS' ? 'No address found' : 'Geocoding failed',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ formattedAddress: data.results[0].formatted_address }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('geocode-reverse error:', error);
    return new Response(
      JSON.stringify({ error: 'Reverse geocode failed', formattedAddress: null }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
