import { Component, OnInit, Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from "../../services/product.service";
import { Product } from "../../classes/product";
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  private timeStoped = 0;
  private intervalTimeStoped: any = null;
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
    private router: Router
  ) {
    this.productService.cartItems.subscribe(response => this.products = response);
  }

  ngOnInit(): void {
  }

  searchToggle(){
    this.search = !this.search;
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
    this.searchText = search;
    console.log('search', search);
    this.timeStoped = 0;
    this.startTimer();
  }

  startTimer() {
    if (this.intervalTimeStoped !== null) {
      clearInterval(this.intervalTimeStoped);
    }
    let THIS = this;
    this.intervalTimeStoped = setInterval(function () {
      THIS.timeStoped++;
      //pregunta si lleva un segundo sin teclear nada antes de empezar a buscar
      if (THIS.timeStoped >= 1) {
        clearInterval(THIS.intervalTimeStoped);
        if (THIS.searchText === '') {
          THIS.router.navigate(['home/catalog']);
        } else {
          THIS.router.navigate(['home/catalog'], {
            queryParams: { search: THIS.searchText },
          });
        }
      }
    }, 1000);
  }

}
