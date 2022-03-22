import { Textos } from './../../../data/models/textos';
import { AsigEstacion } from './../../../data/models/asigEstacion';
import { ConfigService } from './../../../data/services/config.service';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Estaciontrabajo } from 'src/app/@aguila/data/models/estaciontrabajo';
import { Empresa } from 'src/app/@aguila/data/models/empresa';

@Component({
  selector: 'app-select-estacion',
  templateUrl: './select-estacion.component.html',
  styleUrls: ['./select-estacion.component.css']
})
export class SelectEstacionComponent implements OnInit {

  textos: Textos= null;
  cargando: boolean = true;
  constructor( public dialogRef: MatDialogRef<SelectEstacionComponent>,
    @Inject (MAT_DIALOG_DATA) public data:AsigEstacion[], private configService:ConfigService){
      this.cargarDatos();
  }

  ngOnInit(): void {
  }

  cargarDatos(){
    this.configService.getTextos().then(res=>{
      this.textos = res;
      //this.cargando = false;
    });
  }

  asignar(estacion:AsigEstacion){
    this.dialogRef.close();
    this.configService.cambiarEstacionTrabajo(estacion);
  }

  getImagen(empresa: Empresa): string {
    if (empresa.imagenLogo) {
      if (empresa.imagenLogo.imagenDefault) {
        if (empresa.imagenLogo.imagenDefault.urlImagen) {
          return empresa.imagenLogo.imagenDefault.urlImagen;
        } else {
          return this.configService.getConfigLogoEmpresa().urlImagenDefaul;
        }
      } else {
        return this.configService.getConfigLogoEmpresa().urlImagenDefaul;
      }
    } else {
      return this.configService.getConfigLogoEmpresa().urlImagenDefaul;
    }
  }
}
