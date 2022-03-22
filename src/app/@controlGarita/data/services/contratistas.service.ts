import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, map } from 'rxjs/operators';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Contratista } from '../models/contratista';

@Injectable({
  providedIn: 'root'
})
export class ContratistasService extends ServicioComponente {

  constructor(http: HttpClient, sw: SweetService, cs: ConfigService) {
    super("/api/controlContratistas", http, sw, cs);
  }

  marcarIngreso(visita: Contratista) {
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
      .pipe(first())
  }

  buscarContratistaIdentificacion(identificacion: string) {
    this.sweetService.sweet_carga('Guardando Registro');
    if (!this.validarPermiso("Consultar")) {
      this.errorPermiso("Consultar");
    }
    return this.http.get(this.urlEndPoint + "/contratista/" + identificacion)
      .pipe(first(), map((res: AguilaResponse<Contratista>) => res.aguilaData));
  }

  buscarXDocumento(identificacion: string) {
    if (!this.validarPermiso("Consultar")) {
      this.errorPermiso("Consultar");
    }
    return this.http.get(this.urlEndPoint + `/getContratista/${identificacion}`)
      .pipe(first(), map((res: AguilaResponse<Contratista>) => res.aguilaData));
  }
}
