import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer-two',
  standalone: true,
  imports: [RouterModule, NgIf],
  templateUrl: './footer-two.component.html',
  styleUrl: './footer-two.component.scss'
})
export class FooterTwoComponent {
  public userType: string;
  footer: any;

  constructor(
    private router: Router,
  ) {
    this.userType = localStorage.getItem('userType');
  };

  goVisit() {
    this.router.navigate(['/customer-visits']);
  }
  goOrders() {
    this.router.navigate(['/customer-orders']);
  }

  goCatalog() {
    this.router.navigate(['./catalog']);
  }

  goToLocalizate() {
    this.router.navigate(['/customer-location']);
  }
}
