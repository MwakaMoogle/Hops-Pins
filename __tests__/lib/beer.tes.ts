// __tests__/lib/api/beer.test.ts
import { Beer, getAllBeers, getBeerById, getRandomBeer, RequestBudget, searchBeers } from '@/lib/api/beer';
import { FirebaseBeerCache } from '@/lib/api/beerCache';
import { CacheManager } from '@/lib/cache';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('@/lib/cache');
jest.mock('@/lib/api/beerCache');
jest.mock('@react-native-async-storage/async-storage');

const mockCacheManagerGet = CacheManager.get as jest.MockedFunction<typeof CacheManager.get>;
const mockCacheManagerSet = CacheManager.set as jest.MockedFunction<typeof CacheManager.set>;
const mockFirebaseBeerCacheGet = FirebaseBeerCache.getCachedBeers as jest.MockedFunction<typeof FirebaseBeerCache.getCachedBeers>;
const mockFirebaseBeerCacheCache = FirebaseBeerCache.cacheBeers as jest.MockedFunction<typeof FirebaseBeerCache.cacheBeers>;
const mockFirebaseBeerCacheRecord = FirebaseBeerCache.recordSearch as jest.MockedFunction<typeof FirebaseBeerCache.recordSearch>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Beer API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    
    // Reset RequestBudget state
    jest.spyOn(RequestBudget, 'canMakeRequest').mockRestore();
    jest.spyOn(RequestBudget, 'recordRequest').mockRestore();
    jest.spyOn(RequestBudget, 'getCount').mockRestore();
  });

  describe('searchBeers', () => {
    const mockBeer: Beer = {
      id: '1',
      name: 'Test IPA',
      tagline: 'A test beer',
      first_brewed: '2020',
      description: 'A delicious test beer',
      image_url: 'test.jpg',
      abv: 6.5,
      ibu: 60,
      food_pairing: ['pizza', 'burgers']
    };

    it('should return cached results from local cache', async () => {
      mockCacheManagerGet.mockResolvedValueOnce([mockBeer]);
      
      const result = await searchBeers('ipa');

      expect(mockCacheManagerGet).toHaveBeenCalledWith('beer_search_ipa');
      expect(global.fetch).not.toHaveBeenCalled();
      expect(result).toEqual([mockBeer]);
    });

    it('should return cached results from Firebase cache', async () => {
      mockCacheManagerGet.mockResolvedValueOnce(null);
      mockFirebaseBeerCacheGet.mockResolvedValueOnce([mockBeer]);
      
      const result = await searchBeers('ipa');

      expect(mockFirebaseBeerCacheGet).toHaveBeenCalledWith('ipa');
      expect(mockCacheManagerSet).toHaveBeenCalledWith('beer_search_ipa', [mockBeer]);
      expect(result).toEqual([mockBeer]);
    });

    it('should make API call when no cache available', async () => {
      mockCacheManagerGet.mockResolvedValueOnce(null);
      mockFirebaseBeerCacheGet.mockResolvedValueOnce(null);
      
      // Mock API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: [{
            sku: '1',
            name: 'Test IPA',
            sub_category_3: 'IPA',
            description: 'A test beer',
            abv: '6.5%',
            ibu: '60',
            food_pairing: 'pizza,burgers',
            brewery: 'Test Brewery',
            region: 'Test Region'
          }]
        })
      });

      // Mock budget check
      jest.spyOn(RequestBudget, 'canMakeRequest').mockResolvedValueOnce(true);
      jest.spyOn(RequestBudget, 'recordRequest').mockResolvedValueOnce();

      const result = await searchBeers('ipa');

      expect(global.fetch).toHaveBeenCalled();
      expect(mockCacheManagerSet).toHaveBeenCalled();
      expect(mockFirebaseBeerCacheCache).toHaveBeenCalled();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('Test IPA');
    });

    it('should use fallback when API budget is exceeded', async () => {
      mockCacheManagerGet.mockResolvedValueOnce(null);
      mockFirebaseBeerCacheGet.mockResolvedValueOnce(null);
      
      jest.spyOn(RequestBudget, 'canMakeRequest').mockResolvedValueOnce(false);

      const result = await searchBeers('ipa');

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result.length).toBeGreaterThan(0); // Should return fallback data
    });

    it('should handle API errors gracefully', async () => {
      mockCacheManagerGet.mockResolvedValueOnce(null);
      mockFirebaseBeerCacheGet.mockResolvedValueOnce(null);
      
      jest.spyOn(RequestBudget, 'canMakeRequest').mockResolvedValueOnce(true);
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const result = await searchBeers('ipa');

      expect(result.length).toBeGreaterThan(0); // Should return fallback data
      expect(mockCacheManagerSet).toHaveBeenCalled();
    });

    it('should handle empty search term', async () => {
      const result = await searchBeers('   ');

      expect(result).toEqual([]);
      expect(mockCacheManagerGet).not.toHaveBeenCalled();
    });

    it('should record search for analytics', async () => {
      mockCacheManagerGet.mockResolvedValueOnce([mockBeer]);
      
      await searchBeers('ipa');

      expect(mockFirebaseBeerCacheRecord).toHaveBeenCalledWith('ipa');
    });
  });

  describe('getRandomBeer', () => {
    it('should return cached random beer', async () => {
      const mockBeer: Beer = {
        id: '1',
        name: 'Random Beer',
        tagline: 'Random',
        first_brewed: '2020',
        description: 'Random beer',
        image_url: 'random.jpg',
        abv: 5.0,
        ibu: 30,
        food_pairing: []
      };

      mockCacheManagerGet.mockResolvedValueOnce(mockBeer);

      const result = await getRandomBeer();

      expect(result).toEqual(mockBeer);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      mockCacheManagerGet.mockResolvedValueOnce(null);
      jest.spyOn(RequestBudget, 'canMakeRequest').mockResolvedValueOnce(true);
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const result = await getRandomBeer();

      expect(result).toBeDefined(); // Should return fallback beer
      expect(result!.name).toBeDefined();
    });

    it('should use fallback when budget is exceeded', async () => {
      mockCacheManagerGet.mockResolvedValueOnce(null);
      jest.spyOn(RequestBudget, 'canMakeRequest').mockResolvedValueOnce(false);

      const result = await getRandomBeer();

      expect(result).toBeDefined(); // Should return fallback beer
    });
  });

  describe('getBeerById', () => {
    it('should return beer by ID using search', async () => {
      const mockBeer: Beer = {
        id: '123',
        name: 'Specific Beer',
        tagline: 'Specific',
        first_brewed: '2020',
        description: 'Specific beer',
        image_url: 'specific.jpg',
        abv: 5.5,
        ibu: 40,
        food_pairing: []
      };

      // Mock searchBeers to return the specific beer
      const searchBeersMock = jest.spyOn(require('@/lib/api/beer'), 'searchBeers');
      searchBeersMock.mockResolvedValueOnce([mockBeer]);

      const result = await getBeerById('123');

      expect(result).toEqual(mockBeer);
      expect(searchBeersMock).toHaveBeenCalledWith('123');
    });

    it('should return null when no beer found', async () => {
      const searchBeersMock = jest.spyOn(require('@/lib/api/beer'), 'searchBeers');
      searchBeersMock.mockResolvedValueOnce([]);

      const result = await getBeerById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAllBeers', () => {
    it('should return paginated beers', async () => {
      const mockBeers: Beer[] = [
        {
          id: '1',
          name: 'Beer 1',
          tagline: 'Tagline 1',
          first_brewed: '2020',
          description: 'Description 1',
          image_url: 'beer1.jpg',
          abv: 5.0,
          ibu: 30,
          food_pairing: []
        },
        {
          id: '2',
          name: 'Beer 2',
          tagline: 'Tagline 2',
          first_brewed: '2020',
          description: 'Description 2',
          image_url: 'beer2.jpg',
          abv: 6.0,
          ibu: 40,
          food_pairing: []
        }
      ];

      const searchBeersMock = jest.spyOn(require('@/lib/api/beer'), 'searchBeers');
      searchBeersMock.mockResolvedValueOnce(mockBeers);

      const result = await getAllBeers(1, 2);

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Beer 1');
      expect(result[1].name).toBe('Beer 2');
    });
  });

  describe('RequestBudget', () => {
    beforeEach(() => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue();
    });

    it('should allow requests when under limit', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('100'); // 100 requests made

      const canMakeRequest = await RequestBudget.canMakeRequest();

      expect(canMakeRequest).toBe(true);
    });

    it('should block requests when over limit', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('500'); // 500 requests made (over 450 limit)

      const canMakeRequest = await RequestBudget.canMakeRequest();

      expect(canMakeRequest).toBe(false);
    });

    it('should record requests', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('100');

      await RequestBudget.recordRequest();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('beer_api_request_count', '101');
    });

    it('should get request count', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('150');

      const count = await RequestBudget.getCount();

      expect(count).toBe(150);
    });

    it('should handle missing count', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const count = await RequestBudget.getCount();

      expect(count).toBe(0);
    });
  });
});