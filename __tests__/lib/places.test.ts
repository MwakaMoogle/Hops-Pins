// __tests__/lib/api/places.test.ts
import { getPlaceDetails, getPlacePhotoUrl, searchAllPubsNearby, searchPubsNearby, testPlacesApiAccess } from '@/lib/api/places';
import { CacheManager } from '@/lib/cache';

// Mock dependencies
jest.mock('@/lib/cache');

const mockCacheManagerGet = CacheManager.get as jest.MockedFunction<typeof CacheManager.get>;
const mockCacheManagerSet = CacheManager.set as jest.MockedFunction<typeof CacheManager.set>;

describe('Places API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getPlacePhotoUrl', () => {
    it('should generate correct photo URL', () => {
      const photoName = 'places/photo123';
      const url = getPlacePhotoUrl(photoName, 400, 400);
      
      expect(url).toBe('https://places.googleapis.com/v1/places/photo123/media?maxWidthPx=400&maxHeightPx=400&key=test-google-key');
    });

    it('should return empty string when API key is missing', () => {
      // Temporarily remove API key
      const originalKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
      delete process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
      
      const url = getPlacePhotoUrl('test', 400, 400);
      
      expect(url).toBe('');
      
      // Restore API key
      process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY = originalKey;
    });
  });

  describe('searchPubsNearby', () => {
    it('should successfully search nearby pubs', async () => {
      const mockResponse = {
        places: [
          {
            id: 'place1',
            displayName: { text: 'Test Pub' },
            formattedAddress: '123 Test St',
            location: { latitude: 51.5074, longitude: -0.1278 },
            photos: [
              {
                name: 'places/photo1',
                widthPx: 400,
                heightPx: 400,
                authorAttributions: []
              }
            ]
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const result = await searchPubsNearby(51.5074, -0.1278, 5000);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://places.googleapis.com/v1/places:searchNearby',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-Goog-Api-Key': 'test-google-key'
          })
        })
      );
      expect(result.places).toHaveLength(1);
      expect(result.places[0].displayName.text).toBe('Test Pub');
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      await expect(searchPubsNearby(51.5074, -0.1278, 5000)).rejects.toThrow();
    });

    it('should handle missing API key', async () => {
      const originalKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
      delete process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

      await expect(searchPubsNearby(51.5074, -0.1278, 5000)).rejects.toThrow('Google Places API key not configured');

      process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY = originalKey;
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(searchPubsNearby(51.5074, -0.1278, 5000)).rejects.toThrow();
    });
  });

  describe('searchAllPubsNearby', () => {
    it('should return cached results when available', async () => {
      const mockPlaces = [
        {
          id: 'place1',
          displayName: { text: 'Cached Pub' },
          formattedAddress: '123 Cached St',
          location: { latitude: 51.5074, longitude: -0.1278 }
        }
      ];

      mockCacheManagerGet.mockResolvedValueOnce(mockPlaces);

      const result = await searchAllPubsNearby(51.5074, -0.1278, 5000);

      expect(result).toEqual(mockPlaces);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should make API call when no cache available', async () => {
      mockCacheManagerGet.mockResolvedValueOnce(null);

      const mockResponse = {
        places: [
          {
            id: 'place1',
            displayName: { text: 'New Pub' },
            formattedAddress: '123 New St',
            location: { latitude: 51.5074, longitude: -0.1278 }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const result = await searchAllPubsNearby(51.5074, -0.1278, 5000);

      expect(global.fetch).toHaveBeenCalled();
      expect(mockCacheManagerSet).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.places);
    });

    it('should return cached data when API fails', async () => {
      mockCacheManagerGet.mockResolvedValueOnce(null);
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      mockCacheManagerGet.mockResolvedValueOnce([{ id: 'cached', displayName: { text: 'Cached' } }]);

      const result = await searchAllPubsNearby(51.5074, -0.1278, 5000);

      expect(result).toEqual([{ id: 'cached', displayName: { text: 'Cached' } }]);
    });

    it('should return empty array when API fails and no cache', async () => {
      mockCacheManagerGet.mockResolvedValueOnce(null);
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      mockCacheManagerGet.mockResolvedValueOnce(null);

      const result = await searchAllPubsNearby(51.5074, -0.1278, 5000);

      expect(result).toEqual([]);
    });
  });

  describe('testPlacesApiAccess', () => {
    it('should return true when API call succeeds', async () => {
      const mockResponse = {
        places: []
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const result = await testPlacesApiAccess(51.5074, -0.1278);
      
      expect(result).toBe(true);
    });

    it('should return false when API call fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const result = await testPlacesApiAccess(51.5074, -0.1278);
      
      expect(result).toBe(false);
    });
  });

  describe('getPlaceDetails', () => {
    it('should return cached place details', async () => {
      const mockPlace = {
        id: 'place1',
        displayName: { text: 'Test Pub' },
        formattedAddress: '123 Test St',
        location: { latitude: 51.5074, longitude: -0.1278 }
      };

      mockCacheManagerGet.mockResolvedValueOnce(mockPlace);

      const result = await getPlaceDetails('place1');

      expect(result).toEqual(mockPlace);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should make API call when no cache available', async () => {
      mockCacheManagerGet.mockResolvedValueOnce(null);

      const mockPlace = {
        id: 'place1',
        displayName: { text: 'Test Pub' },
        formattedAddress: '123 Test St',
        location: { latitude: 51.5074, longitude: -0.1278 }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockPlace
      });

      const result = await getPlaceDetails('place1');

      expect(global.fetch).toHaveBeenCalled();
      expect(mockCacheManagerSet).toHaveBeenCalled();
      expect(result).toEqual(mockPlace);
    });

    it('should handle API errors', async () => {
      mockCacheManagerGet.mockResolvedValueOnce(null);
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      await expect(getPlaceDetails('place1')).rejects.toThrow();
    });
  });
});