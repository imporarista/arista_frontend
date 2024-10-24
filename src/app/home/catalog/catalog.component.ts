import { ApiService } from 'src/app/services/api.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { ProductService } from 'src/app/shared/services/product.service';
import { Product } from 'src/app/interfaces/product';
import { DesiredProductsService } from 'src/app/services/desired-products.service';
import { ChangeDetectorRef } from '@angular/core'; // Asegúrate de importar esto

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit {
  public grid: string = 'col-xl-3 col-md-6';
  public layoutView: string = 'grid-view';
  public products: Product[] = [];
  public pageNo: number = 1;
  public paginate: any = {}; // Pagination use only
  public sortBy: string; // Sorting Order
  private cat_id: number;
  private subc_id: number;
  private statusProduct: string;
  private start: number //item en que inicia la carga
  private limit: number // cuantos productos carga cada vez
  public finished: boolean // determina si ya se cargo todos los productos
  public aristaLogo = 'assets/appImages/logoMenu.svg'
  private loading: boolean = false;
  private priceRateId: number;

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
    private cdr: ChangeDetectorRef, // Inyecta ChangeDetectorRef
  ) {
    this.start = 0;
    this.limit = 120;
    this.finished = false
    this.priceRateId = 0;
    // Get Query params..
    this.route.queryParams.subscribe(params => {
      this.statusProduct = params.status ? params.status : '';

      this.sortBy = params.sortBy ? params.sortBy : 'ascending';
      this.pageNo = params.page ? params.page : this.pageNo;
    })

    this.route.params.subscribe(params => {
      this.cat_id = params['cat_id'];
      this.subc_id = params['subc_id'];
      this.priceRateId = Number(localStorage.getItem('price_rate_id')) | 1;
      this.loadProducts(true);
    });
  }

  ngOnInit(): void {
  }

  loadMoreProducts() {
    this.start += this.limit;
    this.loadProducts(false);
  }

  loadProducts(resetList: boolean): void {
    console.log('cargando productos')
    if (!this.loading) {
      this.loading = true;
      let selector = 'all'; // all, category, subCategory
      let id = null; // id de sub categoría o sub categoría
      if (typeof (this.subc_id) !== 'undefined') {
        selector = 'subCategory';
        id = this.subc_id;
      } else if (typeof (this.cat_id) !== 'undefined') {
        selector = 'category';
        id = this.cat_id;
      }
    
      this.apiService.getProducts(selector, id, this.start, this.limit, this.statusProduct, this.priceRateId).subscribe(
        (products) => {
          this.loading = false;
          if (resetList) {
            this.products = products;
            this.finished = false;
          } else {
            this.products = this.products.concat(products);
            if (products.length < this.limit) {
              this.finished = true;
            }
          }
          this.cdr.detectChanges(); // Forzar la detección de cambios
        },
        (error) => {
          console.error('Error al cargar productos:', error); // Manejo de errores
          this.loading = false;
        }
      );
    }
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
