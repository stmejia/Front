import { Component, OnInit } from '@angular/core';
import { ITEMS_MENUPRUMOD } from './prumod-menu';

@Component({
  selector: 'app-prumod',
  templateUrl: './prumod.component.html',
  styleUrls: ['./prumod.component.css']
})
export class PrumodComponent implements OnInit {

  menuItems = ITEMS_MENUPRUMOD;

  constructor() { }

  ngOnInit(): void {
  }

}
