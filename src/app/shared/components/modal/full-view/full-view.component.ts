
import {
  Component, OnInit, OnDestroy, ViewChild, TemplateRef, Input,
  Inject, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Product } from 'src/app/interfaces/product';
import { DesiredProductsService } from 'src/app/services/desired-products.service';
import { ApiService } from 'src/app/services/api.service';
import { ProductDetailsMainSlider, ProductDetailsThumbSlider } from 'src/app/shared/data/slider';
import { PreparedPhotoSwipeOptions } from 'photoswipe';
import PhotoSwipe from 'photoswipe';

@Component({
  selector: 'app-full-view',
  templateUrl: './full-view.component.html',
  styleUrls: ['./full-view.component.scss']
})
export class FullViewComponent implements OnInit, OnDestroy {

  @Input() product!: Product;
  @Input() currency: any;
  @ViewChild("fullView", { static: false }) FullView!: TemplateRef<any>;

  public closeResult: string = '';
  public ImageSrc: string = '';
  public counter: number = 1;
  public modalOpen: boolean = false;
  public userType: string;
  public product_images: string[] = [];
  public stockMessage: string = '';

  public ProductDetailsMainSliderConfig = ProductDetailsMainSlider;
  public ProductDetailsThumbConfig = ProductDetailsThumbSlider;
  public activeSlide: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private modalService: NgbModal,
    private desiredProduct: DesiredProductsService,
    public apiService: ApiService
  ) {
    this.userType = localStorage.getItem('userType') ?? '2';
  }

  ngOnInit(): void {
    this.apiService.getImagesProduct(this.product.prod_id).subscribe(response => {
      this.product_images = response.map(image => image.img_big);
    });
  }

 openModal() {
  this.modalOpen = true;
  this.counter = 1;
  this.stockMessage = '';
  this.activeSlide = 0;

  if (isPlatformBrowser(this.platformId)) {
    // Solo esto es suficiente
    document.body.classList.add('modal-open-fullview');

    const modalRef = this.modalService.open(this.FullView, {
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title',
      centered: false,
      windowClass: 'Fullview',
      scrollable: true
    });

    modalRef.result.finally(() => {
      document.body.classList.remove('modal-open-fullview');
    });
  }
}

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  increment() {
    if (this.counter < this.product.stock) {
      this.counter++;
      this.stockMessage = '';
    } else {
      this.stockMessage = `Solo hay ${this.product.stock} en stock`;
    }
  }

  decrement() {
    if (this.counter > 1) {
      this.counter--;
      this.stockMessage = '';
    }
  }

  onQuantityChange(event: any) {
    const inputValue = event.target.value;

    if (inputValue === '') {
      this.counter = null as any; 
      this.stockMessage = '';
      return;
    }

    let value = Number(inputValue);

    if (isNaN(value)) {
      this.stockMessage = '';
      return;
    }

    if (value > this.product.stock) {
      value = this.product.stock;
      this.stockMessage = `Solo hay ${this.product.stock} en stock`;
    } else {
      this.stockMessage = '';
    }

    this.counter = value;
    event.target.value = value;
  }

  async addToCart(product: any) {
    if (this.counter > this.product.stock) {
      this.stockMessage = `Solo hay ${this.product.stock} en stock`;
      return;
    }

    const status = await this.desiredProduct.iLike(product);
    product.quantity = this.counter || 1;

    if (product.quantity > 1) {
      const currentProduct = this.desiredProduct.desiredProducts.find(p => p.prod_id === product.prod_id);
      if (currentProduct) currentProduct.quantity = product.quantity;
    }

    localStorage.setItem('desiredProducts', JSON.stringify(this.desiredProduct.desiredProducts));
    localStorage.setItem('desiredProductsIds', JSON.stringify(this.desiredProduct.desiredProductsIds));

    if (status)
      this.router.navigate(['/shop/cart']);
  }

  ngOnDestroy() {
    if (this.modalOpen) {
      this.modalService.dismissAll();
    }
  }

  openPhotoSwipe(index: number) {
    const items = this.product_images.map((image) => {
      return {
        src: this.apiService.imageDirectory + image + (image.includes('.') ? '' : '.jpg'),
        w: 800,
        h: 600
      };
    });

    const options: PreparedPhotoSwipeOptions = {
      index,
      dataSource: items,
      bgOpacity: 0.8,
      loop: true,
      pinchToClose: true,
      closeOnVerticalDrag: false,
      preload: [1, 1],
      errorMsg: 'No se pudo cargar la imagen.',
      maxWidthToAnimate: 1200,
      showHideAnimationType: 'zoom',
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

    const gallery = new PhotoSwipe(options);
    gallery.init();
  }

}