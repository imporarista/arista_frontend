import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitRoutingModule } from './visit-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    VisitRoutingModule,
  ]
})
export class VisitModule { }
