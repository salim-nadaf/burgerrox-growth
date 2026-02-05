import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Loader2, Truck, CheckCircle, Navigation, AlertTriangle, Leaf, ExternalLink } from 'lucide-react';
import { useDelivery } from '@/hooks/useDelivery';
import { toast } from '@/components/ui/use-toast';
import GooglePlacesSearch from './GooglePlacesSearch';
import DetailedAddressForm, { DetailedAddress, isAddressComplete, formatFullAddress } from './DetailedAddressForm';

 // Google Maps API Key for GPS reverse geocoding only
 const GOOGLE_MAPS_API_KEY = 'AIzaSyCsYwmjFxC5JrZtZKB8EhzBF2hF61K1xVs';

// Max delivery distance
const MAX_DELIVERY_DISTANCE_KM = 12;
const FRESHNESS_MESSAGE_THRESHOLD_KM = 6;

interface DeliveryAddressInputProps {
  detailedAddress: DetailedAddress;
  onDetailedAddressChange: (address: DetailedAddress) => void;
}

export default function DeliveryAddressInput({ 
  detailedAddress, 
  onDetailedAddressChange 
}: DeliveryAddressInputProps) {
  const { deliveryInfo, isCalculating, calculateDeliveryFromPlace, calculateDeliveryFromCoords, clearDelivery } = useDelivery();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [tooFarError, setTooFarError] = useState<string | null>(null);

  const handlePlaceSelect = async (place: {
    placeId: string;
    formattedAddress: string;
    shortAddress: string;
    lat: number;
    lng: number;
  }) => {
    setTooFarError(null);
    const result = await calculateDeliveryFromPlace(place.placeId, place.formattedAddress);
    
    // Check if distance exceeds limit
    if (result && result.distanceKm > MAX_DELIVERY_DISTANCE_KM) {
      setTooFarError(`Sorry, we don't deliver beyond ${MAX_DELIVERY_DISTANCE_KM} km. Your location is ${result.distanceText} away.`);
      clearDelivery();
    }
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
    setTooFarError(null);
    
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
          
          const result = await calculateDeliveryFromCoords(latitude, longitude, fullAddress);
          
          // Check if distance exceeds limit
          if (result && result.distanceKm > MAX_DELIVERY_DISTANCE_KM) {
            setTooFarError(`Sorry, we don't deliver beyond ${MAX_DELIVERY_DISTANCE_KM} km. Your location is ${result.distanceText} away.`);
            clearDelivery();
          }
        } catch {
          const result = await calculateDeliveryFromCoords(
            latitude, 
            longitude, 
            `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
          );
          
          if (result && result.distanceKm > MAX_DELIVERY_DISTANCE_KM) {
            setTooFarError(`Sorry, we don't deliver beyond ${MAX_DELIVERY_DISTANCE_KM} km. Your location is ${result.distanceText} away.`);
            clearDelivery();
          }
        }
        
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
    setTooFarError(null);
  };

  // Generate Google Maps link for the delivery location
  const getMapsLink = () => {
    if (deliveryInfo?.lat && deliveryInfo?.lng) {
      return `https://www.google.com/maps?q=${deliveryInfo.lat},${deliveryInfo.lng}`;
    }
    return null;
  };

  // Show "too far" error state
  if (tooFarError) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Delivery Not Available</span>
          </div>
          
          <p className="text-sm text-destructive">
            {tooFarError}
          </p>
          
          <p className="text-sm text-muted-foreground">
            We currently deliver within {MAX_DELIVERY_DISTANCE_KM} km of Urban Forest, Kiwale to ensure fresh food quality.
          </p>
          
          <Button onClick={handleClear} variant="outline" className="w-full">
            Try Different Location
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show delivery info if location is set
  if (deliveryInfo) {
    const isLongDistance = deliveryInfo.distanceKm >= FRESHNESS_MESSAGE_THRESHOLD_KM;
    const mapsLink = getMapsLink();
    
    return (
      <div className="space-y-3">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Location Confirmed</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Change
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {deliveryInfo.destinationAddress}
            </p>
            
            {mapsLink && (
              <a 
                href={mapsLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                View on Google Maps
              </a>
            )}
            
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
            
            {/* Freshness guaranteed message for long distances */}
            {isLongDistance && (
              <div className="flex items-center gap-2 p-2 bg-accent rounded-lg border border-border">
                <Leaf className="h-4 w-4 text-primary" />
                <p className="text-xs text-foreground">
                  Freshness Guaranteed! Your order will be packed with care for optimal quality.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Detailed Address Form - Always show when location is set */}
        <DetailedAddressForm 
          value={detailedAddress}
          onChange={onDetailedAddressChange}
          locationAddress={deliveryInfo.destinationAddress}
        />
      </div>
    );
  }

  // Default input state - always show search field as primary input
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Delivery Location
        </Label>
        
        <div className="space-y-3">
          {/* Google Places Autocomplete Search - Primary Input */}
          <GooglePlacesSearch 
            onPlaceSelect={handlePlaceSelect}
            placeholder="Search your address, landmark, college..."
            disabled={isCalculating || isGettingLocation}
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
          
          {isCalculating && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculating delivery charge...
            </div>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Free delivery within 3km • Max delivery: {MAX_DELIVERY_DISTANCE_KM}km
        </p>
      </CardContent>
    </Card>
  );
}
