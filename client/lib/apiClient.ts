interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class ApiClient {
  private cache: Map<string, CacheItem<any>> = new Map();
  private cacheDuration = 1000 * 60 * 5; // 5 دقائق افتراضياً

  // دالة لجلب البيانات مع الكاش
  async post<T>(endpoint: string, body: any, useCache = true): Promise<T> {
    const cacheKey = `${endpoint}:${JSON.stringify(body)}`;

    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        if (Date.now() - cached.timestamp < this.cacheDuration) {
          return cached.data;
        } else {
          this.cache.delete(cacheKey);
        }
      }
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // المتصفحات تضيف Accept-Encoding: gzip تلقائياً
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (useCache) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      }

      return data;
    } catch (error) {
      console.error(`[API Error] ${endpoint}`, error);
      throw error;
    }
  }

  // تنظيف الكاش
  clearCache() {
    this.cache.clear();
  }
}

export const apiClient = new ApiClient();
