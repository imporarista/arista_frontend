import { Component } from '@angular/core';
import { FooterTwoComponent } from 'src/app/footer/footer-two/footer-two.component';
import { FormsModule } from '@angular/forms';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { Router, RouterModule } from '@angular/router';
import { GeneralFunctionsService } from 'src/app/services/general-functions.service';
import { ApiService } from 'src/app/services/api.service';
import { CustomerService } from 'src/app/services/customer.service';

@Component({
  selector: 'app-customer-location',
  standalone: true,
  imports: [AutocompleteLibModule, FormsModule, FooterTwoComponent, RouterModule],
  templateUrl: './customer-location.component.html',
  styleUrl: './customer-location.component.scss'
})
export class CustomerLocationComponent {
  public customerIdSelected: Number;

  constructor(
  private api: ApiService,
  public customers: CustomerService,
  private generalFunctions: GeneralFunctionsService,
  private router: Router
) {
  this.customerIdSelected = 0;
}

onFocused(event) {
  // console.log('evento', event);
}

ngOnInit() {
  this.customers.getCustomers().then();
  this.generalFunctions.getLocation().then((message) => console.info('responde', message));
}

saveLocation() {
}
}
