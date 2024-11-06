import { ApiService } from 'src/app/services/api.service';
import { Category } from 'src/app/interfaces/category';
import { Component, OnInit } from '@angular/core';
import { NavService, Menu } from '../../services/nav.service';
import { Router } from '@angular/router';
import { Subcategory } from './../../../interfaces/subcategory';

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent implements OnInit {
  public window = window;
  public menuItems: Menu[];
  public categories: Category[];
  private userId = 3;

  constructor(
    private router: Router, 
    public navServices: NavService, private apiService: ApiService) {
    this.apiService.getCategories(this.userId).subscribe((categories: Category[]) => {
      this.categories =  categories;
      this.apiService.getSubCategories(this.userId).subscribe((subcategory: Subcategory[]) => {
        for (let category of this.categories) {
          category.menu_active = false;
          category.sub_category = subcategory.filter((sub_cat) => sub_cat.cat_id === category.cat_id)
        }
      });
    })
    this.navServices.leftMenuItems.subscribe(menuItems => this.menuItems = menuItems );
    this.router.events.subscribe((event) => {
      this.navServices.mainMenuToggle = false;
    });
  }

  ngOnInit(): void {
  }

  leftMenuToggle(): void {
    this.navServices.leftMenuToggle = !this.navServices.leftMenuToggle;
  }

  // Click Toggle menu (Mobile)
  toggletNavActive(item) {
    item.menu_active = !item.menu_active;
  }

  onHover(menuItem) {
    if(window.innerWidth > 1200 && menuItem){
       document.getElementById('unset').classList.add('sidebar-unset')
    } else {
      document.getElementById('unset').classList.remove('sidebar-unset')
    }
  }

}
