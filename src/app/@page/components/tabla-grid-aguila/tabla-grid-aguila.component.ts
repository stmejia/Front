import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Columna } from '../../models/columna';
import { SweetService } from '../../services/sweet.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { Arbol } from '../../models/arbol';
import { EventoMenuOpciones, MenuOpciones } from '../../models/menu';
import { EventoPaginador, Paginador } from '../../models/paginador';
import { ColumnaTabla } from '../../models/aguilaTabla';

@Component({
  selector: 'app-tabla-grid-aguila',
  templateUrl: './tabla-grid-aguila.component.html',
  styleUrls: ['./tabla-grid-aguila.component.css']
})
export class TablaGridAguilaComponent implements OnInit {

  @Input() datos: any[] = []; //Lista de datos a mostrar en la tabla
  @Input() columnas: ColumnaTabla[]; //Lista de columnas a mostrar en la tabla
  @Input() agrupaciones: boolean = true; //Permite agrupar datos de la tabla
  @Input() listaOpciones: MenuOpciones[] = []; //Lista de opciones a mostrar en la columna de tipo "opcion"
  @Input() paginador: Paginador = null; //Datos para mostrar el paginador
  @Input() exportar: boolean = true;
  
  @Output() eventMenu = new EventEmitter<EventoMenuOpciones>(); //Envia los eventos que producen los elementos del Menu de Opciones
  @Output() eventPaginador = new EventEmitter<EventoPaginador>(); //Envia los eventos que produce el paginador (cuando hacen click en un numero de pagina)
  @Output() eventExcel = new EventEmitter<any>();
  @Output() eventPdf = new EventEmitter<any>();

  filtro: string = "";
  grupos: ColumnaTabla[] = [];
  dataArbol: Arbol[] = [];
  mostrarTabla: boolean = true;

  constructor(private sweetService: SweetService, public device: DeviceDetectorService) { }

  ngOnInit(): void {
  }

  async drop(event: CdkDragDrop<Columna[]>) {
    let startTime = performance.now();
    if (event.previousContainer === event.container) {
      await moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.agrupar();
    } else {
      if (event.previousContainer.id == "listaDeTabla") {
        if (this.grupos.length < 3) {
          await transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
          this.agrupar();
        }
      } else {
        await transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        this.agrupar();
      }
    }
    let duration = performance.now() - startTime;
  }

  agrupar() {
    this.dataArbol = [];
    this.grupos.forEach((columna, i) => {
      
    });

    if (this.grupos.length > 0) {
      for (let i = 0; i < this.grupos.length; i++) {
        let arbol = new Arbol();
        //nivel 1
        if (i == 0) {
          let elementos = this.datos;
          for (let item of elementos) {
            arbol = new Arbol();
            arbol.nombre = `${this.grupos[i].titulo}:  ${this.getDatoObjeto(item, this.grupos[i].target)}`;
            arbol.data = elementos.filter((el) => this.getDatoObjeto(el, this.grupos[i].target) == this.getDatoObjeto(item, this.grupos[i].target));
            elementos = elementos.filter((el) => this.getDatoObjeto(el, this.grupos[i].target) !== this.getDatoObjeto(item, this.grupos[i].target));
            if (arbol.data.length > 0) {
              this.dataArbol.push(arbol);
            }
          }
          this.mostrarTabla = false;
        }
        //nivel 2
        if (i == 1) {
          for (let ar of this.dataArbol) {
            ar.children = [];
            let elementos = ar.data;
            for (let data of ar.data) {
              let a = new Arbol();
              a.nombre = `${this.grupos[i].titulo}: ${this.getDatoObjeto(data, this.grupos[i].target)}`;
              a.data = elementos.filter((el) => this.getDatoObjeto(el, this.grupos[i].target) == this.getDatoObjeto(data, this.grupos[i].target));
              elementos = elementos.filter((el) => this.getDatoObjeto(el, this.grupos[i].target) !== this.getDatoObjeto(data, this.grupos[i].target));
              if (a.data.length > 0) {
                ar.children.push(a);
              }
            }
          }
        }
        //Nivel 3
        if (i == 2) {
          for (let ar of this.dataArbol) {
            for (let chil of ar.children) {
              chil.children = [];
              let elementos = chil.data;
              for (let data of chil.data) {
                let a = new Arbol();
                a.nombre = `${this.grupos[i].titulo}: ${this.getDatoObjeto(data, this.grupos[i].target)}`;
                a.data = elementos.filter((el) => this.getDatoObjeto(el, this.grupos[i].target) == this.getDatoObjeto(data, this.grupos[i].target));
                elementos = elementos.filter((el) => this.getDatoObjeto(el, this.grupos[i].target) !== this.getDatoObjeto(data, this.grupos[i].target));
                if (a.data.length > 0) {
                  chil.children.push(a);
                }
              }
            }
          }
        }
        //Nivel 4
        if (i == 3) {
        }
        //Nivel 5
        if (i == 4) {
        }
      }
    }

    if (this.grupos.length == 0) {
      this.mostrarTabla = true;
    }
  }

  getDatoObjeto(item: any, target: string[]) {
    if (item) {
      let n = item;
      target.forEach(i => {
        n = n[i] ? n[i] : "";
      });
      return n;
    } else {
      return "";
    }
  }

  mostrarImagen(urlImagen: string) {
    this.sweetService.sweetImagen(urlImagen);
  }

  filtrarTabla(lista: any[]): any[] {
    let filtro = this.filtro.toLowerCase();
    if (lista.length > 0) {
      return lista.filter((item) => {
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
    } else {
      return [];
    }
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

  ordenarColumna(columna: Columna) {
    return;
    let lista: any[] = this.getDatos();

    if (lista.length > 0) {
      switch (typeof lista[0][columna.targetId]) {
        //Metodo de ordenamiento en base al tipo
        case "string":
          switch (columna.orden) {
            case null:
              columna.orden = true;
              lista.sort(function (a, b) {
                if (a[columna.targetId] > b[columna.targetId]) {
                  return 1;
                }
                if (a[columna.targetId] < b[columna.targetId]) {
                  return -1;
                }
                return 0;
              });
              break;

            case true:
              columna.orden = false;
              lista.sort(function (a, b) {
                if (b[columna.targetId] > a[columna.targetId]) {
                  return 1;
                }
                if (b[columna.targetId] < a[columna.targetId]) {
                  return -1;
                }
                return 0;
              });
              break;

            case false:
              columna.orden = null;
              this.filtrarTabla(this.datos.map(v => v));
              break;
          }

          // this.ordenar();
          break;

        case "boolean":
          console.log("es un Booleano");
          break;

        case "number":
          switch (columna.orden) {
            case null:
              columna.orden = true;
              lista.sort(((a, b) => a[columna.targetId] - b[columna.targetId]));
              break;
            case true:
              columna.orden = false;
              lista.sort(((a, b) => b[columna.targetId] - a[columna.targetId]));
              break;
            case false:
              columna.orden = null;
              this.filtrarTabla(this.datos.map(v => v));
              break;
          }
          break;
      }
      this.filtrarTabla(lista);
    }
  }

  getDatos(): any[] {
    return this.filtrarTabla(this.datos);
  }

  clickEventoMenuOpciones(idEvento: number, objeto: any) {
    let e: EventoMenuOpciones = {
      idEvento: idEvento,
      objeto: objeto
    }
    this.eventMenu.emit(e);
  }

  clickEventPaginador(pagina: number) {
    let e: EventoPaginador = {
      filtro: this.filtro,
      noPagina: pagina
    }
    this.eventPaginador.emit(e);
  }

  generarExcel() {
    let evento: any = {};
    evento.grupos = this.grupos.length == 0 ? false : true;
    evento.arbo = this.dataArbol;
    evento.columnas = this.columnas;
    evento.datos = this.datos;
    this.eventExcel.emit(evento);
  }

  generarPdf() {
    let evento: any = {};
    evento.grupos = this.grupos.length == 0 ? false : true;
    evento.arbo = this.dataArbol;
    evento.columnas = this.columnas;
    evento.datos = this.datos;
    this.eventPdf.emit(evento);
  }

  getCssAligment(columna: ColumnaTabla) {
    switch (columna.aligment) {
      case 'center':
        return this.device.isMobile() == false ? { "text-center": true } : { "text-left": true };
        break;
      case 'justify':
        return this.device.isMobile() == false ? { "text-justify": true } : { "text-left": true };
        return "text-justify"
        break;
      case 'left':
        return { "text-left": true };
        break;
      case 'right':
        return this.device.isMobile() == false ? { "text-right": true } : { "text-left": true };
        break;
      default:
        return { "text-left": true };
        break;
    }
  }
}
