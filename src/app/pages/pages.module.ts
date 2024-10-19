import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { GalleryModule } from '@ks89/angular-modal-gallery';
import { SharedModule } from '../shared/shared.module';
import { PagesRoutingModule } from './pages-routing.module';

import { GalleryModule } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';

// Pages Components
import { WishlistComponent } from './account/wishlist/wishlist.component';
import { CartComponent } from './account/cart/cart.component';
import { DashboardComponent } from './account/dashboard/dashboard.component';
import { LoginComponent } from './account/login/login.component';
import { RegisterComponent } from './account/register/register.component';
import { ForgetPasswordComponent } from './account/forget-password/forget-password.component';
import { ProfileComponent } from './account/profile/profile.component';
import { ContactComponent } from './account/contact/contact.component';
import { CheckoutComponent } from './account/checkout/checkout.component';
import { SearchComponent } from './search/search.component';
import { TypographyComponent } from './typography/typography.component';
import { ReviewComponent } from './review/review.component';
import { OrderSuccessComponent } from './order-success/order-success.component';
import { CollectionComponent } from './collection/collection.component';
import { LookbookComponent } from './lookbook/lookbook.component';
import { ErrorComponent } from './error/error.component';
import { FaqComponent } from './faq/faq.component';
// Portfolio Components
import { GridTwoComponent } from './portfolio/grid-two/grid-two.component';
import { GridThreeComponent } from './portfolio/grid-three/grid-three.component';
import { GridFourComponent } from './portfolio/grid-four/grid-four.component';
import { MasonryGridTwoComponent } from './portfolio/masonry-grid-two/masonry-grid-two.component';
import { MasonryGridThreeComponent } from './portfolio/masonry-grid-three/masonry-grid-three.component';
import { MasonryGridFourComponent } from './portfolio/masonry-grid-four/masonry-grid-four.component';
import { MasonryFullWidthComponent } from './portfolio/masonry-full-width/masonry-full-width.component';

@NgModule({
  declarations: [
    WishlistComponent,
    CartComponent,
    DashboardComponent,
    LoginComponent,
    RegisterComponent,
    ForgetPasswordComponent,
    ProfileComponent,
    ContactComponent,
    CheckoutComponent,
    SearchComponent,
    TypographyComponent,
    ReviewComponent,
    OrderSuccessComponent,
    CollectionComponent,
    LookbookComponent,
    ErrorComponent,
    FaqComponent,
    GridTwoComponent,
    GridThreeComponent,
    GridFourComponent,
    MasonryGridTwoComponent,
    MasonryGridThreeComponent,
    MasonryGridFourComponent,
    MasonryFullWidthComponent
  ],
  imports: [
    CommonModule,
    GalleryModule,
    LightboxModule,
    SharedModule,
    PagesRoutingModule
  ]
})
export class PagesModule { }
