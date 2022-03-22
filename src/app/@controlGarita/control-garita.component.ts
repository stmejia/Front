import { Component, OnInit } from '@angular/core';
import { ITEMS_MENU_ACTIVO_OPERACION } from './control-garita-menu';

@Component({
  selector: 'app-control-garita',
  templateUrl: './control-garita.component.html',
  styleUrls: ['./control-garita.component.css']
})
export class ControlGaritaComponent implements OnInit {

  menuItems = ITEMS_MENU_ACTIVO_OPERACION;
  
  constructor() { }

  ngOnInit(): void {
  }

}
