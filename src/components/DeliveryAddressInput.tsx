import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Loader2, Truck, CheckCircle, Navigation } from 'lucide-react';
import { useDelivery } from '@/hooks/useDelivery';
import { toast } from '@/components/ui/use-toast';
import GooglePlacesSearch from './GooglePlacesSearch';

// Google Maps API Key (publishable - restricted by HTTP referrer in Google Console)
const GOOGLE_MAPS_API_KEY = 'AIzaSyA_M0xkGYWN7xtQTqE3qvW9djVGw7yBGWU';

// Common Pune delivery areas with their coordinates
const PUNE_AREAS = [
  { name: "Mamurdi", lat: 18.6285, lon: 73.7937, label: "Mamurdi (Free Delivery Zone)" },
  { name: "Dehu Road", lat: 18.6747, lon: 73.7597, label: "Dehu Road" },
  { name: "Wakad", lat: 18.5986, lon: 73.7593, label: "Wakad" },
  { name: "Pimpri", lat: 18.6279, lon: 73.8009, label: "Pimpri" },
  { name: "Chinchwad", lat: 18.6298, lon: 73.7997, label: "Chinchwad" },
  { name: "Hinjewadi", lat: 18.5912, lon: 73.7380, label: "Hinjewadi" },
  { name: "Aundh", lat: 18.5580, lon: 73.8073, label: "Aundh" },
  { name: "Baner", lat: 18.5590, lon: 73.7868, label: "Baner" },
  { name: "Balewadi", lat: 18.5748, lon: 73.7700, label: "Balewadi" },
  { name: "Ravet", lat: 18.6494, lon: 73.7462, label: "Ravet" },
  { name: "Punawale", lat: 18.6200, lon: 73.7467, label: "Punawale" },
  { name: "Tathawade", lat: 18.6163, lon: 73.7503, label: "Tathawade" },
  { name: "Nigdi", lat: 18.6519, lon: 73.7659, label: "Nigdi" },
  { name: "Akurdi", lat: 18.6480, lon: 73.7692, label: "Akurdi" },
  { name: "Bhosari", lat: 18.6363, lon: 73.8502, label: "Bhosari" },
  { name: "Moshi", lat: 18.6723, lon: 73.8508, label: "Moshi" },
  { name: "Talegaon", lat: 18.7297, lon: 73.6756, label: "Talegaon Dabhade" },
];

export default function DeliveryAddressInput() {
  const { deliveryInfo, isCalculating, calculateDeliveryFromPlace, calculateDeliveryFromCoords, clearDelivery } = useDelivery();
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleAreaSelect = async (areaName: string) => {
    if (areaName === 'gps') {
      handleGetGPSLocation();
      return;
    }
    
    const area = PUNE_AREAS.find(a => a.name === areaName);
    if (area) {
      setSelectedArea(areaName);
      await calculateDeliveryFromCoords(area.lat, area.lon, area.label);
    }
  };

  const handlePlaceSelect = async (place: {
    placeId: string;
    formattedAddress: string;
    shortAddress: string;
    lat: number;
    lng: number;
  }) => {
    setSelectedArea('search');
    await calculateDeliveryFromPlace(place.placeId, place.formattedAddress);
  };

  const handleGetGPSLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS Not Available",
        description: "Your browser doesn't support location services",
        variant: "destructive"
      });
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Use Google Geocoding to get address from coords
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();
          
          const fullAddress = data.results?.[0]?.formatted_address || 
            `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          
          await calculateDeliveryFromCoords(latitude, longitude, fullAddress);
        } catch {
          await calculateDeliveryFromCoords(
            latitude, 
            longitude, 
            `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
          );
        }
        
        setSelectedArea('gps');
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        let message = "Could not get your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Please allow location access in your browser";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            message = "Location request timed out";
            break;
        }
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive"
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleClear = () => {
    clearDelivery();
    setSelectedArea('');
  };

  if (deliveryInfo) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Delivery Location Set</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Change
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-3">
            {deliveryInfo.destinationAddress}
          </p>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{deliveryInfo.distanceText}</span>
              <span className="text-muted-foreground">•</span>
              <span>{deliveryInfo.durationText}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-background rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <span className="font-medium">Delivery Charge</span>
            </div>
            <span className={`font-bold text-lg ${deliveryInfo.charge === 0 ? 'text-primary' : ''}`}>
              {deliveryInfo.charge === 0 ? 'FREE' : `₹${deliveryInfo.charge}`}
            </span>
          </div>
          
          {deliveryInfo.charge === 0 && (
            <p className="text-xs text-primary text-center">
              You're within 3km - Free delivery zone!
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Delivery Location
        </Label>
        
        <div className="space-y-3">
          {/* Google Places Autocomplete Search */}
          <GooglePlacesSearch 
            onPlaceSelect={handlePlaceSelect}
            placeholder="Search: D Y Patil, Hinjewadi IT Park..."
            disabled={isCalculating || isGettingLocation}
            apiKey={GOOGLE_MAPS_API_KEY}
          />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>
          
          {/* GPS Location Button */}
          <Button 
            onClick={handleGetGPSLocation}
            disabled={isGettingLocation || isCalculating}
            className="w-full"
            variant="outline"
          >
            {isGettingLocation ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <Navigation className="mr-2 h-4 w-4" />
                Use My Current Location (GPS)
              </>
            )}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or select area</span>
            </div>
          </div>
          
          {/* Area Dropdown */}
          <Select 
            value={selectedArea} 
            onValueChange={handleAreaSelect}
            disabled={isCalculating || isGettingLocation}
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Select your area" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              {PUNE_AREAS.map((area) => (
                <SelectItem 
                  key={area.name} 
                  value={area.name}
                  className="cursor-pointer"
                >
                  {area.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {isCalculating && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculating delivery charge...
            </div>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Free delivery within 3km of Urban Forest, Mamurdi
        </p>
      </CardContent>
    </Card>
  );
}
