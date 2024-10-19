import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../../../shared/classes/product';
import { Router } from '@angular/router';
import { NavService } from '../../../../shared/services/nav.service';
import { ApiService } from 'src/app/services/api.service';
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

  constructor(private router: Router, public navServices: NavService, private api: ApiService) { 
    this.router.events.subscribe((event) => {
      this.navServices.mainMenuToggle = false;
    });
    this.userType = localStorage.getItem('userType');
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
