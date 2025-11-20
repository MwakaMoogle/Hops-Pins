// lib/api/places.ts
import { AppError, handleApiError } from '@/lib/errorHandler';
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
    if (!GOOGLE_PLACES_API_KEY) {
      throw new AppError(
        'Google Places API key not configured',
        'CONFIG_ERROR',
        'Service configuration error. Please try again later.'
      );
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=bar&keyword=pub&key=${GOOGLE_PLACES_API_KEY}`
    );
    
    if (!response.ok) {
      throw new AppError(
        `HTTP error! status: ${response.status}`,
        'HTTP_ERROR',
        'Failed to fetch location data.'
      );
    }
    
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.results.filter((place: any) => 
        place.name && place.geometry?.location
      );
    } else if (data.status === 'ZERO_RESULTS') {
      return [];
    } else {
      throw new AppError(
        `Google Places API error: ${data.status}`,
        'PLACES_API_ERROR',
        'Unable to search for pubs at this time.'
      );
    }
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw handleApiError(error);
  }
};

export const getPlaceDetails = async (placeId: string): Promise<PlaceResult | null> => {
  try {
    if (!GOOGLE_PLACES_API_KEY) {
      throw new AppError('Google Places API key not configured', 'CONFIG_ERROR');
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,photos,opening_hours&key=${GOOGLE_PLACES_API_KEY}`
    );
    
    if (!response.ok) {
      throw new AppError(`HTTP error! status: ${response.status}`, 'HTTP_ERROR');
    }
    
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.result;
    } else {
      throw new AppError(`Google Places details error: ${data.status}`, 'PLACES_API_ERROR');
    }
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw handleApiError(error);
  }
};