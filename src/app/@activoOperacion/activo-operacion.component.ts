import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ITEMS_MENU_ACTIVO_OPERACION } from './activo-operacion-menu';

@Component({
  selector: 'app-activo-operacion',
  templateUrl: './activo-operacion.component.html',
  styleUrls: ['./activo-operacion.component.css']
})
export class ActivoOperacionComponent implements OnInit {

  menuItems = ITEMS_MENU_ACTIVO_OPERACION;
  
  constructor() { }

  ngOnInit(): void {
  }

}
