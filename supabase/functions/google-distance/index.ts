import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Restaurant location - Urban Forest, Mamurdi, Saint Tukaram Nagar Road, Kiwale, Taluka Haveli 412101
// Coordinates confirmed from Google Maps
const RESTAURANT_ADDRESS = "Urban Forest, Mamurdi, Saint Tukaram Nagar Road, Kiwale, Taluka Haveli 412101, India";
const RESTAURANT_LAT = 18.665812;
const RESTAURANT_LNG = 73.716100;

// Max delivery distance
const MAX_DELIVERY_DISTANCE_KM = 12;

// Delivery charge tiers based on distance (in km)
const DELIVERY_TIERS = [
  { maxDistance: 3, charge: 0, label: "Free Delivery" },
  { maxDistance: 5, charge: 50, label: "₹50 (3-5 km)" },
  { maxDistance: 7, charge: 75, label: "₹75 (5-7 km)" },
  { maxDistance: 10, charge: 105, label: "₹105 (7-10 km)" },
  { maxDistance: 12, charge: 175, label: "₹175 (10-12 km)" }
];

function getDeliveryCharge(distanceKm: number): { charge: number; label: string } {
  for (const tier of DELIVERY_TIERS) {
    if (distanceKm <= tier.maxDistance) {
      return { charge: tier.charge, label: tier.label };
    }
  }
  return { 
    charge: DELIVERY_TIERS[DELIVERY_TIERS.length - 1].charge, 
    label: DELIVERY_TIERS[DELIVERY_TIERS.length - 1].label
  };
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

    const { placeId, destinationLat, destinationLng, formattedAddress } = await req.json();

    if (!placeId && (!destinationLat || !destinationLng)) {
      return new Response(
        JSON.stringify({ error: 'Either placeId or coordinates are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let destLat = destinationLat;
    let destLng = destinationLng;
    let destAddress = formattedAddress || '';

    // If placeId provided, get coordinates from Geocoding API
    if (placeId && !destinationLat) {
      const geocodeUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json');
      geocodeUrl.searchParams.set('place_id', placeId);
      geocodeUrl.searchParams.set('key', GOOGLE_MAPS_API_KEY);

      const geocodeResponse = await fetch(geocodeUrl.toString());
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status !== 'OK' || !geocodeData.results?.[0]) {
        return new Response(
          JSON.stringify({ error: 'Could not geocode the selected location' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const location = geocodeData.results[0].geometry.location;
      destLat = location.lat;
      destLng = location.lng;
      destAddress = geocodeData.results[0].formatted_address;
    }

    // Calculate distance using Distance Matrix API
    const distanceUrl = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    // Use address as origin for more "Google Maps-like" routing (entrance/road snapping)
    distanceUrl.searchParams.set('origins', RESTAURANT_ADDRESS);
    distanceUrl.searchParams.set('destinations', `${destLat},${destLng}`);
    distanceUrl.searchParams.set('mode', 'driving');
    distanceUrl.searchParams.set('units', 'metric');
    distanceUrl.searchParams.set('key', GOOGLE_MAPS_API_KEY);

    const distanceResponse = await fetch(distanceUrl.toString());
    const distanceData = await distanceResponse.json();

    console.log('Distance Matrix response:', JSON.stringify(distanceData));

    if (distanceData.status !== 'OK') {
      return new Response(
        JSON.stringify({ error: 'Failed to calculate distance', details: distanceData.status }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const element = distanceData.rows?.[0]?.elements?.[0];
    if (!element || element.status !== 'OK') {
      return new Response(
        JSON.stringify({ 
          error: 'Could not calculate route to this location',
          details: element?.status || 'No route found'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Distance in km
    const distanceKm = element.distance.value / 1000;
    const roundedDistance = Math.round(distanceKm * 10) / 10;
    const deliveryCharge = getDeliveryCharge(distanceKm);

    console.log(`Distance: ${roundedDistance}km, Charge: ₹${deliveryCharge.charge}`);

    return new Response(
      JSON.stringify({
        success: true,
        distance: {
          value: roundedDistance,
          text: element.distance.text
        },
        duration: {
          value: element.duration.value,
          text: element.duration.text
        },
        deliveryCharge: deliveryCharge.charge,
        deliveryLabel: deliveryCharge.label,
        destinationAddress: destAddress,
        destinationLat: destLat,
        destinationLng: destLng
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error calculating distance:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to calculate delivery charge' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
