import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CatalogComponent } from './catalog/catalog.component';
import { FashionOneComponent } from './fashion/fashion-one/fashion-one.component';
import { WatchComponent } from './watch/watch.component';
import { authGuard } from '../guards/auth.guard';
import { HomeComponent } from './home.component';

const routes: Routes = [

  // filtros
  {
    path: 'catalog',
    component: CatalogComponent,
    canActivate: [authGuard]
  },
  {
    path: 'catalog/:cat_id',
    component: CatalogComponent,
    canActivate: [authGuard]
  },
  {
    path: 'catalog/:cat_id/:subc_id',
    component: CatalogComponent,
    canActivate: [authGuard]
  },
  // codigo pre existente
  {
    path: 'fashion',
    component: FashionOneComponent
  },
  {
    path: 'watch',
    component: WatchComponent
  },

  {
  path: '',
  component: HomeComponent,
  canActivate: [authGuard]
}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
