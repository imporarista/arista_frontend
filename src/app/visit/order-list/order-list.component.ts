import { NgForOf } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Customerinterface } from 'src/app/interfaces/customerinterface';
import { Orderlistinterface } from 'src/app/interfaces/orderlistinterface';
import { ApiService } from 'src/app/services/api.service';
import { GeneralFunctionsService } from 'src/app/services/general-functions.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [RouterModule, NgForOf],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent {
  public orderList: Orderlistinterface[] = [];

  public customer: Customerinterface = {
    label: 'Cliente',
    id: 0
  };
item: any;

  constructor(
    private router: Router,
    private api: ApiService,
    public generalFunctions: GeneralFunctionsService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      console.log('params de ordenes', params);
      this.customer = params;
      this.api.getCustomerOrders(this.customer.id).subscribe((responseOrders: Orderlistinterface[]) => {
        console.log('que pido: ', responseOrders)
        this.orderList = responseOrders;
      });
    });
  }  

  showDetail(orderId: any) {
    this.router.navigate(['visit/order-detail', { orderId }]);
  }

  onSort(event: any) {
    console.info(event);
  }


}
