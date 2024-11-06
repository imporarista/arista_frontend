import { Component, OnInit, HostListener } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { NavService } from '../../services/nav.service';

@Component({
  selector: 'app-tap-to-top',
  templateUrl: './tap-to-top.component.html',
  styleUrls: ['./tap-to-top.component.scss']
})
export class TapToTopComponent implements OnInit {
  
  public show: boolean = false;
  public showButtons: boolean = false;

  constructor(private viewScroller: ViewportScroller,
    private router: Router,
    private navServices: NavService
  ) {

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showButtons = event.url.includes('/home/catalog');
      }
    });
  }

  ngOnInit(): void {
  }

  // @HostListener Decorator
  @HostListener("window:scroll", [])
  onWindowScroll() {
    let number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  	if (number > 600 && this.showButtons) { 
  	  this.show = true;
  	} else {
  	  this.show = false;
  	}
  }

  tapToTop() {
  	this.viewScroller.scrollToPosition([0, 0]);
  }

  tapToCart() {
    this.router.navigate(['/shop/cart']);
  } 

  openSearch() {
    this.navServices.search = !this.navServices.search;
  }

  openMenu() {
    this.navServices.leftMenuToggle = !this.navServices.leftMenuToggle;
  }
}
