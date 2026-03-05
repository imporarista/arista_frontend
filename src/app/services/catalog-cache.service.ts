import { Injectable } from '@angular/core';
import { Product } from '../interfaces/product';

export interface CatalogCacheState {
  products: Product[];
  scrollPosition: number;
  start: number;
  limit: number;
  finished: boolean;
  cat_id?: number;
  subc_id?: number;
  statusProduct?: string;
  searchProduct?: string;
  priceRateId?: number;
  layoutView: string;
  grid: string;
  timestamp: number;
}

interface SavedCatalogCache {
  state: CatalogCacheState;
  expiresAt: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogCacheService {
  private readonly storageKeyPrefix = 'catalog_state';
  private readonly storage: Storage | null = typeof window !== 'undefined' ? window.sessionStorage : null;

  constructor() {}

  saveState(key: string, state: CatalogCacheState, ttlMs: number): void {
    if (!this.storage) return;
    const entry: SavedCatalogCache = {
      state,
      expiresAt: ttlMs ? Date.now() + ttlMs : null
    };
    this.storage.setItem(this.buildKey(key), JSON.stringify(entry));
  }

  loadState(key: string): CatalogCacheState | null {
    if (!this.storage) return null;
    const raw = this.storage.getItem(this.buildKey(key));
    if (!raw) return null;

    try {
      const parsed: SavedCatalogCache = JSON.parse(raw);
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        this.storage.removeItem(this.buildKey(key));
        return null;
      }
      return parsed.state;
    } catch (error) {
      this.storage.removeItem(this.buildKey(key));
      return null;
    }
  }

  clearState(key: string): void {
    if (!this.storage) return;
    this.storage.removeItem(this.buildKey(key));
  }

  private buildKey(key: string): string {
    return `${this.storageKeyPrefix}-${key}`;
  }
}
