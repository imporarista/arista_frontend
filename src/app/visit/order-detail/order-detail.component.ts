import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject, Input, PLATFORM_ID, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/interfaces/product';
import { ApiService } from 'src/app/services/api.service';
import { Orderdetailinterface } from 'src/app/interfaces/orderdetailinterface';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [NgIf, CommonModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent {
  @Input() product: Product;
  @Input() currency: any;
  @ViewChild("quickView", { static: false }) QuickView: TemplateRef<any>;

  public closeResult: string;
  public ImageSrc: string;
  public counter: number = 1;
  public modalOpen: boolean = false;
  public detailOrder = {
    subtotal: 0,
    tax: 0,
    total: 0
  };
  public productsOrder: Orderdetailinterface[] = [
    {
      // imagen principal del producto
      image: '',
      // nombre del producto o referencia
      prod_name: '',
      // descripción del producto
      prod_descriptions: '',
      // precio indivudual
      price: 0,
      // cantidad seleccionada
      quantity: 0
    }
  ];
  public currentTax = 0.19;


  constructor(@Inject(PLATFORM_ID)
    private router: Router,
    public apiService: ApiService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((data: any) => {
      this.apiService.getCustomerOrderDetail(data.orderId).subscribe((dataOrder: any) => {
        this.productsOrder = dataOrder;
        this.calculateTotalOrder();
      });
    });
  }

  calculateTotalOrder() {
    this.detailOrder.subtotal = 0;
    this.productsOrder.forEach((product: any) => {
      this.detailOrder.subtotal += (product.price * product.quantity);
    });
    this.detailOrder.tax = this.detailOrder.subtotal * this.currentTax;
    this.detailOrder.total = this.detailOrder.subtotal + this.detailOrder.tax;
  }


  async openViewer(src: any) {
    this.router.navigate(['/zoom', { src }]);
  }
}
