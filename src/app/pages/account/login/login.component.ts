import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  };

  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private api: ApiService,
    private router: Router
  ) {
    this.registerCredentials = { user: '', password: '' };
  }

  ngOnInit(): void {

    if (localStorage.getItem('userId') !== null) {
      this.router.navigate(['/home/catalog']);
    }
  }

  loginUser() {
    this.loading = true;
    this.errorMessage = '';

    this.api.loginUser(this.registerCredentials)
      .subscribe({
        next: (responseLogin: any) => {
          if (responseLogin.length > 0) {
            const userType = responseLogin[0].userType;
            const priceRateId = responseLogin[0].priceRateId;

            localStorage.setItem('userId', responseLogin[0].id);
            localStorage.setItem('userType', userType);
            localStorage.setItem('priceRateId', priceRateId);
            localStorage.setItem('userName', responseLogin[0].name);
            localStorage.setItem('userEmail', responseLogin[0].email);
            this.router.navigate(['/home/catalog']);
          } else {
            this.errorMessage = 'Usuario o contraseña incorrectos';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.errorMessage = 'Error al iniciar sesión. Por favor, intente nuevamente.';
          this.loading = false;
        }
      });
  }
}