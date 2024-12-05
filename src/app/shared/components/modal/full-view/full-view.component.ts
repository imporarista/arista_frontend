import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, Input,
  Injectable, PLATFORM_ID, Inject } from '@angular/core';
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
export class FullViewComponent implements OnInit, OnDestroy  {

  @Input() product: Product;
  @Input() currency: any;  
  @ViewChild("fullView", { static: false }) FullView: TemplateRef<any>;

  public closeResult: string;
  public ImageSrc: string;
  public counter: number = 1;
  public modalOpen: boolean = false;
  public userType: string;

  public ProductDetailsMainSliderConfig: any = ProductDetailsMainSlider;
  public ProductDetailsThumbConfig: any = ProductDetailsThumbSlider;
  public activeSlide: any = 0;
  public product_images: string[];

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private router: Router, private modalService: NgbModal,
    // public productService: ProductService
    private desiredProduct: DesiredProductsService,
    public apiService: ApiService
  ) {
    this.userType = localStorage.getItem('userType')  ?? '2';
    this.product_images = [];
  }

  ngOnInit(): void {
    console.log('entra');
    const modalElement = document.querySelector('.Fullview.d-block.modal'); // Selecciona el contenedor del modal
    if (modalElement) {
      console.log('entra 2');
      setTimeout(() => {
        modalElement.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 500);
    }
    this.apiService.getImagesProduct(this.product.prod_id).subscribe(response => {
      this.product_images = response.map(image => {return image.img_big});
    });
  }

  openModal() {
    this.modalOpen = true;
    if (isPlatformBrowser(this.platformId)) { // For SSR 
      this.modalService.open(this.FullView, { 
        size: 'lg',
        ariaLabelledBy: 'modal-basic-title',
        centered: true,
        windowClass: 'Fullview' 
      }).result.then((result) => {
        `Result ${result}`
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
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

  // Get Product Color
  Color(variants) {
    const uniqColor = []
    for (let i = 0; i < Object.keys(variants).length; i++) {
      if (uniqColor.indexOf(variants[i].color) === -1 && variants[i].color) {
        uniqColor.push(variants[i].color)
      }
    }
    return uniqColor
  }

  // Get Product Size
  Size(variants) {
    const uniqSize = []
    for (let i = 0; i < Object.keys(variants).length; i++) {
      if (uniqSize.indexOf(variants[i].size) === -1 && variants[i].size) {
        uniqSize.push(variants[i].size)
      }
    }
    return uniqSize
  }

  // Change Variants
  ChangeVariants(color, product) {
    product.variants.map((item) => {
      if (item.color === color) {
        product.images.map((img) => {
          if (img.image_id === item.image_id) {
            this.ImageSrc = img.src
          }
        })
      }
    })
  }

  // Increament
  increment() {
    this.counter++ ;
  }

  // Decrement
  decrement() {
    if (this.counter > 1) this.counter-- ;
  }

  // Add to cart
  async addToCart(product: any) {
    const status = await this.desiredProduct.iLike(product);
    product.quantity = this.counter || 1;
    if (product.quantity > 1) {
      const currentProduct = this.desiredProduct.desiredProducts.find(p => p.prod_id === product.prod_id);
      currentProduct.quantity = product.quantity;
    }
    localStorage.setItem('desiredProducts', JSON.stringify(this.desiredProduct.desiredProducts));
    localStorage.setItem('desiredProductsIds', JSON.stringify(this.desiredProduct.desiredProductsIds));
    if(status)
      this.router.navigate(['/shop/cart']);
  }

  ngOnDestroy() {
    if(this.modalOpen){
      this.modalService.dismissAll();
    }
  }

  openPhotoSwipe(index: number) {
    const items = this.product_images.map((image, i) => {
      return {
        src: this.apiService.imageDirectory + image + (image.includes('.') ? '' : '.jpg'),
        w: 800, // Ancho de la imagen
        h: 600  // Alto de la imagen
      };
    });

    const options: PreparedPhotoSwipeOptions = {
      index: index, // índice de la imagen que se va a abrir
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

}
