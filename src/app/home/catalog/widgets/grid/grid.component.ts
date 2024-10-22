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

  @Output() setGrid: EventEmitter<any> = new EventEmitter<any>();
  @Output() setLayout: EventEmitter<any> = new EventEmitter<any>();
  @Output() sortedBy: EventEmitter<any> = new EventEmitter<any>();
  public userType: string;
  public active = 4;

  constructor(private router: Router, public navServices: NavService) { 
    this.router.events.subscribe((event) => {
      this.navServices.mainMenuToggle = false;
    });
    this.userType = localStorage.getItem('userType');
    this.userType = localStorage.getItem('userType');
    switch(this.router.url) {
      case '/visit/customer-visits-list':
        this.active = 1;
        break;
      case 'B':
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
