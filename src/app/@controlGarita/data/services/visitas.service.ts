import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, map } from 'rxjs/operators';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { COP } from 'src/app/@page/models/cop';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Visita } from '../models/visita';

@Injectable({
  providedIn: 'root'
})
export class VisitasService extends ServicioComponente {

  constructor(http: HttpClient, sw: SweetService, cs: ConfigService) {
    super("/api/controlVisitas", http, sw, cs);
  }

  marcarIngreso(visita: Visita) {
    this.sweetService.sweet_carga('Guardando Registro');
    if (!this.validarPermiso("Ingreso")) {
      this.errorPermiso("Ingreso");
    }

    return this.http.post(this.urlEndPoint, visita).pipe(first());
  }

  marcarSalida(identificacion: string) {
    this.sweetService.sweet_carga('Guardando Registro');
    if (!this.validarPermiso("Salida")) {
      this.errorPermiso("Salida");
    }

    return this.http.put(this.urlEndPoint + "/salida/" + identificacion, {})
      .pipe(first());
  }

  buscarVisitaIdentificacion(identificacion: string) {
    this.sweetService.sweet_carga('Guardando Registro');
    if (!this.validarPermiso("Ingreso")) {
      this.errorPermiso("Ingreso");
    }
    return this.http.get(this.urlEndPoint + "/visita/" + identificacion)
      .pipe(first(), map((res: any) => res as AguilaResponse<Visita>),
        map(res => res.aguilaData));
  }

  buscarXDocumento(identificacion: string) {
    if (!this.validarPermiso("Consultar")) {
      this.errorPermiso("Consultar");
    }
    return this.http.get(this.urlEndPoint + `/getVisita/${identificacion}`)
      .pipe(first(), map((res: any) => res as AguilaResponse<Visita>),
        map(res => res.aguilaData));
  }

  getListaCops() {
    return this.http.get("./assets/listas/cop.json").pipe(first(), map(res => res as COP));
  }
}
