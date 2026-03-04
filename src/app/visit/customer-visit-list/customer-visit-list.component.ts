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
  public currentPage = 1;
  public pageSize = 5;

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
      this.currentPage = 1;
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
    this.router.navigate(['/home/catalog']);
  }

  goBack() {
    this.location.back();
  }

  get pageCount(): number {
    if (!this.visits?.length) {
      return 1;
    }
    return Math.max(1, Math.ceil(this.visits.length / this.pageSize));
  }

  get pagedVisits(): Visitinterface[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.visits.slice(start, start + this.pageSize);
  }

  setPage(page: number) {
    if (page < 1) {
      page = 1;
    }
    if (page > this.pageCount) {
      page = this.pageCount;
    }
    this.currentPage = page;
  }

  nextPage() {
    this.setPage(this.currentPage + 1);
  }

  previousPage() {
    this.setPage(this.currentPage - 1);
  }
}
