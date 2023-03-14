/**
 * Cache Service 
 */
 export interface CacheService {
    /**
     * Returns the value in cache for the given key.
     */
    get(key: string):Promise<string|undefined>;

    put(key: string, value: string):Promise<boolean>;
}