import { NgIf } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { QuickViewComponent } from "../../modal/quick-view/quick-view.component";
import { CartModalComponent } from "../../modal/cart-modal/cart-modal.component";
import { ProductService } from "../../../services/product.service";
import { Product } from 'src/app/interfaces/product';
import { DesiredProductsService } from 'src/app/services/desired-products.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-product-box-one',
  templateUrl: './product-box-one.component.html',
  styleUrls: ['./product-box-one.component.scss']
})
export class ProductBoxOneComponent implements OnInit {

  @Input() product: Product;
  @Input() currency: any = this.productService.Currency; // Default Currency 
  @Input() thumbnail: boolean = false; // Default False 
  @Input() onHowerChangeImage: boolean = false; // Default False
  @Input() cartModal: boolean = false; // Default False
  @Input() loader: boolean = false;
  
  @ViewChild("quickView") QuickView: QuickViewComponent;
  @ViewChild("cartModal") CartModal: CartModalComponent;
  public aristaLogo = 'assets/appImages/logoMenu.svg'
  public userType: string;
  public ImageSrc : string;
  public ngIf: number;

  constructor(private productService: ProductService, public apiService: ApiService, public desiredProduct: DesiredProductsService) { 
    this.userType = localStorage.getItem('userType');
  }

  ngOnInit(): void {
    if(this.loader) {
      setTimeout(() => { this.loader = false; }, 2000); // Skeleton Loader
    }
    this.desiredProduct.desiredProducts = JSON.parse(localStorage.getItem('desiredProducts') || '[]');
    this.desiredProduct.desiredProductsIds = JSON.parse(localStorage.getItem('desiredProductsIds') || '[]');
    this.changeVoltsColor();
  }

  // Change Variants Image
  ChangeVariantsImage(src) {
    this.ImageSrc = src;
  }

  addToWishlist(product: any) {
    this.desiredProduct.iLike(product);
    localStorage.setItem('desiredProducts', JSON.stringify(this.desiredProduct.desiredProducts));
    localStorage.setItem('desiredProductsIds', JSON.stringify(this.desiredProduct.desiredProductsIds));
  }

  addToCompare(product: any) {
    this.productService.addToCompare(product);
  }

  changeVoltsColor() {
    this.product.prod_descriptions = this.product.prod_descriptions
      .replace('12V', '<span class="color-green">12 V</span>')
      .replace('24V', '<span class="color-red">24 V</span>');
  }
}
