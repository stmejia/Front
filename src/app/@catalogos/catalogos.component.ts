import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ITEMS_CATALOGOS_PROD, ITEMS_MENU_CATALOGOS } from './catalogos-menu';

@Component({
  selector: 'app-catalogos',
  templateUrl: './catalogos.component.html',
  styleUrls: ['./catalogos.component.css']
})
export class CatalogosComponent implements OnInit {

  menuItems = environment.production ? ITEMS_CATALOGOS_PROD : ITEMS_MENU_CATALOGOS;

  constructor() {
  }

  ngOnInit(): void { }
}