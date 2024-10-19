import { CustomerVisitListComponent } from './../customer-visit-list/customer-visit-list.component';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { CustomerService } from 'src/app/services/customer.service';
import { Router, RouterModule } from '@angular/router';;
import { Customerinterface } from 'src/app/interfaces/customerinterface';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [AutocompleteLibModule, FormsModule, CustomerOrdersComponent, CustomerVisitListComponent, RouterModule],
  templateUrl: './customer-orders.component.html',
  styleUrl: './customer-orders.component.scss'
})
export class CustomerOrdersComponent {
  public customersList: Array<Customerinterface>;


  constructor(
    public customers: CustomerService,
    private router: Router,
  ) {
    this.customersList = [];
  };

  onFocused(event) {
    // console.log('evento', event);
  }

  searchOrders() {
    for (const customer of this.customers.customerList) {
      if (customer.id === this.customers.customerIdSelected) {
        this.router.navigate(['visit/order-list', customer])
        break;
      }
    }
  }
}
