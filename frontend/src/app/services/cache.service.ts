import { Injectable } from '@angular/core';

export interface CacheItem<T> {
    data: T;
    timestamp: number;
    ttl: number;
    key: string;
}

export interface CacheOptions {
    ttl?: number; // Time to live in milliseconds
    maxSize?: number; // Maximum number of items in cache
    priority?: 'low' | 'normal' | 'high';
}

@Injectable({
    providedIn: 'root'
})
export class CacheService {
    private cache = new Map<string, CacheItem<any>>();
    private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
    private readonly DEFAULT_MAX_SIZE = 100;
    private readonly MAX_SIZE = 200;

    constructor() {
        // Clean up expired items every minute
        setInterval(() => {
            this.cleanup();
        }, 60 * 1000);
    }

    /**
     * Get item from cache
     */
    get<T>(key: string): T | null {
        const item = this.cache.get(key);

        if (!item) {
            return null;
        }

        // Check if item has expired
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    /**
     * Set item in cache
     */
    set<T>(key: string, data: T, options: CacheOptions = {}): void {
        const ttl = options.ttl || this.DEFAULT_TTL;
        const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE;

        // Check if cache is full and cleanup if necessary
        if (this.cache.size >= maxSize) {
            this.evictOldest();
        }

        const item: CacheItem<T> = {
            data,
            timestamp: Date.now(),
            ttl,
            key
        };

        this.cache.set(key, item);
    }

    /**
     * Check if item exists in cache and is not expired
     */
    has(key: string): boolean {
        const item = this.cache.get(key);

        if (!item) {
            return false;
        }

        // Check if item has expired
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Remove item from cache
     */
    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Clear all items from cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
        missRate: number;
    } {
        const totalRequests = this.hitCount + this.missCount;
        const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0;
        const missRate = totalRequests > 0 ? this.missCount / totalRequests : 0;

        return {
            size: this.cache.size,
            maxSize: this.MAX_SIZE,
            hitRate,
            missRate
        };
    }

    /**
     * Get or set with automatic fallback
     */
    async getOrSet<T>(
        key: string,
        fetchFn: () => Promise<T>,
        options: CacheOptions = {}
    ): Promise<T> {
        // Try to get from cache first
        const cached = this.get<T>(key);
        if (cached !== null) {
            this.hitCount++;
            return cached;
        }

        this.missCount++;

        // Fetch data if not in cache
        try {
            const data = await fetchFn();
            this.set(key, data, options);
            return data;
        } catch (error) {
            // If fetch fails, try to return stale data if available
            const staleItem = this.cache.get(key);
            if (staleItem) {
                console.warn('Using stale cache data due to fetch error:', error);
                return staleItem.data;
            }
            throw error;
        }
    }

    /**
     * Cache API responses with automatic key generation
     */
    async cacheApiResponse<T>(
        url: string,
        fetchFn: () => Promise<T>,
        options: CacheOptions = {}
    ): Promise<T> {
        const cacheKey = `api:${this.hashString(url)}`;
        return this.getOrSet(cacheKey, fetchFn, options);
    }

    /**
     * Cache user-specific data
     */
    async cacheUserData<T>(
        userId: string,
        dataKey: string,
        fetchFn: () => Promise<T>,
        options: CacheOptions = {}
    ): Promise<T> {
        const cacheKey = `user:${userId}:${dataKey}`;
        return this.getOrSet(cacheKey, fetchFn, options);
    }

    /**
     * Invalidate all cache entries matching a pattern
     */
    invalidatePattern(pattern: string): void {
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Invalidate all user-specific cache entries
     */
    invalidateUserData(userId: string): void {
        this.invalidatePattern(`^user:${userId}:`);
    }

    /**
     * Invalidate all API cache entries
     */
    invalidateApiCache(): void {
        this.invalidatePattern('^api:');
    }

    /**
     * Preload data into cache
     */
    async preload<T>(
        key: string,
        fetchFn: () => Promise<T>,
        options: CacheOptions = {}
    ): Promise<void> {
        try {
            const data = await fetchFn();
            this.set(key, data, options);
        } catch (error) {
            console.warn('Failed to preload cache:', error);
        }
    }

    // Private properties for statistics
    private hitCount = 0;
    private missCount = 0;

    /**
     * Clean up expired items
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Evict oldest items when cache is full
     */
    private evictOldest(): void {
        let oldestKey: string | null = null;
        let oldestTime = Date.now();

        for (const [key, item] of this.cache.entries()) {
            if (item.timestamp < oldestTime) {
                oldestTime = item.timestamp;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }

    /**
     * Simple string hashing function
     */
    private hashString(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }
} 