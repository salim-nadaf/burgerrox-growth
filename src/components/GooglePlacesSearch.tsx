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
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
  toPlace: () => google.maps.places.Place;
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
  const [placesLibrary, setPlacesLibrary] = useState<google.maps.PlacesLibrary | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load Google Maps script
  useEffect(() => {
    console.log('[GooglePlaces] Checking for Google Maps API...');
    
    const loadLibrary = async () => {
      try {
        if (window.google?.maps?.importLibrary) {
          console.log('[GooglePlaces] Loading places library via importLibrary...');
          const lib = await window.google.maps.importLibrary('places') as google.maps.PlacesLibrary;
          setPlacesLibrary(lib);
          setIsLoaded(true);
          console.log('[GooglePlaces] Places library loaded successfully');
          return;
        }
      } catch (e) {
        console.error('[GooglePlaces] Error loading places library:', e);
      }
    };

    if (window.google?.maps) {
      loadLibrary();
      return;
    }

    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    if (existingScript) {
      console.log('[GooglePlaces] Script exists, waiting for load...');
      existingScript.addEventListener('load', loadLibrary);
      return;
    }

    console.log('[GooglePlaces] Loading Google Maps script with key:', apiKey?.substring(0, 10) + '...');
    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    // Use the new loading pattern with loading=async for better performance
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = loadLibrary;
    script.onerror = (e) => console.error('[GooglePlaces] Failed to load Google Maps script:', e);
    document.head.appendChild(script);

    return () => {
      // Don't remove script on unmount - other components may need it
    };
  }, [apiKey]);

  // Create session token when library is loaded
  useEffect(() => {
    if (placesLibrary) {
      sessionTokenRef.current = new placesLibrary.AutocompleteSessionToken();
      console.log('[GooglePlaces] Session token created');
    }
  }, [placesLibrary]);

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

  // Debounced search using new Places API (AutocompleteSuggestion)
  const searchPlaces = useCallback(async (input: string) => {
    console.log('[GooglePlaces] searchPlaces called with:', input);
    console.log('[GooglePlaces] placesLibrary exists:', !!placesLibrary);
    
    if (!placesLibrary || input.length < 3) {
      console.log('[GooglePlaces] Skipping search - library not ready or input too short');
      setPredictions([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    console.log('[GooglePlaces] Calling fetchAutocompleteSuggestions (new API)...');
    
    try {
      const request: google.maps.places.AutocompleteRequest = {
        input,
        includedRegionCodes: ['in'], // India only
        locationBias: {
          center: { lat: 18.5204, lng: 73.8567 }, // Pune center
          radius: 50000 // 50km radius
        },
        language: 'en-IN',
      };

      // Add session token if available
      if (sessionTokenRef.current) {
        (request as any).sessionToken = sessionTokenRef.current;
      }

      const { suggestions } = await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
      
      console.log('[GooglePlaces] Autocomplete response - suggestions:', suggestions?.length || 0);
      
      if (suggestions && suggestions.length > 0) {
        const formattedPredictions: PlacePrediction[] = suggestions
          .filter(s => s.placePrediction)
          .map(s => {
            const prediction = s.placePrediction!;
            const text = prediction.text;
            const mainText = prediction.mainText;
            const secondaryText = prediction.secondaryText;
            
            return {
              placeId: prediction.placeId,
              mainText: mainText?.text || text?.text?.split(',')[0] || '',
              secondaryText: secondaryText?.text || text?.text || '',
              fullText: text?.text || '',
              toPlace: () => prediction.toPlace()
            };
          });
        
        setPredictions(formattedPredictions);
        setShowResults(true);
      } else {
        setPredictions([]);
        setShowResults(true); // Show "no results" message
      }
    } catch (error: any) {
      console.error('[GooglePlaces] Autocomplete error:', error);
      setPredictions([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  }, [placesLibrary]);

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

  const handleSelect = useCallback(async (prediction: PlacePrediction) => {
    if (!placesLibrary) return;

    try {
      console.log('[GooglePlaces] Fetching place details for:', prediction.placeId);
      
      const place = prediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'id']
      });

      const location = place.location;
      if (location) {
        const lat = location.lat();
        const lng = location.lng();
        
        onPlaceSelect({
          placeId: place.id || prediction.placeId,
          formattedAddress: place.formattedAddress || prediction.fullText,
          shortAddress: place.displayName || prediction.mainText,
          lat,
          lng
        });
        
        setQuery(place.displayName || prediction.mainText);
        setShowResults(false);
        setPredictions([]);
        
        // Create a new session token for the next search
        sessionTokenRef.current = new placesLibrary.AutocompleteSessionToken();
        console.log('[GooglePlaces] Place selected, new session token created');
      }
    } catch (error) {
      console.error('[GooglePlaces] Error fetching place details:', error);
    }
  }, [placesLibrary, onPlaceSelect]);

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
                key={prediction.placeId}
                onClick={() => handleSelect(prediction)}
                className={cn(
                  "w-full px-3 py-2 text-left hover:bg-accent transition-colors",
                  "flex items-start gap-2"
                )}
              >
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {prediction.mainText}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {prediction.secondaryText}
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
