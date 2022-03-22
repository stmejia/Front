import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Columna } from '../../models/columna';

@Component({
  selector: 'app-select-aguila',
  templateUrl: './select-aguila.component.html',
  styleUrls: ['./select-aguila.component.css']
})
export class SelectAguilaComponent implements OnInit {

  @Input() nombre: string = "Seleccione una opcion";
  @Input() identificador: string = "id";
  @Input() columnas: Columna[] = [];
  @Input() datos: any[] = [];
  @Input() itemSelect: any;

  @Output() itemSeleccionado = new EventEmitter<any>();
  @Output() objetoSeleccionado = new EventEmitter<any>();
  @Output() textoIngresado = new EventEmitter<string>();

  filtro: string = "";

  constructor() { }

  ngOnInit(): void {
  }

  seleccionarItem(valor: any) {
    this.itemSeleccionado = valor;
  }

  selectItem() {
    this.itemSeleccionado.emit(this.itemSelect);
    this.objetoSeleccionado.emit(this.datos.filter(v => v[this.identificador] == this.itemSelect)[0]);
  }

  buscarEnter() {
    this.textoIngresado.emit(this.filtro);
  }

  getDatoObjeto(item: any, target: string[]) {
    switch (target.length) {
      case 1:
        if (item[target[0]]) {
          return item[target[0]];
        } else {
          return "";
        }
        break;
      case 2:
        if (item[target[0]]) {
          return item[target[0]][target[1]];
        } else {
          return "";
        }
        break;
      case 3:
        if (item[target[0]]) {
          if (item[target[0]][target[1]]) {
            return item[target[0]][target[1]][target[2]];
          } else {
            return "";
          }
        } else {
          return "";
        }
        break;
      case 4:
        if (item[target[0]]) {
          if (item[target[0]][target[1]]) {
            if (item[target[0]][target[1]][target[2]]) {
              return item[target[0]][target[1]][target[2]][target[3]];
            } else {
              return "";
            }
          } else {
            return "";
          }
        } else {
          return "";
        }
        break;
      case 5:
        if (item[target[0]]) {
          if (item[target[0]][target[1]]) {
            if (item[target[0]][target[1]][target[2]]) {
              if (item[target[0]][target[1]][target[2]][target[3]]) {
                return item[target[0]][target[1]][target[2]][target[3]][target[4]];
              } else {
                return "";
              }
            } else {
              return "";
            }
          } else {
            return "";
          }
        } else {
          return "";
        }
        break;
    }
  }

  buscarItem(): any[] {
    let filtro = this.filtro.toLowerCase();
    if(!this.datos) return;
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
    return this.buscarItem();
  }
}
