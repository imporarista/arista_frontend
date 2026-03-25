import { Component, OnInit, Input, HostListener } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ProductService } from '../../services/product.service';
import { DesiredProductsService } from 'src/app/services/desired-products.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-one',
  templateUrl: './header-one.component.html',
  styleUrls: ['./header-one.component.scss']
})
export class HeaderOneComponent implements OnInit {
  public window = window;
  @Input() class: string;
  @Input() themeLogo: string = 'assets/appImages/logoMenu.svg';
  @Input() topbar: boolean = true;
  @Input() sticky: boolean = false;

  public stick: boolean = false;
  public statusProduct = '';
  public userId: string | null = null;
  public userType: string | null = null;
  public priceRateId: string | null = null;
  public name: string | null = null;
  public email: string | null = null;
  public showLogoutModal: boolean = false;
  public statusSearchTerm: string = '';
  public statusDropdownOpen: boolean = false;
  public readonly statusOptions = [
    { value: '', label: 'Todos' },
    { value: '7', label: 'Foco' },
    { value: '1', label: 'Destacado' },
    { value: '2', label: 'Nuevo' },
    { value: '3', label: 'Normal' },
    { value: '6', label: 'Outlet' },
    { value: '4', label: 'Agotado' },
    { value: '5', label: 'Inactivo' }
  ];
  
  api: ApiService;
  start: number;
  productList: any[];
  finish: boolean;
  selector: string;
  id: any;

  constructor(
    public productService: ProductService,
    public desiredProduct: DesiredProductsService,
    private router: Router
  ) { }

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

    this.userId = localStorage.getItem('userId');
    this.userType = localStorage.getItem('userType');
    this.priceRateId = localStorage.getItem('priceRateId');
    this.name = localStorage.getItem('userName');
    this.email = localStorage.getItem('userEmail');
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    let number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (number >= 150 && window.innerWidth > 400) {
      this.stick = true;
    } else {
      this.stick = false;
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeStatusDropdown();
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
    localStorage.removeItem('products');
    localStorage.removeItem('start');
    this.router.navigate(['/home/catalog'], {
        queryParams: { status: this.statusProduct },
        queryParamsHandling: 'merge'
    });
  }

  get filteredStatusOptions() {
    const normalizedSearch = this.statusSearchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return this.statusOptions;
    }

    return this.statusOptions.filter(option =>
      option.label.toLowerCase().includes(normalizedSearch)
    );
  }

  get selectedStatusLabel(): string {
    const selectedOption = this.statusOptions.find(option => option.value === this.statusProduct);
    return selectedOption ? selectedOption.label : 'Todos';
  }

  toggleStatusDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.statusDropdownOpen = !this.statusDropdownOpen;
    if (this.statusDropdownOpen) {
      this.statusSearchTerm = '';
    }
  }

  closeStatusDropdown(): void {
    this.statusDropdownOpen = false;
    this.statusSearchTerm = '';
  }

  onStatusSearchClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  selectStatus(value: string, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    this.statusProduct = value;
    this.closeStatusDropdown();
    this.filterStatus();
  }

  openLogoutModal(): void {
    this.showLogoutModal = true;
  }

  confirmLogout(): void {
    this.showLogoutModal = false;
    localStorage.clear();
    window.location.reload();
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  closeSession() {
    this.openLogoutModal();
  }
}
