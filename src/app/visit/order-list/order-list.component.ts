import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Customerinterface } from 'src/app/interfaces/customerinterface';
import { Orderlistinterface } from 'src/app/interfaces/orderlistinterface';
import { ApiService } from 'src/app/services/api.service';
import { GeneralFunctionsService } from 'src/app/services/general-functions.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Location } from '@angular/common';
@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [RouterModule, SharedModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent {
  public orderList: Orderlistinterface[] = [];
  amount: 0

  public customer: Customerinterface = {
    label: 'Cliente',
    id: 0
  };
item: any;
order: any;

  constructor(
    private router: Router,
    private api: ApiService,
    public generalFunctions: GeneralFunctionsService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.customer = params;
      this.api.getCustomerOrders(this.customer.id).subscribe((responseOrders: Orderlistinterface[]) => {
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

  goBack(): void {
    this.location.back();
  }

}
