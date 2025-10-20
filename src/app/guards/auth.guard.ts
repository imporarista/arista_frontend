import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const isLoggedIn = localStorage.getItem('userId') !== null;
  const userType = localStorage.getItem('userType');
  
  if (!isLoggedIn) {
    router.navigate(['/login']);
    return false;
  }
  
  if (state.url.includes('visit') && userType !== '2') {
    router.navigate(['/login']);
    return false;
  }
  
  return true;
};