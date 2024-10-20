import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { GeneralFunctionsService } from 'src/app/services/general-functions.service';
import { CustomerService } from 'src/app/services/customer.service';
import { constants } from 'src/environments/constants';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { CustomerVisitListComponent } from '../customer-visit-list/customer-visit-list.component';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { FooterTwoComponent } from 'src/app/footer/footer-two/footer-two.component';

@Component({
  selector: 'app-customer-visits',
  standalone: true,
  imports: [AutocompleteLibModule, CustomerVisitListComponent, RouterModule, FormsModule, NgIf, FooterTwoComponent],
  templateUrl: './customer-visits.component.html',
  styleUrl: './customer-visits.component.scss'
})

export class CustomerVisitsComponent implements OnInit {
  public visit: {
    visitCoordinates: string;
    visitCustomerId: number;
    visitCustomerName: string;
    visitEndTime: string;
    visitHasSale: number;
    visitId: number;
    visitNoSaleReason: string;
    visitSellerId: number;
    visitSpendTime: number;
    visitStartTime: string;
    visitTotalSale: number;
  };

  public visiting: boolean
  public userType: string;

  constructor(
    private api: ApiService,
    public customers: CustomerService,
    private generalFunctions: GeneralFunctionsService,
    private router: Router,
  ) {
    this.visiting = false;
    this.visit = {
      visitCoordinates: null,
      visitCustomerId: 0,
      visitCustomerName: null,
      visitEndTime: null,
      visitHasSale: 0,
      visitId: 0,
      visitNoSaleReason: null,
      visitSellerId: 0,
      visitSpendTime: 0,
      visitStartTime: null,
      visitTotalSale: 0
    };
    this.userType = localStorage.getItem('userType');
  }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {
    this.customers.getCustomers().then(async () => {
      const customerVisitReaded = localStorage.getItem(constants.CUSTOMER_VISIT);

      if (customerVisitReaded !== null) {
        this.visiting = true;
        this.visit = JSON.parse(customerVisitReaded);
      }
    });
  }

  onFocused(event) {
    // console.log('evento', event);
  }

  /**
   * inicializa los datos de una visita y los guarda en Preferences
   */
  startVisit() {
    // this.presentLoading();
    this.generalFunctions.getLocation().then(async (message: any) => {
      const localization = {
        latitude: message.latitude,
        longitude: message.longitude
      };
      this.visiting = true;
      this.visit.visitSellerId = Number(localStorage.getItem('userId'));
      this.visit.visitCustomerId = this.customers.customerIdSelected;
      this.visit.visitCustomerName = this.customers.getCustomerById(this.customers.customerIdSelected);
      this.visit.visitStartTime = this.generalFunctions.getCurrentDateTime(constants.DATE_FORMAT.DATABASE);
      this.visit.visitCoordinates = JSON.stringify(localization);
      this.visit.visitHasSale = 0;
      // this.loading.dismiss();
      localStorage.setItem(constants.CUSTOMER_VISIT, JSON.stringify(this.visit));
    }, () => {
      // this.loading.dismiss();
      // this.toastError();
    });
  }

  goVisitList() {
    this.router.navigate(['visit/customer-visits-list']);
  }

  finishVisit() {
    this.visiting = false;
    this.visit.visitEndTime = this.generalFunctions.getCurrentDateTime(constants.DATE_FORMAT.DATABASE);
    this.visit.visitSpendTime = Number(this.generalFunctions.
      calculateDifferenceBetweenTimes(this.visit.visitStartTime, this.visit.visitEndTime, constants.UNITIES.TIME.MILLISECONDS));

    if (this.visit.visitHasSale === 1) {
      this.visit.visitNoSaleReason = '';
    } else {
      this.visit.visitTotalSale = 0;
    }
    this.api.saveVisit(this.visit).subscribe(() => {
      localStorage.remove({ key: constants.CUSTOMER_VISIT });
      this.router.navigate(['/visit-list']);
    });
  }
}

