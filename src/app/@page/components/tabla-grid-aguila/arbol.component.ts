import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ColumnaTabla } from '../../models/aguilaTabla';
import { Arbol } from '../../models/arbol';
import { EventoMenuOpciones, MenuOpciones } from '../../models/menu';
import { SweetService } from '../../services/sweet.service';

@Component({
  selector: 'app-arbol',
  templateUrl: './arbol.component.html',
  styleUrls: ['./arbol.component.css']
})
export class ArbolComponent implements OnInit {

  @Input() listaArbol: Arbol[] = [];
  @Input() columnas: ColumnaTabla[] = [];
  @Input() listaOpciones: MenuOpciones[] = []; //Lista de opciones a mostrar en la columna de tipo "opcion"

  @Output() eventMenu = new EventEmitter<EventoMenuOpciones>(); //Envia los eventos que producen los elementos del Menu de Opciones


  constructor(private sweetService: SweetService, public device: DeviceDetectorService) { }

  ngOnInit(): void {
  }

  clickEventoMenuOpciones(idEvento: number, objeto: any) {
    let e: EventoMenuOpciones = {
      idEvento: idEvento,
      objeto: objeto
    }
    this.eventMenu.emit(e);
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
