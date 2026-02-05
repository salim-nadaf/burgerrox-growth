 import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
 import { MapPin, Loader2, Search, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
 import { supabase } from '@/integrations/supabase/client';

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
   apiKey?: string; // No longer needed, using server-side API
}

interface PlacePrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
   lat?: number;
   lng?: number;
}

 // Generate a simple session token
 function generateSessionToken(): string {
   return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export default function GooglePlacesSearch({ 
  onPlaceSelect, 
  placeholder = "Search for your delivery location...",
   disabled = false
}: GooglePlacesSearchProps) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
   
   // Memoize session token - changes only when a place is selected
   const sessionTokenRef = useRef<string>(generateSessionToken());

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

  // Search function
   const searchPlaces = useCallback(async (searchInput: string) => {
     if (searchInput.length < 3) {
      setPredictions([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
       const { data, error: apiError } = await supabase.functions.invoke('places-autocomplete', {
         body: {
           input: searchInput,
           sessionToken: sessionTokenRef.current,
         },
       });

       setIsSearching(false);

       if (apiError) {
         console.error('[GooglePlaces] API error:', apiError);
         setError('Search failed. Try again or use GPS.');
         setPredictions([]);
         setShowResults(true);
         return;
       }
 
       if (data?.predictions && data.predictions.length > 0) {
         setPredictions(data.predictions);
         setShowResults(true);
       } else if (data?.status === 'ZERO_RESULTS') {
         setPredictions([]);
         setShowResults(true);
       } else if (data?.error) {
         console.error('[GooglePlaces] Search error:', data.error);
         setError(data.error);
         setPredictions([]);
         setShowResults(true);
       } else {
         setPredictions([]);
         setShowResults(true);
       }
     } catch (err: unknown) {
      setIsSearching(false);
       const message = err instanceof Error ? err.message : 'Search failed';
       setError(message);
      setPredictions([]);
      setShowResults(true);
    }
   }, []);

  // Debounced search on query change
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

  // Handle place selection
   const handleSelect = useCallback(async (prediction: PlacePrediction) => {
     setIsSearching(true);
     setShowResults(false);
     
     try {
       // If prediction already has coordinates (from Geocoding API), use them directly
       if (prediction.lat && prediction.lng) {
         setIsSearching(false);
         onPlaceSelect({
           placeId: prediction.placeId,
           formattedAddress: prediction.fullText,
           shortAddress: prediction.mainText,
           lat: prediction.lat,
           lng: prediction.lng,
         });
 
         setQuery(prediction.mainText);
         setPredictions([]);
         
         // Generate new session token for next search
         sessionTokenRef.current = generateSessionToken();
         return;
       }
 
       // Fallback: fetch details if no coordinates in prediction
       const { data, error: apiError } = await supabase.functions.invoke('places-details', {
         body: {
           placeId: prediction.placeId,
         },
       });
 
       setIsSearching(false);
 
       if (apiError || data?.error) {
         console.error('[GooglePlaces] Details error:', apiError || data?.error);
         setError('Failed to get location details');
         return;
       }
 
       if (data?.lat && data?.lng) {
         onPlaceSelect({
           placeId: data.placeId || prediction.placeId,
           formattedAddress: data.formattedAddress || prediction.fullText,
           shortAddress: data.name || prediction.mainText,
           lat: data.lat,
           lng: data.lng,
         });
 
         setQuery(data.name || prediction.mainText);
         setPredictions([]);
         sessionTokenRef.current = generateSessionToken();
       } else {
         setError('Could not get location coordinates');
       }
     } catch (err: unknown) {
       setIsSearching(false);
       const message = err instanceof Error ? err.message : 'Failed to get details';
       setError(message);
    }
  }, [onPlaceSelect]);

  const clearSearch = () => {
    setQuery('');
    setPredictions([]);
    setShowResults(false);
    setError(null);
  };
 
   const retrySearch = () => {
     setError(null);
     if (query.length >= 3) {
       searchPlaces(query);
     }
   };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => predictions.length > 0 && setShowResults(true)}
          placeholder={placeholder}
         disabled={disabled || isSearching}
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

      {/* No results / Error message */}
      {showResults && query.length >= 3 && !isSearching && predictions.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 bg-background border shadow-lg">
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            {error ? (
              <>
                <p className="font-medium text-destructive">{error}</p>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={retrySearch}
                   className="mt-2"
                 >
                   <RefreshCw className="h-3 w-3 mr-1" />
                   Retry
                 </Button>
              </>
            ) : (
              <>
                <p>No locations found for "{query}"</p>
                <p className="text-xs mt-1">Try a landmark, area, or road name</p>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
