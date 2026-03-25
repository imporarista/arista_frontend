import { ApiService } from 'src/app/services/api.service';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { ProductService } from 'src/app/shared/services/product.service';
import { Product } from 'src/app/interfaces/product';
import { CatalogCacheService, CatalogCacheState } from 'src/app/services/catalog-cache.service';
import { DesiredProductsService } from 'src/app/services/desired-products.service';
import { Category } from 'src/app/interfaces/category';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly destroy$ = new Subject<void>();
  private readonly VISIBLE_BATCH_SIZE = 150;
  private readonly STATUS_SEQUENCE_ALL = [7, 1, 2, 3, 4, 5];
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
  private statusLoadSequence: number[] = [];
  private currentStatusSequenceIndex: number = 0;
  private statusStartByValue: Record<number, number> = {};
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
    this.limit = this.VISIBLE_BATCH_SIZE;
    this.finished = false;
    this.priceRateId = 0;
    this.statusProduct = '';
    this.searchProduct = '';
    this.cat_id = undefined;
    this.subc_id = undefined;
    this.priceRateId = 1;
    this.loading = false;
    this.statusLoadSequence = [];
    this.currentStatusSequenceIndex = 0;
    this.statusStartByValue = {};
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
    combineLatest([this.route.params, this.route.queryParams]).pipe(
      map(([params, queryParams]) => ({
        cat_id: params['cat_id'] !== undefined ? Number(params['cat_id']) : undefined,
        subc_id: params['subc_id'] !== undefined ? Number(params['subc_id']) : undefined,
        statusProduct: queryParams.status !== undefined ? queryParams.status : '',
        searchProduct: queryParams.search ? queryParams.search : '',
        priceRateId: Number(localStorage.getItem('price_rate_id')) || 1
      })),
      distinctUntilChanged((previous, current) =>
        previous.cat_id === current.cat_id &&
        previous.subc_id === current.subc_id &&
        previous.statusProduct === current.statusProduct &&
        previous.searchProduct === current.searchProduct &&
        previous.priceRateId === current.priceRateId
      ),
      takeUntil(this.destroy$)
    ).subscribe(routeState => {
      this.cat_id = routeState.cat_id;
      this.subc_id = routeState.subc_id;
      this.statusProduct = routeState.statusProduct;
      this.searchProduct = routeState.searchProduct;
      this.priceRateId = routeState.priceRateId;

      this.updateCategoryName();

      if (this.tryRestoreState()) {
        return;
      }

      this.products = [];
      this.start = 0;
      this.finished = false;
      this.loadProducts(true);
    });
  }

  ngOnInit(): void {
    this.apiService.getCategories(localStorage.getItem('user_id')).pipe(
      takeUntil(this.destroy$)
    ).subscribe((categories) => {
      this.categories = categories;
      this.updateCategoryName();
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
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateCategoryName(): void {
    if (!this.cat_id) {
      this.category = 'Todos';
      return;
    }

    const selectedCategory = this.categories.find(category => category.cat_id === this.cat_id);
    this.category = selectedCategory ? selectedCategory.cat_name : 'Todos';
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

    if (!savedState.finished) {
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
    this.finished = true;
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
      return products.filter(product => product.status != 6);
    }
    
    return products;
  }

  loadProducts(resetList: boolean): void {
    if (!resetList) {
      if (this.loading || this.finished) {
        return;
      }
    }

    if (resetList) {
      this.clearSavedState();
      this.initializeStatusLoadingState();
    }

    if (!this.loading && this.readFromDB) {
      this.loading = true;
      this.fetchNextVisibleBatch(this.VISIBLE_BATCH_SIZE).pipe(
        takeUntil(this.destroy$)
      ).subscribe(
        ({ products: nextBatch, nextSequenceIndex, finished }) => {
          this.loading = false;

          this.currentStatusSequenceIndex = nextSequenceIndex;
          const visibleProducts = resetList
            ? nextBatch
            : this.mergeProductsById(this.products, nextBatch);
          this.products = this.productService.sortByStatusPriority(
            this.reorderPinned(visibleProducts)
          );
          this.start = this.products.length;
          this.finished = finished;
          const focoVisible = this.products.filter(product => Number((product as any).status) === 7);

          console.log('[CatalogComponent] loadProducts response', {
            resetList,
            statusProduct: this.statusProduct,
            batchCount: nextBatch.length,
            totalVisible: this.products.length,
            nextStatusSequenceIndex: this.currentStatusSequenceIndex,
            finished: this.finished,
            focoVisibleCount: focoVisible.length,
            focoVisibleIds: focoVisible.slice(0, 10).map(product => ({
              prod_id: (product as any).prod_id,
              prod_name: (product as any).prod_name,
              status: (product as any).status
            }))
          });

          this.debugPinned(this.products, resetList ? 'after reset' : 'after append');
          this.saveCurrentState();
        },
        (error) => {
          console.error('Error al cargar productos:', error);
          this.loading = false;
        }
      );
    }
  }

  private initializeStatusLoadingState(): void {
    const selectedStatus = this.normalizeSelectedStatus(this.statusProduct);
    this.statusLoadSequence = selectedStatus === null ? [...this.STATUS_SEQUENCE_ALL] : [selectedStatus];
    this.currentStatusSequenceIndex = 0;
    this.statusStartByValue = {};
    this.products = [];
    this.start = 0;
    this.finished = this.statusLoadSequence.length === 0;
  }

  private fetchNextVisibleBatch(
    remaining: number,
    sequenceIndex: number = this.currentStatusSequenceIndex,
    accumulatedProducts: Product[] = []
  ): Observable<{ products: Product[]; nextSequenceIndex: number; finished: boolean }> {
    if (remaining <= 0) {
      return of({
        products: accumulatedProducts,
        nextSequenceIndex: sequenceIndex,
        finished: false
      });
    }

    if (sequenceIndex >= this.statusLoadSequence.length) {
      return of({
        products: accumulatedProducts,
        nextSequenceIndex: sequenceIndex,
        finished: true
      });
    }

    const statusValue = this.statusLoadSequence[sequenceIndex];
    const start = this.statusStartByValue[statusValue] ?? 0;
    const requestContext = this.buildRequestContext(start, remaining, statusValue);

    return this.apiService.getProducts(
      requestContext.selector,
      requestContext.id as any,
      requestContext.start,
      requestContext.limit,
      requestContext.statusProduct as unknown as string,
      this.priceRateId
    ).pipe(
      switchMap(products => {
        const safeProducts = Array.isArray(products) ? products : [];
        const mergedProducts = this.mergeProductsById(accumulatedProducts, safeProducts);
        this.statusStartByValue[statusValue] = start + safeProducts.length;

        if (safeProducts.length < remaining) {
          return this.fetchNextVisibleBatch(
            remaining - safeProducts.length,
            sequenceIndex + 1,
            mergedProducts
          );
        }

        return of({
          products: mergedProducts,
          nextSequenceIndex: sequenceIndex,
          finished: false
        });
      })
    );
  }

  private buildRequestContext(
    start: number,
    limit: number,
    statusProduct: number | string
  ): {
    selector: string;
    id: number | string | null;
    start: number;
    limit: number;
    statusProduct: number | string;
  } {
    let selector = 'all';
    let id: number | string | null = null;

    if (typeof this.subc_id !== 'undefined') {
      selector = 'subCategory';
      id = this.subc_id;
    } else if (typeof this.cat_id !== 'undefined') {
      selector = 'category';
      id = this.cat_id;
    } else if (this.searchProduct !== '') {
      selector = 'search';
      id = this.searchProduct;
    }

    return {
      selector,
      id,
      start,
      limit,
      statusProduct
    };
  }

  private normalizeSelectedStatus(statusProduct: string): number | null {
    const normalizedStatus = String(statusProduct ?? '').trim();
    if (!normalizedStatus || normalizedStatus === 'undefined') {
      return null;
    }

    const statusNumber = Number(normalizedStatus);
    return Number.isFinite(statusNumber) ? statusNumber : null;
  }

  private mergeProductsById(existingProducts: Product[], incomingProducts: Product[]): Product[] {
    return [
      ...new Map(
        [...existingProducts, ...incomingProducts].map(product => [String(product?.prod_id), product])
      ).values()
    ];
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

  trackByProductId(index: number, product: Product): number {
    return product?.prod_id ?? index;
  }
}
