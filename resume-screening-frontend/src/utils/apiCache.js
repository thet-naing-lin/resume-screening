// Simple API response cache with TTL (time-to-live)
const CACHE_PREFIX = "api_cache_";
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get cached data for a given key
 * @param {string} key - Cache key (usually the API endpoint)
 * @returns {any|null} - Cached data or null if expired/not found
 */
export function getCachedData(key) {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Check if cache has expired
    if (now - timestamp > DEFAULT_TTL) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Set data in cache with current timestamp
 * @param {string} key - Cache key (usually the API endpoint)
 * @param {any} data - Data to cache
 */
export function setCachedData(key, data) {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheEntry));
  } catch {
    // localStorage might be full, ignore error
  }
}

/**
 * Clear cache for a specific key
 * @param {string} key - Cache key to clear
 */
export function clearCache(key) {
  localStorage.removeItem(CACHE_PREFIX + key);
}

/**
 * Clear all API cache entries
 */
export function clearAllCache() {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Clear cache entries matching a pattern
 * @param {string} pattern - Pattern to match (e.g., "jobs" clears /jobs, /jobs/123, etc.)
 */
export function clearCacheByPattern(pattern) {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(CACHE_PREFIX) && key.includes(pattern)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Higher-order function to wrap API calls with caching
 * @param {string} cacheKey - Cache key for this API call
 * @param {Function} apiCall - The actual API call function
 * @returns {Promise<any>} - API response (from cache or fresh)
 */
export async function withCache(cacheKey, apiCall) {
  // Try to get from cache first
  const cached = getCachedData(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // If not in cache, make the API call
  const response = await apiCall();

  // Store in cache
  setCachedData(cacheKey, response);

  return response;
}
