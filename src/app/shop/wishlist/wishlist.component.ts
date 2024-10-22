import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from "../../shared/services/product.service";
import { Product } from 'src/app/interfaces/product';
import { ApiService } from 'src/app/services/api.service';
import { DesiredProductsService } from 'src/app/services/desired-products.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {

  public products: Product[] = [];
  public product: Product = {
    prod_id: null,
    status: null,
    image: null,
    prod_name: null,
    price: null,
    stock: null,
    prod_descriptions: null
  };

  constructor(private router: Router, 
    public productService: ProductService,
    public apiService: ApiService,
    public desiredProduct: DesiredProductsService
  ) {
      // this.productService.wishlistItems.subscribe(response => this.products = response);
  }

  ngOnInit(): void {
    this.desiredProduct.desiredProducts = JSON.parse(localStorage.getItem('desiredProducts') || '[]');
    this.desiredProduct.desiredProductsIds = JSON.parse(localStorage.getItem('desiredProductsIds') || '[]');
  }

  async addToCart(product: any) {
    const status = await this.productService.addToCart(product);
    if(status) {
      this.router.navigate(['/shop/cart']);
      this.removeItem(product);
    }
  }

  removeItem(product: any) {
    this.productService.removeWishlistItem(product);
  }

}
