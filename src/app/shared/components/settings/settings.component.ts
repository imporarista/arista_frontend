import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from "../../services/product.service";
import { Product } from "../../classes/product";
import { Router } from '@angular/router';
import { NavService } from '../../services/nav.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  private debounceHandle: any = null;
  public searchText: string

  public products: Product[] = [];
  public search: boolean = false;
  
  public languages = [{ 
    name: 'English',
    code: 'en'
  }, {
    name: 'French',
    code: 'fr'
  }];

  public currencies = [{
    name: 'Euro',
    currency: 'EUR',
    price: 0.90 // price of euro
  }, {
    name: 'Rupees',
    currency: 'INR',
    price: 70.93 // price of inr
  }, {
    name: 'Pound',
    currency: 'GBP',
    price: 0.78 // price of euro
  }, {
    name: 'Dollar',
    currency: 'USD',
    price: 1 // price of usd
  }]

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService,
    public productService: ProductService,
    private router: Router,
    public navService: NavService
  ) {
    this.productService.cartItems.subscribe(response => this.products = response);
  }

  ngOnInit(): void {
  }

  searchToggle(){
    this.navService.search = !this.navService.search;
    this.searchText = '';
  }

  changeLanguage(code){
    if (isPlatformBrowser(this.platformId)) {
      this.translate.use(code)
    }
  }

  get getTotal(): Observable<number> {
    return this.productService.cartTotalAmount();
  }

  removeItem(product: any) {
    this.productService.removeCartItem(product);
  }

  changeCurrency(currency: any) {
    this.productService.Currency = currency
  }

  getItems(search) {
    // Actualiza el texto pero no dispara búsqueda automática ni cierra overlay
    this.searchText = search;
    if (this.debounceHandle !== null) {
      clearTimeout(this.debounceHandle);
    }
  }

  onSubmitSearch() {
    localStorage.removeItem('products');
    localStorage.setItem('start', '0');
    const term = (this.searchText || '').trim();
    if (term === '') {
      this.router.navigate(['home/catalog']);
    } else {
      this.router.navigate(['home/catalog'], {
        queryParams: { search: term },
      });
    }
    // Cierra el overlay solo al confirmar (Enter/submit)
    this.searchToggle();
  }

}
