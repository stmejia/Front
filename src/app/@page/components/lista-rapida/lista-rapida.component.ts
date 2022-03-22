import { Columna } from './../../../prumod/table-grid/table-grid.component';
import { Component, Input, OnInit } from '@angular/core';
import { SweetService } from '../../services/sweet.service';

@Component({
  selector: 'app-lista-rapida',
  templateUrl: './lista-rapida.component.html',
  styleUrls: ['./lista-rapida.component.css']
})

export class ListaRapidaComponent implements OnInit {

  @Input() listaDatos: any[];
  @Input() columnas: Columna[];
  @Input() multi: boolean = false;
  @Input() identificador: string = 'id';

  imagenDefecto: string = './assets/img/LogoApp.png';
  itemsSeleccionados: any[] = [];

  constructor(private sweetService: SweetService) { }

  ngOnInit(): void {
  }

  seleccionarItem(item: any) {
    if (this.itemsSeleccionados.find(el => el[this.identificador] == item[this.identificador])) {
      this.itemsSeleccionados =
        this.itemsSeleccionados.filter(el => el[this.identificador] != item[this.identificador])
    } else {
      this.itemsSeleccionados.push(item);
    }
  }

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
}
