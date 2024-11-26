import { Component } from '@angular/core';
import { FooterTwoComponent } from 'src/app/footer/footer-two/footer-two.component';
import { FormsModule } from '@angular/forms';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { RouterModule } from '@angular/router';
import { GeneralFunctionsService } from 'src/app/services/general-functions.service';
import { ApiService } from 'src/app/services/api.service';
import { CustomerService } from 'src/app/services/customer.service';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';

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
    private location: Location,
    private toastrService: ToastrService
  ) {
    this.customerIdSelected = 0;
  }

  onFocused(event) {
  }

  ngOnInit() {
    this.customers.getCustomers().then();
    this.generalFunctions.getLocation().then((message) => console.info('responde', message));
  }

  saveLocation() {
    // this.presentLoading();
    this.generalFunctions.getLocation().then((message: any) => {
      const localization = {
        latitude: message.latitude,
        longitude: message.longitude
      };
      const dataLocalization = {
        customerId: this.customers.customerIdSelected,
        customerLocalization: localization
      };
      this.api.updateCustomerLocation(dataLocalization).subscribe(() => {
        // this.loading.dismiss();
        this.toastSuccess();
      }, (error:any) => {
        // this.loading.dismiss();
        this.toastError('error');
      });
    }, () => {
      // this.loading.dismiss();
      this.toastError('reject');
    });
  }

  toastSuccess() {
    this.toastrService.success('Ubicación guardada Exitosamente!!');
  }
  showToastMessage(error: string) {
    this.toastrService.error(error);
  }

  toastError(type: any) {
    let msg = 'No se logró guardar la ubicación!!';
    if (type === 'reject') {
      msg = 'No se logró conectar al servidor!!';
    }
    this.showToastMessage(msg);
  }

  goBack() {
    this.location.back();
  }
}
