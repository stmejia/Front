import { Component, OnInit } from '@angular/core';
import { ITEMS_MENU_RRHH } from './rrhh-menu';

@Component({
  selector: 'app-rrhh',
  templateUrl: './rrhh.component.html',
  styleUrls: ['./rrhh.component.css']
})
export class RRHHComponent implements OnInit {

  menuItems = ITEMS_MENU_RRHH;

  constructor() { }

  ngOnInit(): void {
  }

}
