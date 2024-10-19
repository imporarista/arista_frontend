import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  private chache: Map<string, any> = new Map();
  constructor() { }

  put(url: string, response:any): any {
    this.chache.set(url, response);
  }

  get(url: string): any {
    return this.chache.get(url);
  }

  clear(): void {
    this.chache.clear();
  }
}
