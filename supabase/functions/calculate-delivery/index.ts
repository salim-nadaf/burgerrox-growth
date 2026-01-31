import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Restaurant location - Urban Forest, Mamurdi, Pune 412101
// Coordinates: 18.6298, 73.7997 (approximate)
const RESTAURANT_LAT = 18.6298;
const RESTAURANT_LNG = 73.7997;

// Delivery charge tiers based on distance (in km)
const DELIVERY_TIERS = [
  { maxDistance: 3, charge: 0, label: "Free Delivery" },
  { maxDistance: 5, charge: 50, label: "₹50 (3-5 km)" },
  { maxDistance: 7, charge: 75, label: "₹75 (5-7 km)" },
  { maxDistance: 10, charge: 105, label: "₹105 (7-10 km)" },
  { maxDistance: Infinity, charge: 175, label: "₹175 (10+ km)" }
];

// Haversine formula to calculate distance between two coordinates
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getDeliveryCharge(distanceKm: number): { charge: number; label: string; distanceKm: number } {
  for (const tier of DELIVERY_TIERS) {
    if (distanceKm <= tier.maxDistance) {
      return { 
        charge: tier.charge, 
        label: tier.label,
        distanceKm: Math.round(distanceKm * 10) / 10
      };
    }
  }
  return { 
    charge: DELIVERY_TIERS[DELIVERY_TIERS.length - 1].charge, 
    label: DELIVERY_TIERS[DELIVERY_TIERS.length - 1].label,
    distanceKm: Math.round(distanceKm * 10) / 10
  };
}

// Geocode address using OpenStreetMap Nominatim (FREE, no API key needed)
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number; displayName: string } | null> {
  const fullAddress = address.toLowerCase().includes('pune') 
    ? address 
    : `${address}, Pune, India`;
  
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', fullAddress);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'in');
  
  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'BurgerRox-Delivery-App/1.0'
    }
  });
  
  const data = await response.json();
  console.log('Nominatim response:', JSON.stringify(data));
  
  if (data && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      displayName: data[0].display_name
    };
  }
  
  return null;
}

// Estimate travel time based on distance (rough estimate: 25 km/h average in city)
function estimateDuration(distanceKm: number): string {
  const avgSpeedKmh = 25;
  const minutes = Math.round((distanceKm / avgSpeedKmh) * 60);
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours} hr ${remainingMins} mins`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerAddress } = await req.json();
    
    if (!customerAddress || customerAddress.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid delivery address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Geocode the customer address using free Nominatim service
    const location = await geocodeAddress(customerAddress);
    
    if (!location) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not find your address. Please try with more details (e.g., area name, landmark).',
          details: 'Address not found'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate straight-line distance using Haversine formula
    // Adding 30% buffer for actual road distance
    const straightLineDistance = calculateHaversineDistance(
      RESTAURANT_LAT, RESTAURANT_LNG,
      location.lat, location.lon
    );
    const estimatedRoadDistance = straightLineDistance * 1.3;
    
    const deliveryInfo = getDeliveryCharge(estimatedRoadDistance);
    const durationText = estimateDuration(estimatedRoadDistance);

    console.log(`Distance calculated: ${straightLineDistance.toFixed(2)}km straight, ~${estimatedRoadDistance.toFixed(2)}km road`);

    return new Response(
      JSON.stringify({
        success: true,
        distance: {
          value: estimatedRoadDistance,
          text: `${estimatedRoadDistance.toFixed(1)} km`
        },
        duration: {
          text: durationText
        },
        deliveryCharge: deliveryInfo.charge,
        deliveryLabel: deliveryInfo.label,
        destinationAddress: location.displayName
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error calculating delivery:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to calculate delivery charge' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
