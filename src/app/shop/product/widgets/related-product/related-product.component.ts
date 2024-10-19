import { Component, OnInit, Input } from '@angular/core';
import { ProductService } from '../../../../shared/services/product.service';
import { Product } from 'src/app/interfaces/product';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-related-product',
  templateUrl: './related-product.component.html',
  styleUrls: ['./related-product.component.scss']
})
export class RelatedProductComponent implements OnInit {
  
  @Input() type: number

  public products: Product[];
  private priceRateId: number;

  constructor(public apiService: ApiService) { 
    this.products = [];
    this.priceRateId = 0;
  }
  
  ngOnInit(): void {
    this.priceRateId = Number(localStorage.getItem('price_rate_id')) | 1;
    this.apiService.getProducts('category', this.type, 0, 5000,'', this.priceRateId).subscribe(response => {
      this.products = response;
    });
  }

}
