import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-footer-two',
  standalone: true,
  imports: [RouterModule, SharedModule],
  templateUrl: './footer-two.component.html',
  styleUrl: './footer-two.component.scss'
})
export class FooterTwoComponent {
  public userType: string;
  public active = 4;
  footer: any;

  constructor(
    private router: Router,
  ) {
    this.userType = localStorage.getItem('userType');
    console.log('ruta:', this.router.url)
    switch(this.router.url) {
      case '/visit/customer-visits-list':
        this.active = 1;
        break;
      case 'B':
        this.active = 2;
        break;
      case '/visit/customer-orders':
        this.active = 3;
        break;
      case '/visit/customer-location':
        console.log('si estoy en location')
        this.active = 4;
        break;
      default:
        this.active = 1;
        break;
    }
  };
}
