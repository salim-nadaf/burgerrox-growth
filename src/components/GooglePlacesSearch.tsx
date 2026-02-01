/// <reference types="google.maps" />
import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Loader2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    google?: typeof google;
  }
}

// Load Google Maps script
const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script';

interface GooglePlacesSearchProps {
  onPlaceSelect: (place: {
    placeId: string;
    formattedAddress: string;
    shortAddress: string;
    lat: number;
    lng: number;
  }) => void;
  placeholder?: string;
  disabled?: boolean;
  apiKey: string;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export default function GooglePlacesSearch({ 
  onPlaceSelect, 
  placeholder = "Search for your delivery location...",
  disabled = false,
  apiKey
}: GooglePlacesSearchProps) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error('Failed to load Google Maps script');
    document.head.appendChild(script);

    return () => {
      // Don't remove script on unmount - other components may need it
    };
  }, [apiKey]);

  // Initialize services when loaded
  useEffect(() => {
    if (isLoaded && window.google?.maps?.places) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      // Create a dummy div for PlacesService (required by API)
      const dummyDiv = document.createElement('div');
      placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv);
    }
  }, [isLoaded]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const searchPlaces = useCallback((input: string) => {
    if (!autocompleteServiceRef.current || input.length < 3) {
      setPredictions([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    autocompleteServiceRef.current.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: 'in' },
        // Bias towards Pune
        locationBias: new google.maps.Circle({
          center: { lat: 18.5204, lng: 73.8567 }, // Pune center
          radius: 50000 // 50km radius
        }),
        types: ['establishment', 'geocode']
      },
      (results, status) => {
        setIsSearching(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results as PlacePrediction[]);
          setShowResults(true);
        } else {
          setPredictions([]);
          if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            console.error('Places autocomplete error:', status);
          }
        }
      }
    );
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 3) {
      setPredictions([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchPlaces(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchPlaces]);

  const handleSelect = useCallback((prediction: PlacePrediction) => {
    if (!placesServiceRef.current) return;

    placesServiceRef.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['geometry', 'formatted_address', 'name']
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          onPlaceSelect({
            placeId: prediction.place_id,
            formattedAddress: place.formatted_address || prediction.description,
            shortAddress: prediction.structured_formatting?.main_text || prediction.description.split(',')[0],
            lat,
            lng
          });
          
          setQuery(prediction.structured_formatting?.main_text || prediction.description.split(',')[0]);
          setShowResults(false);
          setPredictions([]);
        }
      }
    );
  }, [onPlaceSelect]);

  const clearSearch = () => {
    setQuery('');
    setPredictions([]);
    setShowResults(false);
  };

  if (!isLoaded) {
    return (
      <div className="relative w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Loading Google Maps..."
            disabled
            className="pl-9 pr-9 bg-background"
          />
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => predictions.length > 0 && setShowResults(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-9 pr-9 bg-background"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isSearching && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Results dropdown */}
      {showResults && predictions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-64 overflow-y-auto bg-background border shadow-lg">
          <div className="py-1">
            {predictions.map((prediction) => (
              <button
                key={prediction.place_id}
                onClick={() => handleSelect(prediction)}
                className={cn(
                  "w-full px-3 py-2 text-left hover:bg-accent transition-colors",
                  "flex items-start gap-2"
                )}
              >
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {prediction.structured_formatting?.main_text || prediction.description.split(',')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {prediction.structured_formatting?.secondary_text || prediction.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <div className="px-3 py-2 border-t">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <img 
                src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png" 
                alt="Powered by Google" 
                className="h-3"
              />
            </p>
          </div>
        </Card>
      )}

      {/* No results message */}
      {showResults && query.length >= 3 && !isSearching && predictions.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 bg-background border shadow-lg">
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            <p>No locations found for "{query}"</p>
            <p className="text-xs mt-1">Try searching for a landmark, area, or road name</p>
          </div>
        </Card>
      )}
    </div>
  );
}
