import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { DesiredProductsService } from 'src/app/services/desired-products.service';
import { ApiService } from 'src/app/services/api.service';
import { Product } from 'src/app/interfaces/product';
import { constants } from 'src/environments/constants';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  @ViewChild('alert_no_visit') alert_no_visit: ElementRef

  public iva: number;
  public totalPrice: number;	
  public subTotal: number;
  public product: Product = {
    prod_id: null,
    status: null,
    image: null,
    prod_name: null,
    price: null,
    stock: null,
    prod_descriptions: null
  };

  private visit: any;
  private userId: number;
  private userType: number;


  constructor(
    public desiredProduct: DesiredProductsService,
    public api: ApiService,
    private toastrService: ToastrService,
    private modalService: NgbModal,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.iva = 0;
    this.totalPrice = 0;
    this.subTotal = 0;
    this.userId = 0;
    this.userType = 0;
  }

  ngOnInit(): void {
    this.desiredProduct.desiredProducts = JSON.parse(localStorage.getItem('desiredProducts') || '[]');
    this.desiredProduct.desiredProductsIds = JSON.parse(localStorage.getItem('desiredProductsIds') || '[]');
    this.getTotals();
    this.userId = parseInt(localStorage.getItem('userId') || '0');
    this.userType = parseInt(localStorage.getItem('userType') || '0');
  }

  getTotals() {
    // calcula totales del carrito
    [this.subTotal, this.iva, this.totalPrice]  = this.desiredProduct.cartTotalAmount();
    localStorage.setItem('desiredProducts', JSON.stringify(this.desiredProduct.desiredProducts));
    localStorage.setItem('desiredProductsIds', JSON.stringify(this.desiredProduct.desiredProductsIds));
  }

  // Increament
  increment(product, qty = 1) {
    product.quantity += qty;
    this.getTotals()
  }

  // Decrement
  decrement(product, qty = -1) {
    if (product.quantity > 1) product.quantity += qty;
    this.getTotals();
  }

  public removeItem(product: any) {
    this.desiredProduct.iLike(product);
    this.getTotals();
  }

  async sendOrder() {
    const visit = localStorage.getItem(constants.CUSTOMER_VISIT);
    if (visit !== null) {
      this.visit = JSON.parse(visit)
    };
    let userId = this.userId;
    if (Number(this.userType) === constants.USER_TYPE.SELLER) {
      if (this.visit) {
        userId = this.visit.visitCustomerId;
        this.finishSendOrder(userId);
      } else {
        // muestra mensaje que es necesario estar en una visita
        this.alertCustomerRequired();
      }
    } else {
      this.finishSendOrder(userId);
    }
  }



  finishSendOrder(userId: any) {
//   this.presentLoading();
    if (this.desiredProduct.desiredProducts.length > 0) {
      let productOrder: { quantity: any; reference: any; description: any; unitValue: any; customerId: any; prodId: any; }[] = [];
      this.desiredProduct.desiredProducts.forEach((product: { quantity: any; prod_name: any; prod_descriptions: any; price: any; prod_id: any; }) => {
        productOrder.push({
          quantity: product.quantity,
          reference: product.prod_name,
          description: product.prod_descriptions,
          unitValue: product.price,
          customerId: userId,
          prodId: product.prod_id
        });
      });
      this.api.sendOrder(productOrder).subscribe(() => {
        // si existe una visita a cliente se le asigna el valor de la venta.
        if (this.visit) {
          this.visit.visitTotalSale = this.totalPrice;
          this.visit.visitHasSale = constants.VISIT_HAS_SALE.TRUE;
          localStorage.setItem(constants.CUSTOMER_VISIT, JSON.stringify(this.visit));
        }
        // this.loading.dismiss();
        this.toastSuccess();
        this.clearCar();
        // this.menuCtrl.close().then();
      }, () => {
        // this.loading.dismiss();
        // this.alertNoConnection();
      });
    } else {
      // this.showAlertNoProducts();
    }
  }

  toastSuccess() {
    this.toastrService.success('El Pedido ha sido enviado');
  }
  clearCar() {
    this.desiredProduct.desiredProducts = [];
    this.desiredProduct.desiredProductsIds = [];
    localStorage.setItem('desiredProducts', JSON.stringify(this.desiredProduct.desiredProducts));
    localStorage.setItem('desiredProductsIds', JSON.stringify(this.desiredProduct.desiredProductsIds));
    this.getTotals();
  }

  async alertCustomerRequired() {
    this.modalService.open(this.alert_no_visit, { centered: true, size: 'xl' });
  }

}
