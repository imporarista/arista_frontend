import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  registerCredentials: {
    user: string;
    password: string;
  }
  constructor(
    private api: ApiService
  ) {
    this.registerCredentials = { user: '', password: '' };
  }

  ngOnInit(): void {
    // if user is already logged in, redirect to home page
    if (localStorage.getItem('userId')!== null) {
      window.location.href = '/';
    }
  }

  loginUser() { // Agrega esta línea
    this.api.loginUser(this.registerCredentials)
    .subscribe((responseLogin: any) => {
      if (responseLogin.length > 0) {
        const userType = responseLogin[0].userType;
        const priceRateId = responseLogin[0].priceRateId;
        localStorage.setItem('userId', responseLogin[0].id);
        localStorage.setItem('userType', userType);
        localStorage.setItem('priceRateId', priceRateId);
        window.location.href = '/';
      } else {
        // todo alerta de error
      }
    })
  }

}
