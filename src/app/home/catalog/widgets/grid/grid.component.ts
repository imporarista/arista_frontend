import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../../../shared/classes/product';
import { Router } from '@angular/router';
import { NavService } from '../../../../shared/services/nav.service';
@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {

  @Input() products: Product[] = [];
  @Input() paginate: any = {};
  @Input() layoutView: string = 'grid-view';
  @Input() sortBy: string;
  @Input() category: string;
  @Input() status: string;

  @Output() setGrid: EventEmitter<any> = new EventEmitter<any>();
  @Output() setLayout: EventEmitter<any> = new EventEmitter<any>();
  @Output() sortedBy: EventEmitter<any> = new EventEmitter<any>();
  public userType: string;
  public active: number;
  public statusName: string;

  constructor(private router: Router, public navServices: NavService) { 
    this.statusName = '';
    this.router.events.subscribe(() => {
      this.navServices.mainMenuToggle = false;
      this.updateStatus();
    });
    this.userType = localStorage.getItem('userType');
    const route = this.router.url. includes('/home/catalog') ? '/home/catalog': this.router.url;
    switch(route) {
      case '/visit/customer-visits-list':
        this.active = 1;
        break;
      case '/home/catalog':
        this.active = 2;
        break;
      case '/visit/customer-orders':
        this.active = 3;
        break;
      case '/visit/customer-location':
        this.active = 4;
        break;
      default:
        this.active = 1;
        break;
    }
  }

  ngOnInit(): void {
    this.updateStatus(); // Llama a la función para establecer el status al iniciar
  }

  // Nueva función para actualizar el status
  private updateStatus(): void {
    switch(this.status) {
      case '1':
        this.statusName = 'Destacado';
        break;
      case '2':
        this.statusName = 'Nuevo';
        break;
      case '4':
        this.statusName = 'Agotado';
        break;
      case '6':
        this.statusName = 'Outlet';
        break;
      default:
        this.statusName = 'Todos'; // Manejo de caso por defecto
        break;
    }
    console.log('this.status', this.status, 'this.statusName', this.statusName);

  }

  setGridLayout(value: string) {
    this.setGrid.emit(value);  // Set Grid Size
  }

  setLayoutView(value: string) {
    this.layoutView = value
    this.setLayout.emit(value); // Set layout view
  }

  goVisit() {
    this.router.navigate(['/customer-visits']);
  }
  goOrders() {
    this.router.navigate(['/customer-orders']);
  }

  goCatalog() {
    this.router.navigate(['./catalog']);
  }

  goToLocalizate() {
    this.router.navigate(['/customer-location']);
  }

  mainMenuToggle(): void {
    this.navServices.mainMenuToggle = !this.navServices.mainMenuToggle;
  }

  // Click Toggle menu (Mobile)
  toggletNavActive(item) {
    item.active = !item.active;
  }

}
