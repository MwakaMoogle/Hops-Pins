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
export interface PlacesSearchResponse {
  results: PlaceResult[];
  next_page_token?: string;
  status: string;
}

// KEEP your existing searchPubsNearby function but UPDATE it
export const searchPubsNearby = async (
  latitude: number, 
  longitude: number, 
  radius: number = 2000, // Reduced radius for better accuracy
  pageToken?: string
): Promise<PlacesSearchResponse> => {
  try {
    if (!GOOGLE_PLACES_API_KEY) {
      throw new AppError(
        'Google Places API key not configured',
        'CONFIG_ERROR',
        'Service configuration error. Please try again later.'
      );
    }

    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=bar&keyword=pub&key=${GOOGLE_PLACES_API_KEY}`;
    
    if (pageToken) {
      url += `&pagetoken=${pageToken}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new AppError(
        `HTTP error! status: ${response.status}`,
        'HTTP_ERROR',
        'Failed to fetch location data.'
      );
    }
    
    const data = await response.json();
    
    if (data.status === 'OK') {
      return {
        results: data.results.filter((place: any) => 
          place.name && place.geometry?.location
        ),
        next_page_token: data.next_page_token,
        status: data.status
      };
    } else if (data.status === 'ZERO_RESULTS') {
      return { results: [], status: data.status };
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

// ADD this new function for paginated search
export const searchAllPubsNearby = async (
  latitude: number, 
  longitude: number, 
  radius: number = 2000
): Promise<PlaceResult[]> => {
  let allResults: PlaceResult[] = [];
  let pageToken: string | undefined;
  let requestCount = 0;
  const maxRequests = 3; // Google allows max 3 pages (60 results)

  try {
    do {
      // Google requires a short delay between page requests
      if (pageToken) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const response: PlacesSearchResponse = await searchPubsNearby(
        latitude, longitude, radius, pageToken
      );
      
      allResults = [...allResults, ...response.results];
      pageToken = response.next_page_token;
      requestCount++;

      // Stop if no more pages or reached max requests
      if (!pageToken || requestCount >= maxRequests) {
        break;
      }

    } while (pageToken && requestCount < maxRequests);

    // Remove duplicates by place_id
    const uniqueResults = allResults.filter((pub, index, self) =>
      index === self.findIndex(p => p.place_id === pub.place_id)
    );

    return uniqueResults;
  } catch (error: any) {
    console.error('Error in paginated search:', error);
    // Return whatever we've collected so far
    return allResults;
  }
};

// KEEP your existing getPlaceDetails function
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