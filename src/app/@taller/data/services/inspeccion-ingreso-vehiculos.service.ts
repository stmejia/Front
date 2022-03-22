import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { QR } from 'pdfmake-wrapper';
import { forkJoin } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { DetalleInspeccion } from '../models/detalleCondicion';

@Injectable({
  providedIn: 'root'
})
export class InspeccionIngresoVehiculosService extends ServicioComponente {

  constructor(http: HttpClient, sw: SweetService, modal: MatDialog, cs: ConfigService) {
    super("/api/condicionTallerVehiculo", http, sw, cs, modal);
  }

  agregarDetalleInspeccion(detalle: DetalleInspeccion) {
    return this.getHttp().post(this.getUrlBase() + `/api/detalleCondicion`, detalle)
      .pipe(first(), map((res: AguilaResponse<DetalleInspeccion>) => res.aguilaData));
  }

  autorizarReparacion(detalle: DetalleInspeccion) {
    if (!this.validarPermiso('Autorizar Reparación')) {
      this.errorPermiso("Autorizar Reparación");
      return;
    }
    this.sweetService.sweet_carga('Guardando Cambios');
    detalle.aprobado = true;
    detalle.fechaAprobacion = new Date();
    detalle.idUsuarioAutoriza = this.getUsuarioActual().id;
    return this.getHttp().put(this.getUrlBase() + `/api/detalleCondicion/${detalle.id}`, detalle)
      .pipe(first(), map((res: AguilaResponse<boolean>) => res.aguilaData));
  }

  rechazarReparacion(detalle: DetalleInspeccion) {
    if (!this.validarPermiso('Rechazar Reparación')) {
      this.errorPermiso("Rechazar Reparación");
      return;
    }
    this.sweetService.sweet_carga('Guardando Cambios');
    detalle.aprobado = false;
    detalle.fechaAprobacion = new Date();
    detalle.idUsuarioAutoriza = this.getUsuarioActual().id;
    return this.getHttp().put(this.getUrlBase() + `/api/detalleCondicion/${detalle.id}`, detalle)
      .pipe(first(), map((res: AguilaResponse<boolean>) => res.aguilaData));
  }

  getDetalleInspeccion(idInspeccion: number, filtros: QueryFilter[]) {
    this.sweetService.sweet_carga("Cargando Información");
    if (!this.validarPermiso('Consultar')) {
      this.errorPermiso("Consultar");
      return;
    }

    let filter = "?";
    for (let filtro of filtros) {
      filter += `${filtro.filtro}=${filtro.parametro}&`
    }
    filter += "idEmpresa=" + this.estacion.sucursal.empresa.id;
    return this.getHttp().get(this.getUrlBase() + `/api/detalleCondicion/historial${filter}&idCondicion=${idInspeccion}`)
      .pipe(first(), map((res: AguilaResponse<DetalleInspeccion[]>) => res));
  }

  async imprimirCondicion(id: number) {
    this.sweetService.sweet_carga('Generando Documento', true);
    forkJoin([
      this.consultar(id),
      //this.getDetalleInspeccion()
    ]).subscribe(res => {
      try {
        //let CodigoQR = new QR(res.condicionActivo.id.toString()).fit(80).alignment("center").margin([0, 10, 0, 0]).end;
        let logoEmpresa;
        let firmaCondicion;
      } catch (error) {
        console.log(error);
        this.sweetService.sweet_alerta("Error", "No fue posible generar el documento.", "error");
      }
    });

  }
}
