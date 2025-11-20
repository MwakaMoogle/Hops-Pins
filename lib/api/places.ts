// lib/api/places.ts
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
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
      return data.results;
    } else {
      console.error('Google Places API error:', data.status);
      return [];
    }
  } catch (error) {
    console.error('Error fetching nearby pubs:', error);
    return [];
  }
};

export const getPlaceDetails = async (placeId: string): Promise<PlaceResult | null> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,photos,opening_hours&key=${GOOGLE_PLACES_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.result;
    } else {
      console.error('Google Places details error:', data.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
};