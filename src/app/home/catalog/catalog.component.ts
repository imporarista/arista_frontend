import { ApiService } from 'src/app/services/api.service';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { ProductService } from 'src/app/shared/services/product.service';
import { Product } from 'src/app/interfaces/product';
import { CatalogCacheService, CatalogCacheState } from 'src/app/services/catalog-cache.service';
import { DesiredProductsService } from 'src/app/services/desired-products.service';
import { Category } from 'src/app/interfaces/category';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit, OnDestroy, AfterViewInit {
  private categories: Category[];
  private cat_id: number;
  private limit: number;
  private loading: boolean = false;
  private priceRateId: number;
  private readFromDB: boolean;
  private searchProduct: string;
  private start: number;
  private subc_id: number;
  private shouldRestoreScroll: boolean = false; // NUEVO
  private pinnedProductIds: number[] = [];
  private pinnedProductNames: string[] = ['04941', '04948', '04943', '04949'];
  private restoredScrollPosition: number = 0;
  private readonly CACHE_KEY_PREFIX = 'catalog_state';
  private readonly CACHE_TTL = 15 * 60 * 1000;
  
  public aristaLogo = 'assets/appImages/logoMenu.svg';
  public category: string;
  public finished: boolean;
  public grid: string = 'col-xl-3 col-md-6';
  public layoutView: string = 'grid-view';
  public products: Product[] = [];
  public statusProduct: string;

  currentTax = 0.19;
  detailOrder = {
    subtotal: 0,
    tax: 0,
    total: 0
  };


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller,
    public productService: ProductService,
    private apiService: ApiService,
    private catalogCacheService: CatalogCacheService,
    public desiredProduct: DesiredProductsService,
  ) {
    this.categories = [];
    this.category = 'Todos';
    this.initData();
    this.getParams();
  }

  initData() {
    this.start = 0;
    this.limit = 250;
    this.finished = false;
    this.priceRateId = 0;
    this.statusProduct = '';
    this.searchProduct = '';
    this.cat_id = undefined;
    this.subc_id = undefined;
    this.priceRateId = 1;
    this.loading = false;
    this.readFromDB = true;

    // Cargar IDs fijados desde localStorage (ej: [101,202,303,404])
    try {
      const defaultPinned: number[] = [];
      const pinned = localStorage.getItem('pinnedProductIds');
      const parsed = pinned ? JSON.parse(pinned) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        this.pinnedProductIds = parsed
          .map((n: any) => Number(n))
          .filter((n: number, idx: number, arr: number[]) => Number.isFinite(n) && arr.indexOf(n) === idx);
      } else {
        this.pinnedProductIds = defaultPinned;
      }
    } catch (e) {
      this.pinnedProductIds = [];
    }
    console.log('[CatalogComponent] pinnedProductIds loaded:', this.pinnedProductIds);

    // Productos fijados por NOMBRE (sin usar localStorage)
    this.pinnedProductNames = ['04941', '04948', '04943', '04949'];
    console.log('[CatalogComponent] pinnedProductNames loaded:', this.pinnedProductNames);
  }

  getParams() {
    this.start = 0;
    this.route.queryParams.subscribe(params => {
      const newStatus = params.status !== undefined ? params.status : '';
      
      if (newStatus !== this.statusProduct) {
        this.clearSavedState();
      }
      
      this.statusProduct = newStatus;
      this.searchProduct = params.search ? params.search : '';
      
      if (this.tryRestoreState()) {
        return; 
      }

      this.start = 0;
      this.loadProducts(true);
    });

    this.route.params.subscribe(params => {
      this.cat_id = params['cat_id'];
      
      if (this.cat_id) {
        const selectedCategory = this.categories.find(category => category.cat_id === this.cat_id);
        this.category = selectedCategory ? selectedCategory.cat_name : 'Todos';
      } else {
        this.category = 'Todos';
      }

      this.subc_id = params['subc_id'];
      this.priceRateId = Number(localStorage.getItem('price_rate_id')) || 1;

      if (this.tryRestoreState()) {
        return;
      }

      this.start = 0;
      this.loadProducts(true);
    });
  }

  ngOnInit(): void {
    this.apiService.getCategories(localStorage.getItem('user_id')).subscribe((categories) => {
      this.categories = categories;
    });
  }

  ngAfterViewInit(): void {
    if (!this.shouldRestoreScroll) {
      return;
    }

    const scrollPosition = this.restoredScrollPosition || 0;
    const canScroll = typeof window !== 'undefined' && scrollPosition > 0;

    if (canScroll) {
      setTimeout(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: 'auto'
        });
        this.shouldRestoreScroll = false;
      }, 100);
    } else {
      this.shouldRestoreScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.saveCurrentState();
  }

  private saveCurrentState(): void {
    try {
      const scrollPosition = this.getScrollPosition();
      const state: CatalogCacheState = {
        products: this.products,
        scrollPosition,
        start: this.start,
        limit: this.limit,
        finished: this.finished,
        cat_id: this.cat_id,
        subc_id: this.subc_id,
        statusProduct: this.statusProduct,
        searchProduct: this.searchProduct,
        priceRateId: this.priceRateId,
        layoutView: this.layoutView,
        grid: this.grid,
        timestamp: Date.now()
      };

      const cacheKey = this.buildCacheKey();
      this.catalogCacheService.saveState(cacheKey, state, this.CACHE_TTL);
    } catch (error) {
      console.error('Error al guardar estado:', error);
    }
  }

  private tryRestoreState(): boolean {
    const cacheKey = this.buildCacheKey();
    const savedState = this.catalogCacheService.loadState(cacheKey);

    if (!savedState) {
      this.restoredScrollPosition = 0;
      return false;
    }

    const paramsMatch =
      savedState.cat_id === this.cat_id &&
      savedState.subc_id === this.subc_id &&
      savedState.statusProduct === this.statusProduct &&
      savedState.searchProduct === this.searchProduct &&
      savedState.priceRateId === this.priceRateId;

    if (!paramsMatch) {
      this.catalogCacheService.clearState(cacheKey);
      this.restoredScrollPosition = 0;
      return false;
    }

    const restoredProducts = this.productService.sortByStatusPriority(
      this.reorderPinned(
        this.applyOutletFilter(savedState.products || [])
      )
    );

    this.products = restoredProducts;
    this.start = savedState.start || 0;
    this.limit = savedState.limit || this.limit;
    this.finished = savedState.finished || false;
    this.layoutView = savedState.layoutView || this.layoutView;
    this.grid = savedState.grid || this.grid;
    this.shouldRestoreScroll = true;
    this.restoredScrollPosition = savedState.scrollPosition || 0;

    return true;
  }

  private clearSavedState(): void {
    try {
      const cacheKey = this.buildCacheKey();
      this.catalogCacheService.clearState(cacheKey);
      this.restoredScrollPosition = 0;
      this.shouldRestoreScroll = false;
    } catch (error) {
      console.error('Error al limpiar estado:', error);
    }
  }

  private buildCacheKey(): string {
    const catPart = this.cat_id ?? 'all';
    const subPart = this.subc_id ?? 'none';
    const statusPart = this.normalizeCacheToken(this.statusProduct, 'all');
    const searchPart = this.normalizeCacheToken(this.searchProduct, 'none');
    const priceRatePart = this.priceRateId ?? 0;
    return `${this.CACHE_KEY_PREFIX}-${catPart}-${subPart}-${statusPart}-${searchPart}-${priceRatePart}`;
  }

  private normalizeCacheToken(value: string, fallback: string): string {
    if (!value || value === 'undefined') {
      return fallback;
    }
    return value;
  }

  private getScrollPosition(): number {
    if (typeof window === 'undefined') {
      return 0;
    }
    const doc = typeof document !== 'undefined' ? document.documentElement : null;
    return window.pageYOffset || (doc && doc.scrollTop) || 0;
  }

  private applyOutletFilter(products: Product[]): Product[] {
    const isTodosView = !this.statusProduct || 
                        this.statusProduct === '' || 
                        this.statusProduct === 'undefined';
    
    if (isTodosView) {
      return products.filter(product => product.status != 4);
    }
    
    return products;
  }

  loadProducts(resetList: boolean): void {
    if (resetList) {
      this.clearSavedState();
    }

    if (!this.loading && this.readFromDB) {
      this.loading = true;
      let selector = 'all';
      let id = null;
      
      if (typeof (this.subc_id) !== 'undefined') {
        selector = 'subCategory';
        id = this.subc_id;
      } else if (typeof (this.cat_id) !== 'undefined') {
        selector = 'category';
        id = this.cat_id;
      } else if (this.searchProduct !== '') {
        selector = 'search';
        id = this.searchProduct;
      }
      
      this.apiService.getProducts(selector, id, this.start, this.limit, this.statusProduct, this.priceRateId).subscribe(
        (products) => {
          this.loading = false;
          
          const filteredProducts = this.applyOutletFilter(products);
          const receivedCount = Array.isArray(products) ? products.length : 0;
          const focoReceived = Array.isArray(products)
            ? products.filter(product => Number((product as any).status) === 7)
            : [];
          const focoFiltered = Array.isArray(filteredProducts)
            ? filteredProducts.filter(product => Number((product as any).status) === 7)
            : [];

          console.log('[CatalogComponent] loadProducts response', {
            selector,
            id,
            resetList,
            startRequested: this.start,
            limit: this.limit,
            statusProduct: this.statusProduct,
            receivedCount,
            filteredCount: filteredProducts.length,
            focoReceivedCount: focoReceived.length,
            focoFilteredCount: focoFiltered.length,
            focoReceivedIds: focoReceived.slice(0, 10).map(product => ({
              prod_id: (product as any).prod_id,
              prod_name: (product as any).prod_name,
              status: (product as any).status
            }))
          });
          
          if (resetList) {
            this.products = this.reorderPinned(filteredProducts);
            this.products = this.productService.sortByStatusPriority(this.products);
            this.debugPinned(this.products, 'after reset');
            this.finished = receivedCount < this.limit;
            this.start = receivedCount;
          } else {
            // Dedupe por prod_id normalizado a string para evitar '2839' vs 2839
            this.products = [...new Map([...this.products, ...filteredProducts].map(item => [String((item as any).prod_id), item])).values()];
            this.products = this.reorderPinned(this.products);
            this.products = this.productService.sortByStatusPriority(this.products);
            this.debugPinned(this.products, 'after append');
            this.start += receivedCount;
            this.finished = receivedCount < this.limit;
          }

          const focoVisible = this.products.filter(product => Number((product as any).status) === 7);
          console.log('[CatalogComponent] loadProducts final list', {
            resetList,
            totalVisible: this.products.length,
            nextStart: this.start,
            finished: this.finished,
            focoVisibleCount: focoVisible.length,
            firstTenVisible: this.products.slice(0, 10).map(product => ({
              prod_id: (product as any).prod_id,
              prod_name: (product as any).prod_name,
              status: (product as any).status
            })),
            focoVisibleIds: focoVisible.slice(0, 10).map(product => ({
              prod_id: (product as any).prod_id,
              prod_name: (product as any).prod_name,
              status: (product as any).status
            }))
          });

          this.saveCurrentState();
        },
        (error) => {
          console.error('Error al cargar productos:', error);
          this.loading = false;
        }
      );
    }
  }

  saveProductsLocalStorages() {
    localStorage.setItem('products', JSON.stringify(this.products));
    localStorage.setItem('start', this.start.toString());
  }

  sortByFilter(value) {
    this.clearSavedState();
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sortBy: value ? value : null },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    }).finally(() => {
      this.viewScroller.scrollToAnchor('products');
    });
  }

  setPage(page: number) {
    this.clearSavedState();
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page },
      queryParamsHandling: 'merge',
      skipLocationChange: false
    }).finally(() => {
      this.viewScroller.scrollToAnchor('products');
    });
  }

  updateGridLayout(value: string) {
    this.grid = value;
  }

  updateLayoutView(value: string) {
    this.layoutView = value;
    if (value == 'list-view')
      this.grid = 'col-lg-12';
    else
      this.grid = 'col-xl-3 col-md-6';
  }

  iLike(product: any) {
    this.desiredProduct.iLike(product).then(() => {
      this.calculateTotalOrder();
    });
  }

  async calculateTotalOrder() {
    this.detailOrder.subtotal = 0;
    this.desiredProduct.desiredProductsIds = [];
    this.desiredProduct.desiredProducts.forEach((product: any) => {
      this.detailOrder.subtotal += (product.price * product.quantity);
      this.desiredProduct.desiredProductsIds.push(product.prod_id);
    });
    this.detailOrder.tax = this.detailOrder.subtotal * this.currentTax;
    this.detailOrder.total = this.detailOrder.subtotal + this.detailOrder.tax;
    localStorage.set({
      key: 'desiredProducts',
      value: JSON.stringify(this.desiredProduct.desiredProducts)
    });
    localStorage.set({
      key: 'desiredProductsIds',
      value: JSON.stringify(this.desiredProduct.desiredProductsIds)
    });
  }

  // Reordenar para poner primero los productos fijados (si están presentes en el resultado)
  private reorderPinned(list: Product[]): Product[] {
    if (!Array.isArray(list) || list.length === 0) return list;

    // Prioridad: si hay nombres configurados, usar prod_name
    if (this.pinnedProductNames && this.pinnedProductNames.length > 0) {
      const norm = (s: any) => String(s ?? '').trim().toLowerCase();
      const orderIndexByName = new Map(this.pinnedProductNames.map((name, idx) => [norm(name), idx]));
      const pinned: Product[] = [];
      const others: Product[] = [];
      for (const item of list) {
        const key = norm((item as any).prod_name);
        if (orderIndexByName.has(key)) {
          pinned.push(item);
        } else {
          others.push(item);
        }
      }
      pinned.sort((a, b) => ((orderIndexByName.get(norm((a as any).prod_name)) ?? 0) - (orderIndexByName.get(norm((b as any).prod_name)) ?? 0)));
      return pinned.concat(others);
    }

    // Si no hay nombres, usar IDs fijados
    if (this.pinnedProductIds && this.pinnedProductIds.length > 0) {
      const orderIndex = new Map(this.pinnedProductIds.map((id, idx) => [Number(id), idx]));
      const pinned: Product[] = [];
      const others: Product[] = [];
      for (const item of list) {
        const itemId = Number((item as any).prod_id);
        if (Number.isFinite(itemId) && orderIndex.has(itemId)) {
          pinned.push(item);
        } else {
          others.push(item);
        }
      }
      pinned.sort((a, b) => ((orderIndex.get(Number((a as any).prod_id)) ?? 0) - (orderIndex.get(Number((b as any).prod_id)) ?? 0)));
      return pinned.concat(others);
    }

    return list;
  }

  // Logs de apoyo para verificar fijados y orden
  private debugPinned(list: Product[], context: string) {
    try {
      if (this.pinnedProductNames && this.pinnedProductNames.length > 0) {
        const norm = (s: any) => String(s ?? '').trim().toLowerCase();
        const firstNames = Array.isArray(list) ? list.slice(0, 10).map(p => (p as any).prod_name) : [];
        const foundPinnedNames = this.pinnedProductNames.filter(name => Array.isArray(list) && list.some(p => norm((p as any).prod_name) === norm(name)));
        const missingPinnedNames = this.pinnedProductNames.filter(name => !foundPinnedNames.map(n => norm(n)).includes(norm(name)));
        console.log('[CatalogComponent] pinned check - ' + context, {
          mode: 'names',
          total: Array.isArray(list) ? list.length : 0,
          pinnedConfigured: this.pinnedProductNames,
          foundPinned: foundPinnedNames,
          missingPinned: missingPinnedNames,
          firstNames
        });
      } else {
        const firstIds = Array.isArray(list) ? list.slice(0, 10).map(p => Number((p as any).prod_id)) : [];
        const foundPinnedIds = this.pinnedProductIds.filter(id => Array.isArray(list) && list.some(p => Number((p as any).prod_id) === Number(id)));
        const missingPinnedIds = this.pinnedProductIds.filter(id => !foundPinnedIds.includes(id));
        console.log('[CatalogComponent] pinned check - ' + context, {
          mode: 'ids',
          total: Array.isArray(list) ? list.length : 0,
          pinnedConfigured: this.pinnedProductIds,
          foundPinned: foundPinnedIds,
          missingPinned: missingPinnedIds,
          firstIds
        });
      }
    } catch (e) {
      console.warn('[CatalogComponent] debugPinned error', e);
    }
  }
}
