import { ApiService } from 'src/app/services/api.service';
import { Component, OnInit } from '@angular/core';
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
export class CatalogComponent implements OnInit {
  private categories: Category[];
  private cat_id: number;
  private limit: number // cuantos productos carga cada vez
  private loading: boolean = false;
  private priceRateId: number;
  private readFromDB: boolean;
  private searchProduct: string;
  private start: number //item en que inicia la carga
  private subc_id: number;
  public aristaLogo = 'assets/appImages/logoMenu.svg'
  public category: string;
  public finished: boolean // determina si ya se cargo todos los productos
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
    this.finished = false
    this.priceRateId = 0;
    this.statusProduct = '';
    this.searchProduct = '';
    this.cat_id = undefined;
    this.subc_id = undefined;
    this.priceRateId =  1;
    this.loading = false;
    this.readFromDB = true;
  }

  getParams() {
    // Get Query params..
    this.start = 0;
    this.route.queryParams.subscribe(params => {
      this.statusProduct = params.status ? params.status : '';
      this.searchProduct = params.search ? params.search : '';
      this.start = 0;
      this.loadProducts(true);
    });
    this.route.params.subscribe(params => {
      this.start = 0;
      this.cat_id = params['cat_id'];
      
      if (this.cat_id) {
        const selectedCategory = this.categories.find(category => category.cat_id === this.cat_id);
        this.category = selectedCategory ? selectedCategory.cat_name : 'Todos';
      } else {
        this.category = 'Todos';
      }

      this.subc_id = params['subc_id'];
      this.priceRateId = Number(localStorage.getItem('price_rate_id')) | 1;
      this.loadProducts(true);
    });
  }

  ngOnInit(): void {
    this.apiService.getCategories(localStorage.getItem('user_id')).subscribe((categories) => {
      this.categories = categories;
    });
  }

  loadProducts(resetList: boolean): void {
      if (!this.loading && this.readFromDB) {
        this.loading = true;
        let selector = 'all'; // all, category, subCategory
        let id = null; // id de sub categoría o sub categoría
        if (typeof (this.subc_id) !== 'undefined') {
          selector = 'subCategory';
          id = this.subc_id;
        } else if (typeof (this.cat_id) !== 'undefined') {
          selector = 'category';
          id = this.cat_id;
        } else if (this.searchProduct !== '') {
          selector = 'search'
          id = this.searchProduct;
        }
        console.log('buscando desde la API')
        this.apiService.getProducts(selector, id, this.start, this.limit, this.statusProduct, this.priceRateId).subscribe(
          (products) => {
            this.loading = false;
            if (resetList) {
              this.products = products;
              this.finished = false;
              this.start = this.products.length;
            } else {
              this.products = [...new Map([...this.products, ...products].map(item => [item.prod_id, item])).values()];
              this.start = this.products.length;
              if (products.length < this.limit) {
                this.finished = true;
              }
            }
          },
          (error) => {
            console.error('Error al cargar productos:', error); // Manejo de errores
            this.loading = false;
          }
        );
      }
  }

  saveProductsLocalStorages() {
    // Guardar productos en localStorage
    localStorage.setItem('products', JSON.stringify(this.products));
    localStorage.setItem('start', this.start.toString());
  }

  // SortBy Filter
  sortByFilter(value) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sortBy: value ? value : null },
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false  // do trigger navigation
    }).finally(() => {
      this.viewScroller.scrollToAnchor('products'); // Anchore Link
    });
  }

  // product Pagination
  setPage(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page },
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false  // do trigger navigation
    }).finally(() => {
      this.viewScroller.scrollToAnchor('products'); // Anchore Link
    });
  }

  // Change Grid Layout
  updateGridLayout(value: string) {
    this.grid = value;
  }

  // Change Layout View
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
