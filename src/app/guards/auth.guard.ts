import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const isLoggedIn = localStorage.getItem('userId') !== null;
  const userType = localStorage.getItem('userType');
  if (!isLoggedIn) {
    window.location.href = '/login';
    return false;
  }
  if (state.url.includes('visit') && userType !== '2') {
    window.location.href = '/login';
    return false;
  }
  return true;
};
