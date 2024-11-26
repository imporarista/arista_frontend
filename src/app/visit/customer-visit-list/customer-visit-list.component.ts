import { NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Visitinterface } from 'src/app/interfaces/visitinterface';
import { ApiService } from 'src/app/services/api.service';
import { GeneralFunctionsService } from 'src/app/services/general-functions.service';
import { Router, RouterModule } from '@angular/router';
import { FooterTwoComponent } from 'src/app/footer/footer-two/footer-two.component';
import { Location } from '@angular/common';


@Component({
  selector: 'app-customer-visit-list',
  standalone: true,
  imports: [FormsModule, NgbModule, NgForOf, NgIf, RouterModule, FooterTwoComponent],
  templateUrl: './customer-visit-list.component.html',
  styleUrl: './customer-visit-list.component.scss'
})
export class CustomerVisitListComponent implements OnInit {
  public searchText: string;
  private userId: string;
  public visits: Array<Visitinterface>;
  public dateList = {
    filterDate: this.generalFunctionsService.getCurrentDate()
  };
  public totalTime = '';
  public monthShortNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  public userType: string;
  visit: Visitinterface;

  constructor(
    private apiservice: ApiService,
    public generalFunctionsService: GeneralFunctionsService,
    private router: Router,
    private location: Location) {
    this.userId = localStorage.getItem('userId');
    this.userType = localStorage.getItem('userType');
    this.visits = [];
  }

  ngOnInit(): void {
    const date = new Date();
    const dateformat = date.getFullYear() + '-' + this.formatNumberDate(date.getMonth() + 1) + '-' + this.formatNumberDate(date.getDate());
    this.apiservice.getSellerVisit(dateformat, this.userId).subscribe((data) => {
      this.visits = data;
      this.getTotalTime();
    });
  }

  getTotalTime() {
    let total = 0;
    for (const visit of this.visits) {
      total += Number(visit.visitSpendTime);
    }
    this.totalTime = this.generalFunctionsService.msToTime(total);
  }

  onSort(event: any) {
    console.info(event);
  }

  formatNumberDate(number: any) {
    if (number < 10) {
      number = '0' + number;
    }
    return number;
  }

  newVisit() {
    this.router.navigate(['visit/customer-visits']);
  }

  goVisitCatalog() {
    this.router.navigate(['visit/home/catalog']);
  }

  goBack() {
    this.location.back();
  }
}
