// __tests__/lib/api/beerCache.test.ts
import { Beer } from '@/lib/api/beer';
import { CachedBeerResult, FirebaseBeerCache } from '@/lib/api/beerCache';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc } from 'firebase/firestore';

// Mock Firebase
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockLimit = limit as jest.MockedFunction<typeof limit>;

describe('FirebaseBeerCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCachedBeers', () => {
    it('should return cached beers when found', async () => {
      const mockBeers: Beer[] = [
        {
          id: '1',
          name: 'Test IPA',
          tagline: 'A test beer',
          first_brewed: '2020',
          description: 'Test description',
          image_url: 'test.jpg',
          abv: 6.5,
          ibu: 60,
          food_pairing: ['pizza']
        }
      ];

      const cachedResult: CachedBeerResult = {
        searchTerm: 'ipa',
        beers: mockBeers,
        timestamp: new Date(),
        hitCount: 1
      };

      const mockDocSnap = {
        exists: jest.fn().mockReturnValue(true),
        data: jest.fn().mockReturnValue(cachedResult)
      };

      mockGetDoc.mockResolvedValueOnce(mockDocSnap as any);

      const result = await FirebaseBeerCache.getCachedBeers('ipa');

      expect(result).toEqual(mockBeers);
      expect(mockGetDoc).toHaveBeenCalledWith(expect.anything(), 'beerCache', 'ipa');
    });

    it('should update hit count when cache is accessed', async () => {
      const mockBeers: Beer[] = [];
      const cachedResult: CachedBeerResult = {
        searchTerm: 'ipa',
        beers: mockBeers,
        timestamp: new Date(),
        hitCount: 5
      };

      const mockDocSnap = {
        exists: jest.fn().mockReturnValue(true),
        data: jest.fn().mockReturnValue(cachedResult)
      };

      mockGetDoc.mockResolvedValueOnce(mockDocSnap as any);

      await FirebaseBeerCache.getCachedBeers('ipa');

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          hitCount: 6,
          lastAccessed: expect.any(Date)
        }),
        { merge: true }
      );
    });

    it('should return null when no cache found', async () => {
      const mockDocSnap = {
        exists: jest.fn().mockReturnValue(false)
      };

      mockGetDoc.mockResolvedValueOnce(mockDocSnap as any);

      const result = await FirebaseBeerCache.getCachedBeers('ipa');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      mockGetDoc.mockRejectedValueOnce(new Error('Firebase error'));

      const result = await FirebaseBeerCache.getCachedBeers('ipa');

      expect(result).toBeNull();
    });
  });

  describe('cacheBeers', () => {
    it('should cache beers successfully', async () => {
      const mockBeers: Beer[] = [
        {
          id: '1',
          name: 'Test IPA',
          tagline: 'A test beer',
          first_brewed: '2020',
          description: 'Test description',
          image_url: 'test.jpg',
          abv: 6.5,
          ibu: 60,
          food_pairing: ['pizza']
        }
      ];

      const result = await FirebaseBeerCache.cacheBeers('ipa', mockBeers);

      expect(result).toBe(true);
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          searchTerm: 'ipa',
          beers: mockBeers,
          hitCount: 1
        })
      );
    });

    it('should handle permission errors', async () => {
      const mockBeers: Beer[] = [];
      const error = { code: 'permission-denied' };
      mockSetDoc.mockRejectedValueOnce(error);

      const result = await FirebaseBeerCache.cacheBeers('ipa', mockBeers);

      expect(result).toBe(false);
    });

    it('should handle general errors', async () => {
      const mockBeers: Beer[] = [];
      mockSetDoc.mockRejectedValueOnce(new Error('General error'));

      const result = await FirebaseBeerCache.cacheBeers('ipa', mockBeers);

      expect(result).toBe(false);
    });
  });

  describe('getPopularSearches', () => {
    it('should return popular searches', async () => {
      const mockDocs = [
        {
          data: () => ({ searchTerm: 'ipa', hitCount: 100 })
        },
        {
          data: () => ({ searchTerm: 'lager', hitCount: 80 })
        },
        {
          data: () => ({ searchTerm: 'stout', hitCount: 60 })
        }
      ];

      const mockQuerySnapshot = {
        docs: mockDocs
      };

      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot as any);

      const result = await FirebaseBeerCache.getPopularSearches(3);

      expect(result).toEqual(['ipa', 'lager', 'stout']);
      expect(mockOrderBy).toHaveBeenCalledWith('hitCount', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(3);
    });

    it('should return empty array on error', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('Error'));

      const result = await FirebaseBeerCache.getPopularSearches(10);

      expect(result).toEqual([]);
    });
  });

  describe('recordSearch', () => {
    it('should record search successfully', async () => {
      const result = await FirebaseBeerCache.recordSearch('ipa');

      expect(result).toBe(true);
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          searchTerm: 'ipa',
          searchCount: 1
        }),
        { merge: true }
      );
    });

    it('should handle errors', async () => {
      mockSetDoc.mockRejectedValueOnce(new Error('Error'));

      const result = await FirebaseBeerCache.recordSearch('ipa');

      expect(result).toBe(false);
    });
  });
});