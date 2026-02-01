import { useState, createContext, useContext } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DeliveryInfo {
  address: string;
  distanceKm: number;
  distanceText: string;
  durationText: string;
  charge: number;
  label: string;
  destinationAddress: string;
  placeId?: string;
  lat?: number;
  lng?: number;
}

interface DeliveryContextType {
  deliveryInfo: DeliveryInfo | null;
  isCalculating: boolean;
  calculateDeliveryFromPlace: (placeId: string, formattedAddress: string) => Promise<DeliveryInfo | null>;
  calculateDeliveryFromCoords: (lat: number, lon: number, areaName: string) => Promise<DeliveryInfo | null>;
  clearDelivery: () => void;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

// Restaurant location - Urban Forest, Mamurdi, Pune 412101
const RESTAURANT_LAT = 18.6298;
const RESTAURANT_LNG = 73.7997;

// Delivery charge tiers based on distance (in km) - fallback for local calculation
const DELIVERY_TIERS = [
  { maxDistance: 3, charge: 0, label: "Free Delivery" },
  { maxDistance: 5, charge: 50, label: "₹50 (3-5 km)" },
  { maxDistance: 7, charge: 75, label: "₹75 (5-7 km)" },
  { maxDistance: 10, charge: 105, label: "₹105 (7-10 km)" },
  { maxDistance: Infinity, charge: 175, label: "₹175 (10+ km)" }
];

// Haversine formula fallback
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

export function DeliveryProvider({ children }: { children: React.ReactNode }) {
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate using Google Distance Matrix API via edge function
  const calculateDeliveryFromPlace = async (placeId: string, formattedAddress: string): Promise<DeliveryInfo | null> => {
    setIsCalculating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('google-distance', {
        body: { placeId, formattedAddress }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to calculate distance');
      }

      const info: DeliveryInfo = {
        address: formattedAddress,
        distanceKm: data.distance.value,
        distanceText: data.distance.text,
        durationText: data.duration.text,
        charge: data.deliveryCharge,
        label: data.deliveryLabel,
        destinationAddress: data.destinationAddress,
        placeId,
        lat: data.destinationLat,
        lng: data.destinationLng
      };

      setDeliveryInfo(info);
      
      if (info.charge === 0) {
        toast({
          title: "Free Delivery!",
          description: `You're within 3km - delivery is FREE! (${info.distanceText})`,
        });
      } else {
        toast({
          title: "Delivery Calculated",
          description: `Distance: ${info.distanceText} - Delivery charge: ₹${info.charge}`,
        });
      }

      return info;
    } catch (error: any) {
      console.error('Error calculating delivery:', error);
      toast({
        title: "Calculation Error",
        description: error.message || "Failed to calculate delivery charge. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  // Calculate from coordinates (GPS or area selection) - uses Google Distance Matrix
  const calculateDeliveryFromCoords = async (lat: number, lon: number, areaName: string): Promise<DeliveryInfo | null> => {
    setIsCalculating(true);
    
    try {
      // Try Google Distance Matrix API first
      const { data, error } = await supabase.functions.invoke('google-distance', {
        body: { 
          destinationLat: lat, 
          destinationLng: lon, 
          formattedAddress: areaName 
        }
      });

      if (!error && data?.success) {
        const info: DeliveryInfo = {
          address: areaName,
          distanceKm: data.distance.value,
          distanceText: data.distance.text,
          durationText: data.duration.text,
          charge: data.deliveryCharge,
          label: data.deliveryLabel,
          destinationAddress: data.destinationAddress || areaName,
          lat: data.destinationLat,
          lng: data.destinationLng
        };

        setDeliveryInfo(info);
        
        if (info.charge === 0) {
          toast({
            title: "Free Delivery!",
            description: `You're within 3km - delivery is FREE! (${info.distanceText})`,
          });
        } else {
          toast({
            title: "Delivery Calculated",
            description: `Distance: ${info.distanceText} - Delivery charge: ₹${info.charge}`,
          });
        }

        return info;
      }

      // Fallback to Haversine calculation if API fails
      console.warn('Google API failed, using Haversine fallback:', error);
      
      const straightLineDistance = calculateHaversineDistance(
        RESTAURANT_LAT, RESTAURANT_LNG,
        lat, lon
      );
      
      const estimatedRoadDistance = straightLineDistance * 1.3;
      const roundedDistance = Math.round(estimatedRoadDistance * 10) / 10;
      
      const deliveryCharge = getDeliveryCharge(estimatedRoadDistance);
      const durationText = estimateDuration(estimatedRoadDistance);

      const info: DeliveryInfo = {
        address: areaName,
        distanceKm: roundedDistance,
        distanceText: `${roundedDistance} km`,
        durationText: durationText,
        charge: deliveryCharge.charge,
        label: deliveryCharge.label,
        destinationAddress: areaName,
        lat,
        lng: lon
      };

      setDeliveryInfo(info);
      
      if (info.charge === 0) {
        toast({
          title: "Free Delivery!",
          description: `You're within 3km - delivery is FREE! (${info.distanceText})`,
        });
      } else {
        toast({
          title: "Delivery Calculated",
          description: `Distance: ${info.distanceText} - Delivery charge: ₹${info.charge}`,
        });
      }

      return info;
    } catch (error: any) {
      console.error('Error calculating delivery:', error);
      toast({
        title: "Calculation Error",
        description: error.message || "Failed to calculate delivery charge. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  const clearDelivery = () => {
    setDeliveryInfo(null);
  };

  return (
    <DeliveryContext.Provider value={{
      deliveryInfo,
      isCalculating,
      calculateDeliveryFromPlace,
      calculateDeliveryFromCoords,
      clearDelivery
    }}>
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const context = useContext(DeliveryContext);
  if (context === undefined) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
}
