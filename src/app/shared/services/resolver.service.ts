import { ApiService } from './../../services/api.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Product } from 'src/app/interfaces/product';

@Injectable({
	providedIn: 'root'
})
export class Resolver  {
  
  public product: Product = {
    prod_id: null,
    status: null,
    image: null,
    prod_name: null,
    price: null,
    stock: null,
    prod_descriptions: null,
  };

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  // Resolver
  async resolve(route: ActivatedRouteSnapshot): Promise<any> {
    return await new Promise(resolve => {
      // this.productService.getProductBySlug(route.params.slug).subscribe(product => {
      this.apiService.getProducts('search', route.params.slug, 0, 1, '', 1).subscribe(products => {
        if (products.length == 0) { // When product is empty redirect 404
          resolve(null);
          this.router.navigateByUrl('/pages/404', { skipLocationChange: true });
        } else {
          this.product = products[0];
          resolve(this.product)
        }
      })
    });    
  }
}
