import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { first, map } from 'rxjs/operators';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { Empleado } from 'src/app/@catalogos/data/models/empleado';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpleadosIngresosService extends ServicioComponente {

  private urlEmpleados = environment.UrlAguilaApi + "/api/empleados";

  constructor(http: HttpClient, sw: SweetService, cs: ConfigService, modal: MatDialog) {
    super("/api/empleadosIngresos", http, sw, cs, modal);
  }

  guardar(data) {
    if (!this.validarPermiso("Agregar")) {
      this.errorPermiso("Agregar");
      return;
    }
    this.sweetService.sweet_carga("Guardando");
    return this.http.post(this.urlEndPoint, data).pipe(first());
  }

  buscarEmpleado(cui: string) {
    this.sweetService.sweet_carga("Cargando Información");
    if (!this.validarPermiso('Consultar')) {
      this.errorPermiso("Consultar");
      return;
    }
    return this.http.get(this.urlEmpleados + `/empleado/${cui}`).pipe(
      first(),
      map((response: AguilaResponse<Empleado>) => response.aguilaData),
    );
  }
}
