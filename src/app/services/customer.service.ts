import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Customerinterface } from '../interfaces/customerinterface';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {public customerIdSelected: number;
  public searchText: string;
  // private copySearchText: string;
  // private changeSearchText = false;
  public filteredCustomer: any[] = [];
  public customerList: Array<Customerinterface>;
  public customerSelected: Customerinterface;
  public keyword = 'label';

  constructor(
    private api: ApiService
    
  ) {
    this.customerIdSelected = 0;
    this.searchText = '';
    // this.copySearchText = '';
    this.filteredCustomer = [];
    this.customerList =  [];
    this.customerSelected = {
      id: 0,
      label: '' 
    };
   }

  getCustomers() {
    return new Promise(async (resolve) => {
      if (typeof this.customerList === 'undefined' || this.customerList.length === 0) {
        let userIdReaded = localStorage.getItem('userId');
        const userId = userIdReaded == null ? '': userIdReaded;
        this.api.getCustomersSeller(userId).subscribe((responseCustomers: Customerinterface[]) => {
          this.customerList = responseCustomers;
          if (responseCustomers.length > 0 && this.customerIdSelected === 0) {
            this.customerIdSelected = responseCustomers[0].id;
            this.searchText = responseCustomers[0].label;
          }
          resolve(this.customerList);
        });
      } else {
        resolve(this.customerList);
      }
    });
  }

  /**
   * asigna valor al customerSelected
   */
  setCustomerSelected(selected) {
    this.customerIdSelected = selected.id
    console.log('a ver que se selecciona', this.customerIdSelected);
    if (this.customerList.length > 0) {
      for (const customer of this.customerList) {
        if (customer.id === this.customerIdSelected) {
          this.customerSelected = customer;
          break;
        }
      }
    }
  }

  /**
   * obtiene el valor del customer seleccionado
   */
  getCustomerSelected() {
    return this.customerSelected;
  }

  getCustomerById(customerId: any) {
    let customerLabel = '';
    if (this.customerList.length > 0) {
      for (const customer of this.customerList) {
        if (customer.id === customerId) {
          customerLabel = customer.label;
        }
      }
    }
    return customerLabel;
  }
  // search(input) {
    // this.filteredCustomer = [];
    // for (const customer of this.customerList) {
    //   if (customer.label.toLowerCase().indexOf(this.searchText.toLowerCase()) >= 0 && this.searchText.length > 0) {
    //     this.filteredCustomer.push(customer);
    //   }
    // }
    // console.log('result', this.filteredCustomer);
    
  // }

  // changeCustomer(customer: any) {
  //   this.changeSearchText = true;
  //   this.customerIdSelected = customer.id;
  //   this.searchText = customer.label;
  //   this.filteredCustomer = [];
  // }

  // addFocus() {
  //   this.copySearchText = this.searchText;
  //   this.changeSearchText = false;
  //   this.searchText = '';
  // }

  // removeFocus() {
  //   if (!this.changeSearchText) {
  //     this.searchText = this.copySearchText;
  //   }

  // }
}
