// lib/api/places.ts
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  vicinity?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  photos?: Array<{
    photo_reference: string;
  }>;
  opening_hours?: {
    open_now: boolean;
  };
}

export const searchPubsNearby = async (latitude: number, longitude: number, radius: number = 5000): Promise<PlaceResult[]> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=bar&keyword=pub&key=${GOOGLE_PLACES_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK') {
      // Filter out invalid results
      return data.results.filter((place: any) => 
        place.name && place.geometry?.location
      );
    } else {
      console.error('Google Places API error:', data.status);
      return [];
    }
  } catch (error) {
    console.error('Error fetching nearby pubs:', error);
    return [];
  }
};