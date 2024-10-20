import { authGuard } from '../guards/auth.guard';
import { CustomerLocationComponent } from './customer-location/customer-location.component';
import { CustomerOrdersComponent } from './customer-orders/customer-orders.component';
import { CustomerVisitListComponent } from './customer-visit-list/customer-visit-list.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerVisitsComponent } from './customer-visits/customer-visits.component';
import { OrderListComponent } from './order-list/order-list.component';

const routes: Routes = [
  // filtros
  {
    path: 'customer-visits-list',
    component: CustomerVisitListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'customer-visits',
    component: CustomerVisitsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'customer-orders',
    component: CustomerOrdersComponent,
    canActivate: [authGuard]
  },
  {
    path: 'customer-location',
    component: CustomerLocationComponent,
    canActivate: [authGuard]
  },
  {
    path: 'order-list',
    component: OrderListComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisitRoutingModule { }
