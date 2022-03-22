import { Component, OnInit } from '@angular/core';
import { ITEMS_MENU_TALLER } from './taller-menu';

@Component({
  selector: 'app-taller',
  templateUrl: './taller.component.html',
  styleUrls: ['./taller.component.css']
})
export class TallerComponent implements OnInit {

  menuItems = ITEMS_MENU_TALLER;

  constructor() { }

  ngOnInit(): void {
  }

}
