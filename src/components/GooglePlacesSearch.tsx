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
  toPlace?: () => google.maps.places.Place;
  legacyPrediction?: google.maps.places.AutocompletePrediction;
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
  const [useNewAutocompleteApi, setUseNewAutocompleteApi] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const legacyAutocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const legacyPlacesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const legacyServiceElRef = useRef<HTMLDivElement | null>(null);

  // Load Google Maps script
  useEffect(() => {
    console.log('[GooglePlaces] Checking for Google Maps API...');
    
    const ensureLegacyServices = () => {
      try {
        if (!window.google?.maps?.places) return;
        legacyAutocompleteRef.current = new window.google.maps.places.AutocompleteService();
        if (!legacyServiceElRef.current) {
          legacyServiceElRef.current = document.createElement('div');
        }
        legacyPlacesServiceRef.current = new window.google.maps.places.PlacesService(legacyServiceElRef.current);
      } catch (e) {
        console.error('[GooglePlaces] Failed to init legacy services:', e);
      }
    };

    const loadLibrary = async () => {
      try {
        // Mark loaded as soon as base maps JS is ready (so input isn't blocked)
        if (window.google?.maps) {
          setIsLoaded(true);
        }

        // Prefer new API when available
        if (window.google?.maps?.importLibrary) {
          console.log('[GooglePlaces] Loading places library via importLibrary...');
          const lib = await window.google.maps.importLibrary('places') as google.maps.PlacesLibrary;
          setPlacesLibrary(lib);
          setUseNewAutocompleteApi(!!(lib as any)?.AutocompleteSuggestion);
          console.log('[GooglePlaces] Places library loaded successfully');
          ensureLegacyServices();
          return;
        }

        // Fallback: legacy global namespace
        ensureLegacyServices();
      } catch (e) {
        console.error('[GooglePlaces] Error loading places library:', e);
        ensureLegacyServices();
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&v=weekly&region=IN&language=en`;
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
    if (!isLoaded) return;

    try {
      const TokenCtor = placesLibrary?.AutocompleteSessionToken || window.google?.maps?.places?.AutocompleteSessionToken;
      if (TokenCtor) {
        sessionTokenRef.current = new TokenCtor();
        console.log('[GooglePlaces] Session token created');
      }
    } catch (e) {
      console.error('[GooglePlaces] Failed to create session token:', e);
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
    console.log('[GooglePlaces] useNewAutocompleteApi:', useNewAutocompleteApi);
    
    if (input.length < 3) {
      setLastError(null);
      setPredictions([]);
      setShowResults(false);
      return;
    }

    if (!isLoaded) {
      console.log('[GooglePlaces] Skipping search - maps not loaded yet');
      // Important UX: user might type before Maps finishes loading. We'll re-run
      // automatically once isLoaded flips to true (see effect below).
      setLastError('Loading Google Maps…');
      setPredictions([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setLastError(null);
    
    try {
      // 1) New API path
      if (useNewAutocompleteApi && placesLibrary?.AutocompleteSuggestion) {
        console.log('[GooglePlaces] Calling fetchAutocompleteSuggestions (new API)...');

        const request: google.maps.places.AutocompleteRequest = {
          input,
          includedRegionCodes: ['in'],
          locationBias: {
            center: { lat: 18.5204, lng: 73.8567 },
            radius: 50000,
          },
          language: 'en-IN',
        };

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
                toPlace: () => prediction.toPlace(),
              };
            });

          setPredictions(formattedPredictions);
          setShowResults(true);
          return;
        }

        setPredictions([]);
        setShowResults(true);
        return;
      }

      // 2) Legacy fallback path
      console.log('[GooglePlaces] Falling back to legacy AutocompleteService...');
      const svc = legacyAutocompleteRef.current;
      if (!svc) {
        const msg = 'Google Places is not ready yet. Please try again in 2 seconds.';
        console.warn('[GooglePlaces] Legacy autocomplete service not ready');
        setLastError(msg);
        setPredictions([]);
        setShowResults(true);
        return;
      }

      const legacyRequest: google.maps.places.AutocompletionRequest = {
        input,
        componentRestrictions: { country: 'in' },
        // Bias around Pune
        location: new window.google!.maps.LatLng(18.5204, 73.8567),
        radius: 50000,
      };

      if (sessionTokenRef.current) {
        legacyRequest.sessionToken = sessionTokenRef.current;
      }

      const legacyPredictions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
        svc.getPlacePredictions(legacyRequest, (preds, status) => {
          if (status && status !== window.google!.maps.places.PlacesServiceStatus.OK) {
            return reject(new Error(`Legacy autocomplete failed: ${status}`));
          }
          resolve(preds || []);
        });
      });

      const formatted: PlacePrediction[] = legacyPredictions.map((p) => ({
        placeId: p.place_id,
        mainText: p.structured_formatting?.main_text || p.description.split(',')[0] || p.description,
        secondaryText: p.structured_formatting?.secondary_text || p.description,
        fullText: p.description,
        legacyPrediction: p,
      }));

      setPredictions(formatted);
      setShowResults(true);
    } catch (error: any) {
      const msg = error?.message || 'Failed to fetch location suggestions.';
      console.error('[GooglePlaces] Autocomplete error:', error);
      setLastError(msg);
      setPredictions([]);
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  }, [placesLibrary, isLoaded, useNewAutocompleteApi]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 3) {
      setLastError(null);
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

  // If the user typed while Maps was still loading, auto-run a search as soon
  // as we become ready.
  useEffect(() => {
    if (!isLoaded) return;
    if (query.length < 3) return;
    // Avoid double-fire while actively searching
    if (isSearching) return;
    searchPlaces(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const handleSelect = useCallback(async (prediction: PlacePrediction) => {
    try {
      console.log('[GooglePlaces] Fetching place details for:', prediction.placeId);

      // New API path
      if (useNewAutocompleteApi && prediction.toPlace) {
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
        }
      } else {
        // Legacy fallback path
        const svc = legacyPlacesServiceRef.current;
        if (!svc) throw new Error('Legacy PlacesService not ready');

        const place = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
          svc.getDetails(
            {
              placeId: prediction.placeId,
              fields: ['place_id', 'name', 'formatted_address', 'geometry'],
              sessionToken: sessionTokenRef.current || undefined,
            },
            (result, status) => {
              if (status === window.google!.maps.places.PlacesServiceStatus.OK && result) resolve(result);
              else reject(new Error(status));
            }
          );
        });

        const loc = place.geometry?.location;
        if (loc) {
          onPlaceSelect({
            placeId: place.place_id || prediction.placeId,
            formattedAddress: place.formatted_address || prediction.fullText,
            shortAddress: place.name || prediction.mainText,
            lat: loc.lat(),
            lng: loc.lng(),
          });

          setQuery(place.name || prediction.mainText);
        }
      }

      setShowResults(false);
      setPredictions([]);

      // Create a new session token for the next search
      try {
        const TokenCtor = placesLibrary?.AutocompleteSessionToken || window.google?.maps?.places?.AutocompleteSessionToken;
        if (TokenCtor) {
          sessionTokenRef.current = new TokenCtor();
          console.log('[GooglePlaces] Place selected, new session token created');
        }
      } catch {
        // ignore
      }
    } catch (error) {
      console.error('[GooglePlaces] Error fetching place details:', error);
    }
  }, [onPlaceSelect, placesLibrary, useNewAutocompleteApi]);

  const clearSearch = () => {
    setQuery('');
    setPredictions([]);
    setShowResults(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => predictions.length > 0 && setShowResults(true)}
          placeholder={isLoaded ? placeholder : 'Loading Google Maps… (you can type)'}
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
        {(isSearching || !isLoaded) && (
          <Loader2
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground",
              query ? "right-10" : "right-3"
            )}
          />
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
            {lastError ? (
              <>
                <p className="font-medium">{lastError}</p>
                <p className="text-xs mt-1">Try again, or use “Use My Current Location (GPS)”.</p>
              </>
            ) : (
              <>
                <p>No locations found for "{query}"</p>
                <p className="text-xs mt-1">Try searching for a landmark, area, or road name</p>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
