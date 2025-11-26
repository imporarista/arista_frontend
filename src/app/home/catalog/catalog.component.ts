import { ApiService } from 'src/app/services/api.service';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { ProductService } from 'src/app/shared/services/product.service';
import { Product } from 'src/app/interfaces/product';
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
  private shouldRestoreScroll: boolean = false;
  
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

  private readonly CATALOG_STATE_KEY = 'catalog_scroll_state';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private viewScroller: ViewportScroller,
    public productService: ProductService,
    private apiService: ApiService,
    public desiredProduct: DesiredProductsService,
  ) {
    this.categories = [];
    this.category = 'Todos';
    this.initData();
    this.getParams();
  }

  initData() {
    this.start = 0;
    this.limit = 120;
    this.finished = false;
    this.priceRateId = 0;
    this.statusProduct = '';
    this.searchProduct = '';
    this.cat_id = undefined;
    this.subc_id = undefined;
    this.priceRateId = 1;
    this.loading = false;
    this.readFromDB = true;
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
    if (this.shouldRestoreScroll) {
      const savedState = this.getSavedState();
      if (savedState && savedState.scrollPosition) {
        setTimeout(() => {
          window.scrollTo({
            top: savedState.scrollPosition,
            behavior: 'auto'
          });
          this.shouldRestoreScroll = false;
        }, 100);
      }
    }
  }

  ngOnDestroy(): void {
    this.saveCurrentState();
  }

  private getSavedState(): any {
    try {
      const saved = sessionStorage.getItem(this.CATALOG_STATE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error al leer estado:', error);
      return null;
    }
  }

  private saveCurrentState(): void {
    try {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      
      const state = {
        products: this.products,
        scrollPosition: scrollPosition,
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
      
      sessionStorage.setItem(this.CATALOG_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error al guardar estado:', error);
    }
  }

  private tryRestoreState(): boolean {
    const savedState = this.getSavedState();
    
    if (!savedState) {
      return false;
    }

    const fifteenMinutes = 15 * 60 * 1000;
    if (Date.now() - savedState.timestamp > fifteenMinutes) {
      this.clearSavedState();
      return false;
    }

    const paramsMatch = 
      savedState.cat_id === this.cat_id &&
      savedState.subc_id === this.subc_id &&
      savedState.statusProduct === this.statusProduct &&
      savedState.searchProduct === this.searchProduct;

    if (!paramsMatch) {
      this.clearSavedState();
      return false;
    }

    let restoredProducts = savedState.products || [];
    restoredProducts = this.applyOutletFilter(restoredProducts);
    
    this.products = restoredProducts;
    this.start = savedState.start || 0;
    this.limit = savedState.limit || 120;
    this.finished = savedState.finished || false;
    this.layoutView = savedState.layoutView || 'grid-view';
    this.grid = savedState.grid || 'col-xl-3 col-md-6';
    this.shouldRestoreScroll = true;

    return true;
  }

  private clearSavedState(): void {
    try {
      sessionStorage.removeItem(this.CATALOG_STATE_KEY);
    } catch (error) {
      console.error('Error al limpiar estado:', error);
    }
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
          
          let filteredProducts = this.applyOutletFilter(products);
          
          if (resetList) {
            this.products = filteredProducts;
            this.finished = false;
            this.start = this.products.length;
          } else {
            this.products = [...new Map([...this.products, ...filteredProducts].map(item => [item.prod_id, item])).values()];
            this.start = this.products.length;
            if (filteredProducts.length < this.limit) {
              this.finished = true;
            }
          }
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
}