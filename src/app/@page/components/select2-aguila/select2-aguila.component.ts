import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Columna } from '../../models/columna';

@Component({
  selector: 'app-select2-aguila',
  templateUrl: './select2-aguila.component.html',
  styleUrls: ['./select2-aguila.component.css']
})
export class Select2AguilaComponent implements OnInit {

  @Input() identificador: string = "id";
  @Input() columnas: Columna[] = [];
  @Input() datos: any[];
  @Output() itemSeleccionado = new EventEmitter<any>();

  filtro: string = "";

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: any) {
    console.log(changes);
    this.datos = changes.datos.currentValue;
  }

  selectItem(itemSelect: any) {
    this.itemSeleccionado.emit(itemSelect);
  }

  buscarItem(): any[] {
    let filtro = this.filtro.toLowerCase();
    return this.datos.filter((item) => {
      for (let propiedad in item) {
        switch (typeof item[propiedad]) {
          case 'string':
            if (item[propiedad].toLowerCase().includes(filtro)) {
              return true;
              break;
            }
            break;
        }
      }
      return false;
    });
  }

  getItems() {
    console.log(this.buscarItem());
    
    return this.buscarItem();
  }

}
