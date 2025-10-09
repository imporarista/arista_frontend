import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, Input,
  Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Product } from 'src/app/interfaces/product';
import { DesiredProductsService } from 'src/app/services/desired-products.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-quick-view',
  templateUrl: './quick-view.component.html',
  styleUrls: ['./quick-view.component.scss']
})
export class QuickViewComponent implements OnInit, OnDestroy  {

  @Input() product: Product;
  @Input() currency: any;  
  @ViewChild("quickView", { static: false }) QuickView: TemplateRef<any>;

  public closeResult: string;
  public ImageSrc: string;
  public counter: number = 1;
  public modalOpen: boolean = false;
  public userType: string;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private router: Router, private modalService: NgbModal,
    // public productService: ProductService
    private desiredProduct: DesiredProductsService,
    public apiService: ApiService
  ) {
    this.userType = localStorage.getItem('userType')  ?? '2';
  }

  ngOnInit(): void {
  }

  openModal() {
    this.modalOpen = true;
    if (isPlatformBrowser(this.platformId)) { 
      this.modalService.open(this.QuickView, { 
        size: 'lg',
        ariaLabelledBy: 'modal-basic-title',
        centered: true,
        windowClass: 'Quickview' 
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


  Color(variants) {
    const uniqColor = []
    for (let i = 0; i < Object.keys(variants).length; i++) {
      if (uniqColor.indexOf(variants[i].color) === -1 && variants[i].color) {
        uniqColor.push(variants[i].color)
      }
    }
    return uniqColor
  }


  Size(variants) {
    const uniqSize = []
    for (let i = 0; i < Object.keys(variants).length; i++) {
      if (uniqSize.indexOf(variants[i].size) === -1 && variants[i].size) {
        uniqSize.push(variants[i].size)
      }
    }
    return uniqSize
  }


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


  increment() {
    this.counter++ ;
  }

  decrement() {
    if (this.counter > 1) this.counter-- ;
  }


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

}
