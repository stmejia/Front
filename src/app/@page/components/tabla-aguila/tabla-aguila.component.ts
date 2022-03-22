import { EventoMenuOpciones, MenuOpciones } from './../../models/menu';
import { EventoPaginador, Paginador } from './../../models/paginador';
import { SweetService } from './../../services/sweet.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Columna } from '../../models/columna';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-tabla-aguila',
  templateUrl: './tabla-aguila.component.html',
  styleUrls: ['./tabla-aguila.component.css']
})
export class TablaAguilaComponent implements OnInit {

  @Input() listaDatos: any[]; //Lista de datos a mostrar en la tabla
  @Input() listaOpciones: MenuOpciones[] = []; //Lista de opciones a mostrar en la columna de tipo "opcion"
  @Input() columnas: Columna[]; //Lista de columnas a mostrar en la tabla
  @Input() paginador: Paginador = null; //Datos para mostrar el paginador
  //Propiedad por la cual se identificaran los elementos en la lista. Se utiliza cuando la tabla se muestra en modo Modal y el modo de seleccion es multi es true
  @Input() identificador: string = 'id';
  @Input() modal: boolean = false; //Indica si la tabla se usara en modo modal;
  @Input() multi: boolean = false; //Indica si el modo de seleccion en modal sera unico (false) o multiple seleccion (true)
  @Input() buscador: boolean = true; //Indica si se mostrara el buscador

  @Output() eventBuscador = new EventEmitter<string>(); //Envia los eventos que produce el buscador de la tabla
  @Output() eventPaginador = new EventEmitter<EventoPaginador>(); //Envia los eventos que produce el paginador (cuando hacen click en un numero de pagina)
  @Output() eventMenu = new EventEmitter<EventoMenuOpciones>(); //Envia los eventos que producen los elementos del Menu de Opciones

  imagenDefecto: string = './assets/img/LogoApp.png';
  itemsSeleccionados: any[] = [];
  filtro: string = "";

  constructor(private sweetService: SweetService, public device: DeviceDetectorService) {
  }

  ngOnInit(): void { }

  mostrarImagen(urlImagen: string) {
    this.sweetService.sweetImagen(urlImagen);
  }

  getImagen(item: any): string {
    if (item.imagenLogo) {
      if (item.imagenLogo.imagenDefault) {
        if (item.imagenLogo.imagenDefault.urlImagen) {
          return item.imagenLogo.imagenDefault.urlImagen;
        } else {
          return this.imagenDefecto;
        }
      } else {
        return this.imagenDefecto;
      }
    } else {
      return this.imagenDefecto;
    }
  }

  eventoBuscador() {
    this.eventBuscador.emit(this.filtro);
  }

  seleccionarItem(item: any) {
    if (this.itemsSeleccionados.find(el => el[this.identificador] == item[this.identificador])) {
      this.itemsSeleccionados =
        this.itemsSeleccionados.filter(el => el[this.identificador] != item[this.identificador])
    } else {
      this.itemsSeleccionados.push(item);
    }
  }

  clickEventPaginador(pagina: number) {
    let e: EventoPaginador = {
      filtro: this.filtro,
      noPagina: pagina
    }
    this.eventPaginador.emit(e);
  }

  clickEventoMenuOpciones(idEvento: number, objeto: any) {
    let e: EventoMenuOpciones = {
      idEvento: idEvento,
      objeto: objeto
    }
    this.eventMenu.emit(e);
  }

  filtrarTabla(): any[] {
    let filtro = this.filtro.toLowerCase();
    return this.listaDatos.filter((item) => {
      for (let propiedad in item) {
        switch (typeof item[propiedad]) {
          case 'string':
            if (item[propiedad].toLowerCase().includes(filtro)) {
              return true;
              break;
            }
            break;
          case 'number':
            if (item[propiedad].toString().toLowerCase().includes(filtro)) {
              return true;
              break;
            }
            break;
          case 'object':
            if (this.buscarObjeto(item[propiedad], filtro)) {
              return true;
            }
            break;
        }
      }
    });
  }

  buscarObjeto(item: any, filtro): boolean {
    for (let propiedad in item) {
      switch (typeof item[propiedad]) {
        case 'string':
          if (item[propiedad].toLowerCase().includes(filtro)) {
            return true;
            break;
          }
          break;
        case 'number':
          if (item[propiedad].toString().toLowerCase().includes(filtro)) {
            return true;
            break;
          }
          break;
      }
    }
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

  getDatos(): any[] {
    return this.filtrarTabla();
  }
}