// __tests__/lib/cache.test.ts
import { CacheManager } from '@/lib/cache';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('CacheManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return cached data when not expired', async () => {
      const testData = { name: 'test' };
      const cacheItem = {
        data: testData,
        timestamp: Date.now() - 1000 // 1 second ago
      };
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(cacheItem));

      const result = await CacheManager.get('test-key');

      expect(result).toEqual(testData);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('hops_pins_cache_test-key');
    });

    it('should return null when cache is expired', async () => {
      const cacheItem = {
        data: { name: 'test' },
        timestamp: Date.now() - (30 * 24 * 60 * 60 * 1000 + 1000) // Expired (30 days + 1 second)
      };
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(cacheItem));
      mockAsyncStorage.removeItem.mockResolvedValueOnce();

      const result = await CacheManager.get('test-key');

      expect(result).toBeNull();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('hops_pins_cache_test-key');
    });

    it('should return null when no cached data exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await CacheManager.get('test-key');

      expect(result).toBeNull();
    });

    it('should handle JSON parse errors gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid-json');

      const result = await CacheManager.get('test-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set data in cache', async () => {
      const testData = { name: 'test' };
      
      await CacheManager.set('test-key', testData);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'hops_pins_cache_test-key',
        expect.stringContaining('"data":{"name":"test"}')
      );
    });

    it('should handle set errors gracefully', async () => {
      const testData = { name: 'test' };
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));

      // Should not throw
      await expect(CacheManager.set('test-key', testData)).resolves.not.toThrow();
    });
  });

  describe('remove', () => {
    it('should remove cached data', async () => {
      await CacheManager.remove('test-key');

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('hops_pins_cache_test-key');
    });

    it('should handle remove errors gracefully', async () => {
      mockAsyncStorage.removeItem.mockRejectedValueOnce(new Error('Remove error'));

      await expect(CacheManager.remove('test-key')).resolves.not.toThrow();
    });
  });
});