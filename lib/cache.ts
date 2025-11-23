// lib/cache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export class CacheManager {
  private static readonly CACHE_PREFIX = 'hops_pins_cache_';
  private static readonly BEER_TTL = 30 * 24 * 60 * 60 * 1000; // 30 DAYS for beer data
  private static readonly PLACES_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days for places data

  static async get<T>(key: string, ttl: number = this.BEER_TTL): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() - timestamp > ttl) {
        await this.remove(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key: string, data: any): Promise<void> {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(`${this.CACHE_PREFIX}${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  static async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter(key => key.startsWith(this.CACHE_PREFIX));
    } catch (error) {
      console.error('Cache getAllKeys error:', error);
      return [];
    }
  }

  static async getStats(): Promise<{ totalItems: number }> {
    try {
      const keys = await this.getAllKeys();
      return { totalItems: keys.length };
    } catch (error) {
      console.error('Cache getStats error:', error);
      return { totalItems: 0 };
    }
  }
}