import { Injectable } from '@angular/core';

interface CacheEntry {
  value: any;
  expiresAt: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  private cache = new Map<string, CacheEntry>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutos

  constructor() { }

  put(url: string, response:any, ttlMs: number | null = this.defaultTTL): any {
    const expiresAt = ttlMs ? Date.now() + ttlMs : null;
    this.cache.set(url, { value: response, expiresAt });
  }

  get(url: string): any {
    const entry = this.cache.get(url);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(url);
      return null;
    }

    return entry.value;
  }

  clear(): void {
    this.cache.clear();
  }
}
