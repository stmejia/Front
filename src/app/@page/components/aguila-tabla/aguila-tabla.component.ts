import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { DeviceDetectorService } from 'ngx-device-detector';
import { ColumnaTabla } from '../../models/aguilaTabla';
import { EventoMenuOpciones, MenuOpciones } from '../../models/menu';
import { EventoPaginador, Paginador } from '../../models/paginador';
import { SweetService } from '../../services/sweet.service';

@Component({
  selector: 'app-aguila-tabla',
  templateUrl: './aguila-tabla.component.html',
  styleUrls: ['./aguila-tabla.component.css']
})
export class AguilaTablaComponent implements OnInit {

  @Input() listaDatos: any[]; //Lista de datos a mostrar en la tabla
  @Input() listaOpciones: MenuOpciones[] = []; //Lista de opciones a mostrar en la columna de tipo "opcion"
  @Input() columnas: ColumnaTabla[]; //Lista de columnas a mostrar en la tabla
  @Input() paginador: Paginador = null; //Datos para mostrar el paginador
  //Propiedad por la cual se identificaran los elementos en la lista. Se utiliza cuando la tabla se muestra en modo Modal y el modo de seleccion es multi es true
  @Input() modal: boolean = false; //Indica si la tabla se usara en modo modal;
  @Input() multi: boolean = false; //Indica si el modo de seleccion en modal sera unico (false) o multiple seleccion (true)
  @Input() buscador: boolean = true; //Indica si se mostrara el buscador
  @Input() identificador: string = 'id';
  @Input() exportar: boolean = true;

  @Output() eventBuscador = new EventEmitter<string>(); //Envia los eventos que produce el buscador de la tabla
  @Output() eventPaginador = new EventEmitter<EventoPaginador>(); //Envia los eventos que produce el paginador (cuando hacen click en un numero de pagina)
  @Output() eventMenu = new EventEmitter<EventoMenuOpciones>(); //Envia los eventos que producen los elementos del Menu de Opciones

  filtro: string = "";
  itemsSeleccionados: any[] = [];

  //Otras Funciones
  grupos: ColumnaTabla[] = [];
  mostrarTabla: boolean = true;
  @Input() agrupaciones: boolean = false; //Permite agrupar datos de la tabla
  @Output() eventExcel = new EventEmitter<any>();
  @Output() eventPdf = new EventEmitter<any>();
  // Fin Funciones

  constructor(private sweetService: SweetService, public device: DeviceDetectorService) { }

  ngOnInit(): void {
    if (this.listaDatos == null) {
      this.listaDatos = [];
    }
  }

  mostrarImagen(urlImagen: string) {
    this.sweetService.sweetImagen(urlImagen);
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
    if (item) {
      let n = item;
      target.forEach(i => {
        n = n[i] ? n[i] : "";
      });
      return n;
    }
    return "";
  }

  getValorBolean(item: any, target: string[]) {
    if (item) {
      let n = item;
      target.forEach(i => {
        n = (n[i] == true || n[i] == false) ? n[i] : "";
      });
      return n;
    }
    return "";
  }

  getDatoObjetoConcatenar(item: any, target: string[][], caracterConcatenar: string) {
    let s: string = "";
    if (item) {
      target.forEach(t => {
        let n = item;
        t.forEach(i => {
          n = n[i] ? n[i] : "";
        });
        s += n.toString().trim();
        s += caracterConcatenar;
      });
    }
    return s;
  }

  getDatos(): any[] {
    return this.filtrarTabla();
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

  //Otras Funciones
  generarExcel() {
    let evento: any = {};
    evento.grupos = this.grupos.length == 0 ? false : true;
    evento.columnas = this.columnas;
    evento.datos = this.listaDatos;
    this.eventExcel.emit(evento);
  }

  generarPdf() {
    let evento: any = {};
    evento.grupos = this.grupos.length == 0 ? false : true;
    evento.columnas = this.columnas;
    evento.datos = this.listaDatos;
    this.eventPdf.emit(evento);
  }

  drop(event: CdkDragDrop<ColumnaTabla[]>) {
    moveItemInArray(this.columnas, event.previousIndex, event.currentIndex);
  }

  logValue(val) {
    console.log(val);
    return false;
  }
}
