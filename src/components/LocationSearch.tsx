import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Loader2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
}

interface LocationSearchProps {
  onLocationSelect: (location: {
    lat: number;
    lon: number;
    displayName: string;
    shortName: string;
  }) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function LocationSearch({ 
  onLocationSelect, 
  placeholder = "Search for area, landmark, or college...",
  disabled = false 
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Debounced search using Nominatim
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Search with Pune bias for better local results
        const searchQuery = query.toLowerCase().includes('pune') 
          ? query 
          : `${query}, Pune, Maharashtra, India`;
        
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('q', searchQuery);
        url.searchParams.set('format', 'json');
        url.searchParams.set('limit', '8');
        url.searchParams.set('countrycodes', 'in');
        url.searchParams.set('addressdetails', '1');
        // Bias towards Pune region
        url.searchParams.set('viewbox', '73.6,18.4,74.1,18.8');
        url.searchParams.set('bounded', '0');

        const response = await fetch(url.toString(), {
          headers: {
            'User-Agent': 'BurgerRox-Delivery-App/1.0'
          }
        });

        const data = await response.json();
        setResults(data || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSelect = (result: LocationResult) => {
    // Extract a shorter display name for UI
    const parts = result.display_name.split(',').map(p => p.trim());
    const shortName = parts.slice(0, 3).join(', ');
    
    onLocationSelect({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      displayName: result.display_name,
      shortName
    });
    
    setQuery(shortName);
    setShowResults(false);
    setResults([]);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const formatResultName = (result: LocationResult) => {
    const parts = result.display_name.split(',').map(p => p.trim());
    // Show first 2-3 parts as main, rest as subtitle
    const mainParts = parts.slice(0, 2).join(', ');
    const subParts = parts.slice(2, 4).join(', ');
    return { main: mainParts, sub: subParts };
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
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
      {showResults && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-64 overflow-y-auto bg-background border shadow-lg">
          <div className="py-1">
            {results.map((result) => {
              const { main, sub } = formatResultName(result);
              return (
                <button
                  key={result.place_id}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    "w-full px-3 py-2 text-left hover:bg-accent transition-colors",
                    "flex items-start gap-2"
                  )}
                >
                  <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{main}</p>
                    {sub && (
                      <p className="text-xs text-muted-foreground truncate">{sub}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* No results message */}
      {showResults && query.length >= 3 && !isSearching && results.length === 0 && (
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
