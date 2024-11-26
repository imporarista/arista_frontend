import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { DesiredProductsService } from 'src/app/services/desired-products.service';
import { ApiService } from 'src/app/services/api.service';
import { Product } from 'src/app/interfaces/product';
import { constants } from 'src/environments/constants';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { PreparedPhotoSwipeOptions } from 'photoswipe';
import PhotoSwipe from 'photoswipe';
import { Orderdetailinterface } from 'src/app/interfaces/orderdetailinterface';
import { Location } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterModule, SharedModule],
  templateUrl: './oder-detail-2.component.html',
  styleUrls: ['./oder-detail-2.component.scss']
})
export class OderDetail2Component implements OnInit {

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

  private visit: any;
  private userId: number;
  private userType: number;
  product_images: any;
  i: number;



  constructor(
    public desiredProduct: DesiredProductsService,
    public api: ApiService,
    private toastrService: ToastrService,
    private modalService: NgbModal,
    @Inject(PLATFORM_ID) private platformId: Object,
    private location: Location,
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
    [this.subTotal, this.iva, this.totalPrice] = this.desiredProduct.cartTotalAmount();
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

  openPhotoSwipe(image: string) {
    const items = [
      {
         src: this.api.imageDirectory + image + (image.includes('.') ? '' : '.jpg'),
         w: 800, // Ancho de la imagen
         h: 600  // Alto de la imagen
       }
    ];
      

    const options: PreparedPhotoSwipeOptions = {
      index: 0, // índice de la imagen que se va a abrir
      dataSource: items,
      bgOpacity: 0.8, // Opacidad del fondo
      loop: true, // Permitir bucle
      pinchToClose: true, // Permitir cerrar con gesto de pellizco
      closeOnVerticalDrag: false, // Cerrar al arrastrar verticalmente
      preload: [1, 1], // Precargar imágenes cercanas
      errorMsg: 'No se pudo cargar la imagen.', // Mensaje de error
      maxWidthToAnimate: 1200, // Ancho máximo para animar
      showHideAnimationType: 'zoom', // Tipo de animación
      // ... otros parámetros que desees agregar
      spacing: 0.1,
      allowPanToNext: false,
      hideAnimationDuration: 200,
      showAnimationDuration: 200,
      zoomAnimationDuration: 200,
      easing: 'cubic-bezier(.4,0,.22,1)',
      escKey: true,
      arrowKeys: true,
      trapFocus: false,
      returnFocus: false,
      clickToCloseNonZoomable: false,
      imageClickAction: false,
      bgClickAction: false,      
      tapAction: false,
      doubleTapAction: false,
      preloaderDelay: 0,
      indexIndicatorSep: " de ",
    };

    const gallery = new PhotoSwipe(options); // Solo se pasa options como argumento
    gallery.init();
  }

  goBack() {
    this.location.back();
  }

}
