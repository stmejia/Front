import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, map } from 'rxjs/operators';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { ISEquipo } from 'src/app/@catalogos/data/models/activoOperaciones';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ControlIEEquipoService extends ServicioComponente {

  constructor(http: HttpClient, sw: SweetService, cs: ConfigService) {
    super("/api/controlEquipoAjeno", http, sw, cs);
  }

  guardarRegistro(data) {
    if (!this.validarPermiso("Agregar")) {
      this.errorPermiso("Agregar");
      return;
    }
    this.sweetService.sweet_carga("Guardando");
    return this.http.post(this.urlEndPoint, data).pipe(first());
  }

  getEquipoCodigo(codigo: string) {
    //this.sweetService.sweet_carga("Buscando Equipo");
    return this.http.get(environment.UrlAguilaApi + "/api/activoOperaciones/" + codigo + "/" + this.getEmpresa().id).pipe(
      first(),
      map((r: AguilaResponse<ISEquipo>) => r.aguilaData)
    );
  }
}
