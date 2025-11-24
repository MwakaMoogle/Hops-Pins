// lib/api/places.ts - FIXED VERSION
import { CacheManager } from '@/lib/cache';
import { AppError, handleApiError } from '@/lib/errorHandler';

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

export interface PlaceResult {
  id: string;
  displayName: {
    text: string;
  };
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  photos?: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
    authorAttributions: Array<{
      displayName: string;
      photoUri: string;
      uri: string;
    }>;
  }>;
  rating?: number;
  userRatingCount?: number;
  currentOpeningHours?: {
    openNow: boolean;
    weekdayDescriptions: string[];
  };
  internationalPhoneNumber?: string;
  websiteUri?: string;
}

export interface PlacesSearchResponse {
  places: PlaceResult[];
}

// Generate cache key for location searches
const getPlacesCacheKey = (lat: number, lng: number, radius: number) => {
  return `places_v1_${lat.toFixed(4)}_${lng.toFixed(4)}_${radius}`;
};

// New Nearby Search using Places API v1 - SIMPLIFIED
export const searchPubsNearby = async (
  latitude: number, 
  longitude: number, 
  radius: number = 5000 // meters
): Promise<PlacesSearchResponse> => {
  try {
    if (!GOOGLE_PLACES_API_KEY) {
      throw new AppError(
        'Google Places API key not configured',
        'CONFIG_ERROR',
        'Service configuration error. Please try again later.'
      );
    }

    const url = `https://places.googleapis.com/v1/places:searchNearby`;
    
    // Simplified request body - only required fields
    const requestBody = {
      includedTypes: ['bar'],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: {
            latitude,
            longitude
          },
          radius
        }
      }
    };

    // Simplified field mask
    const fieldMask = 'places.id,places.displayName,places.formattedAddress,places.location,places.photos';

    console.log('🔍 Making Places API request...');
    console.log('📍 Location:', latitude, longitude);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': fieldMask
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Places API error:', errorText);
      throw new AppError(
        `HTTP error! status: ${response.status}`,
        'HTTP_ERROR',
        'Failed to fetch location data.'
      );
    }
    
    const data = await response.json();
    console.log('✅ Places API response received');
    
    if (data.places && data.places.length > 0) {
      console.log('📊 Total places found:', data.places.length);
      
      // Return all bars found (no filtering by name)
      return { places: data.places };
    } else {
      console.log('❌ No places found in response');
      return { places: [] };
    }
  } catch (error: any) {
    console.error('❌ Error in searchPubsNearby:', error);
    if (error instanceof AppError) throw error;
    throw handleApiError(error);
  }
};

// Get photo URL using new Places API v1
export const getPlacePhotoUrl = (photoName: string, maxWidth: number = 400, maxHeight: number = 400): string => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn('Google Places API key not configured for photos');
    return '';
  }
  
  // New Places API v1 photo URL format
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}&key=${apiKey}`;
};

// Updated searchAllPubsNearby for new API
export const searchAllPubsNearby = async (
  latitude: number, 
  longitude: number, 
  radius: number = 5000
): Promise<PlaceResult[]> => {
  // Check cache first
  const cacheKey = getPlacesCacheKey(latitude, longitude, radius);
  const cached = await CacheManager.get<PlaceResult[]>(cacheKey);
  
  if (cached) {
    console.log('📦 Using cached pub results for location');
    return cached;
  }

  try {
    const response: PlacesSearchResponse = await searchPubsNearby(latitude, longitude, radius);
    
    if (response.places.length === 0) {
      console.log('❌ No pubs found in search');
      return [];
    }

    console.log(`✅ Found ${response.places.length} places with new API`);
    
    // Cache the results
    await CacheManager.set(cacheKey, response.places);
    console.log(`✅ Cached ${response.places.length} places for location`);

    return response.places;
  } catch (error: any) {
    console.error('Error in searchAllPubsNearby:', error);
    
    // Try to return cached data even if API fails
    const cached = await CacheManager.get<PlaceResult[]>(cacheKey);
    if (cached) {
      console.log('🔄 Using cached pub data due to API error');
      return cached;
    }
    
    return [];
  }
};

// Test function to verify API access - NOW EXPORTED
export const testPlacesApiAccess = async (latitude: number, longitude: number): Promise<boolean> => {
  try {
    console.log('🧪 Testing Places API access...');
    const response = await searchPubsNearby(latitude, longitude, 1000);
    console.log('✅ Places API test successful');
    console.log(`📊 Found ${response.places.length} places in test`);
    return true;
  } catch (error: any) {
    console.error('❌ Places API test failed:', error);
    return false;
  }
};

// Get place details using new API
export const getPlaceDetails = async (placeId: string): Promise<PlaceResult | null> => {
  // Check cache first for place details
  const cacheKey = `place_details_v1_${placeId}`;
  const cached = await CacheManager.get<PlaceResult>(cacheKey);
  
  if (cached) {
    console.log('📦 Using cached place details');
    return cached;
  }

  try {
    if (!GOOGLE_PLACES_API_KEY) {
      throw new AppError('Google Places API key not configured', 'CONFIG_ERROR');
    }

    const url = `https://places.googleapis.com/v1/places/${placeId}`;
    
    const fieldMask = 'id,displayName,formattedAddress,location,photos,rating,userRatingCount,currentOpeningHours,internationalPhoneNumber,websiteUri';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': fieldMask
      }
    });
    
    if (!response.ok) {
      throw new AppError(`HTTP error! status: ${response.status}`, 'HTTP_ERROR');
    }
    
    const data = await response.json();
    
    if (data) {
      // Cache the place details
      await CacheManager.set(cacheKey, data);
      return data;
    } else {
      throw new AppError('Place not found', 'PLACES_API_ERROR');
    }
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw handleApiError(error);
  }
};