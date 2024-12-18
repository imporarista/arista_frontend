import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {

  @Input() title : string;
  @Input() breadcrumb : string;
  public window = window;

  constructor() {
  }

  ngOnInit() : void {  }

}
