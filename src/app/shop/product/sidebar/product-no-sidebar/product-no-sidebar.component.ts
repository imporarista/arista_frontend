import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDetailsMainSlider, ProductDetailsThumbSlider } from '../../../../shared/data/slider';
import { ProductService } from '../../../../shared/services/product.service';
import { SizeModalComponent } from "../../../../shared/components/modal/size-modal/size-modal.component";
import { ApiService } from 'src/app/services/api.service';
import { Product } from 'src/app/interfaces/product';
import { DesiredProductsService } from 'src/app/services/desired-products.service';
import { PreparedPhotoSwipeOptions } from 'photoswipe';
import PhotoSwipe from 'photoswipe';

@Component({
  selector: 'app-product-no-sidebar',
  templateUrl: './product-no-sidebar.component.html',
  styleUrls: ['./product-no-sidebar.component.scss']
})
export class ProductNoSidebarComponent implements OnInit {

  public product: Product;
  public product_images: string[];
  public counter: number = 1;
  public activeSlide: any = 0;
  public selectedSize: any;
  public active = 1;

  @ViewChild("sizeChart") SizeChart: SizeModalComponent;

  public ProductDetailsMainSliderConfig: any = ProductDetailsMainSlider;
  public ProductDetailsThumbConfig: any = ProductDetailsThumbSlider;

  constructor(private route: ActivatedRoute, private router: Router,
    public productService: ProductService, public apiService: ApiService,
    private desiredProduct: DesiredProductsService
  ) {

    this.desiredProduct.desiredProducts = JSON.parse(localStorage.getItem('desiredProducts'));
    this.desiredProduct.desiredProductsIds = JSON.parse(localStorage.getItem('desiredProductsIds'));
    this.product = {
      prod_id: null,
      status: null,
      image: null,
      prod_name: null,
      price: null,
      stock: null,
      prod_descriptions: null,
      cat_id: null
    };
    this.product_images = [];
    
  }

  ngOnInit(): void {
    this.route.data.subscribe(response => {
      this.product = response.data
      const currentProduct = this.desiredProduct.desiredProducts.find(p => p.prod_id === this.product.prod_id);
      this.counter = currentProduct?.quantity ? currentProduct.quantity: 1;
      this.apiService.getImagesProduct(this.product.prod_id).subscribe(response => {
        console.log('llamó las images', response);
        this.product_images = response.map(image => {return image.img_big});
      });
    });
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

  selectSize(size) {
    this.selectedSize = size;
  }

  // Increament
  increment() {
    this.counter++;
  }

  // Decrement
  decrement() {
    if (this.counter > 1) this.counter--;
  }

  // Add to cart
  async addToCart(product: any) {
    product.quantity = this.counter || 1;
    const status = await this.desiredProduct.iLike(product, true);
    localStorage.setItem('desiredProducts', JSON.stringify(this.desiredProduct.desiredProducts));
    localStorage.setItem('desiredProductsIds', JSON.stringify(this.desiredProduct.desiredProductsIds));
    if(status)
      this.router.navigate(['/shop/cart']);
  }

  // Buy Now
  async buyNow(product: any) {
    product.quantity = this.counter || 1;
    const status = await this.productService.addToCart(product);
    if (status)
      this.router.navigate(['/shop/checkout']);
  }

  // Add to Wishlist
  addToWishlist(product: any) {
    this.productService.addToWishlist(product);
  }

}
