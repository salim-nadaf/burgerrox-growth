import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESTAURANT_LAT = 18.6298;
const RESTAURANT_LNG = 73.7997;

const DELIVERY_TIERS = [
  { maxDistance: 3, charge: 0, label: "Free Delivery" },
  { maxDistance: 5, charge: 50, label: "₹50 (3-5 km)" },
  { maxDistance: 7, charge: 75, label: "₹75 (5-7 km)" },
  { maxDistance: 10, charge: 105, label: "₹105 (7-10 km)" },
  { maxDistance: Infinity, charge: 175, label: "₹175 (10+ km)" }
];

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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
      return { charge: tier.charge, label: tier.label, distanceKm: Math.round(distanceKm * 10) / 10 };
    }
  }
  return { 
    charge: DELIVERY_TIERS[DELIVERY_TIERS.length - 1].charge, 
    label: DELIVERY_TIERS[DELIVERY_TIERS.length - 1].label,
    distanceKm: Math.round(distanceKm * 10) / 10
  };
}

function isValidCoordinate(lat: number, lng: number): boolean {
  return typeof lat === 'number' && typeof lng === 'number' &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 &&
    isFinite(lat) && isFinite(lng);
}

async function tryGeocode(query: string): Promise<{ lat: number; lon: number; displayName: string } | null> {
  // Limit query length
  const safeQuery = query.substring(0, 500);
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', safeQuery);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'in');
  
  const response = await fetch(url.toString(), {
    headers: { 'User-Agent': 'BurgerRox-Delivery-App/1.0' }
  });
  
  const data = await response.json();
  
  if (data && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      displayName: data[0].display_name
    };
  }
  return null;
}

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number; displayName: string } | null> {
  const cleanAddress = address.trim().substring(0, 500);
  const parts = cleanAddress.split(',').map(p => p.trim());
  
  const searchQueries: string[] = [];
  
  const fullAddress = cleanAddress.toLowerCase().includes('pune') 
    ? cleanAddress 
    : `${cleanAddress}, Pune, Maharashtra, India`;
  searchQueries.push(fullAddress);
  
  if (parts.length >= 2) {
    const withoutFirst = parts.slice(1).join(', ');
    const areaSearch = withoutFirst.toLowerCase().includes('pune')
      ? withoutFirst
      : `${withoutFirst}, Pune, Maharashtra, India`;
    searchQueries.push(areaSearch);
  }
  
  if (parts.length >= 1) {
    const lastPart = parts[parts.length - 1];
    if (!lastPart.toLowerCase().includes('pune')) {
      searchQueries.push(`${lastPart}, Pune, Maharashtra, India`);
    }
  }
  
  const roadKeywords = ['road', 'marg', 'nagar', 'chowk', 'colony', 'society', 'vihar', 'path'];
  for (const part of parts) {
    const lowerPart = part.toLowerCase();
    if (roadKeywords.some(kw => lowerPart.includes(kw))) {
      searchQueries.push(`${part}, Pune, Maharashtra, India`);
    }
  }

  for (const query of searchQueries) {
    const result = await tryGeocode(query);
    if (result) return result;
  }
  
  return null;
}

function estimateDuration(distanceKm: number): string {
  const avgSpeedKmh = 25;
  const minutes = Math.round((distanceKm / avgSpeedKmh) * 60);
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours} hr ${remainingMins} mins`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const customerAddress = typeof body.customerAddress === 'string' 
      ? body.customerAddress.trim().substring(0, 500) 
      : '';
    
    if (!customerAddress || customerAddress.length < 5) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid delivery address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const location = await geocodeAddress(customerAddress);
    
    if (!location) {
      return new Response(
        JSON.stringify({ error: 'Could not find your address. Please try with more details.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate geocoded coordinates
    if (!isValidCoordinate(location.lat, location.lon)) {
      return new Response(
        JSON.stringify({ error: 'Invalid location returned from geocoding' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const straightLineDistance = calculateHaversineDistance(
      RESTAURANT_LAT, RESTAURANT_LNG,
      location.lat, location.lon
    );
    const estimatedRoadDistance = straightLineDistance * 1.3;
    
    const deliveryInfo = getDeliveryCharge(estimatedRoadDistance);
    const durationText = estimateDuration(estimatedRoadDistance);

    return new Response(
      JSON.stringify({
        success: true,
        distance: { value: estimatedRoadDistance, text: `${estimatedRoadDistance.toFixed(1)} km` },
        duration: { text: durationText },
        deliveryCharge: deliveryInfo.charge,
        deliveryLabel: deliveryInfo.label,
        destinationAddress: location.displayName
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error calculating delivery:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to calculate delivery charge' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
