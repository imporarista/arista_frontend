import { Component, OnInit, Input, HostListener } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ProductService } from '../../services/product.service';
import { DesiredProductsService } from 'src/app/services/desired-products.service';

@Component({
  selector: 'app-header-one',
  templateUrl: './header-one.component.html',
  styleUrls: ['./header-one.component.scss']
})
export class HeaderOneComponent implements OnInit {

  @Input() class: string;
  @Input() themeLogo: string = 'assets/appImages/logoMenu.svg'; // Default Logo
  @Input() topbar: boolean = true; // Default True
  @Input() sticky: boolean = false; // Default false

  public stick: boolean = false;
  public statusProduct = '';

  api: ApiService;
  start: number;
  productList: any[];
  finish: boolean;
  selector: string;
  id: any;

  constructor(
    public productService: ProductService,
    public desiredProduct: DesiredProductsService,
  ) {}

  ngOnInit(): void {
    var parser = document.createElement('a');
    parser.href = location.href;

    var parameters = parser.search.split(/\?|&/);
    for (var i = 0; i < parameters.length; i++) {
      if (!parameters[i])
        continue;

      var ary = parameters[i].split('=');
      if (ary[0] == 'status') {
        this.statusProduct = ary[1];
        break;
      }
    }
  }

  // @HostListener Decorator
  @HostListener("window:scroll", [])
  onWindowScroll() {
    let number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (number >= 150 && window.innerWidth > 400) {
      this.stick = true;
    } else {
      this.stick = false;
    }
  }

  URL_add_parameter(url, param, value) {
    var hash = {};
    var parser = document.createElement('a');

    parser.href = url;

    var parameters = parser.search.split(/\?|&/);

    for (var i = 0; i < parameters.length; i++) {
      if (!parameters[i])
        continue;

      var ary = parameters[i].split('=');
      hash[ary[0]] = ary[1];
    }

    hash[param] = value;

    var list = [];
    Object.keys(hash).forEach(function (key) {
      list.push(key + '=' + hash[key]);
    });

    parser.search = '?' + list.join('&');
    return parser.href;
  }
  filterStatus() {
    location.href = this.URL_add_parameter(location.href, 'status', this.statusProduct);
  }

  closeSession() {
    localStorage.clear();
    window.location.reload();
  }

}
