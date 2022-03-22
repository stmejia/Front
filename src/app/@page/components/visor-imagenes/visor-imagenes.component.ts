import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VisorImagenesModal } from '../../models/modal';

@Component({
  selector: 'app-visor-imagenes',
  templateUrl: './visor-imagenes.component.html',
  styleUrls: ['./visor-imagenes.component.css']
})
export class VisorImagenesComponent implements OnInit {

  datosListos: boolean = false;
  lblMensajeCargando: string = "Cargando Información";
  imagenPrincipal: string = "";

  constructor(@Inject(MAT_DIALOG_DATA) public data: VisorImagenesModal) { }

  ngOnInit(): void {
    this.validarDatos();
  }

  validarDatos() {
    if (!this.data) {
      this.lblMensajeCargando = "Debe enviar información";
      return;
    }

    if (this.data.imagenes.length == 0) {
      this.lblMensajeCargando = "Sin imagenes para mostrar";
      return;
    }

    this.imagenPrincipal = this.data.imagenes[0].urlImagen;

    this.datosListos = true;

  }

}

