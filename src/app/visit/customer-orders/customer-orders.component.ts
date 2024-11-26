import { CustomerVisitListComponent } from './../customer-visit-list/customer-visit-list.component';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { CustomerService } from 'src/app/services/customer.service';
import { Router, RouterModule } from '@angular/router';
import { Customerinterface } from 'src/app/interfaces/customerinterface';
import { NgIf } from '@angular/common';
import { FooterTwoComponent } from 'src/app/footer/footer-two/footer-two.component';
import { Location } from '@angular/common';
@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [AutocompleteLibModule, FormsModule, CustomerOrdersComponent, CustomerVisitListComponent, RouterModule, NgIf, FooterTwoComponent],
  templateUrl: './customer-orders.component.html',
  styleUrl: './customer-orders.component.scss'
})
export class CustomerOrdersComponent {
  public customersList: Array<Customerinterface>;
  public userType: string;


  constructor(
    public customers: CustomerService,
    private location: Location,
    private router: Router,
  ) {
    this.customersList = [];
    this.userType = localStorage.getItem('userType');
  };

  onFocused(event) {
  }

  ngOnInit() {
    this.customers.getCustomers().then();
  }

  searchOrders() {
    for (const customer of this.customers.customerList) {
      if (customer.id === this.customers.customerIdSelected) {
        this.router.navigate(['visit/order-list', customer])
        break;
      }
    }
  }

  goBack() {
    this.location.back();
  }
}
