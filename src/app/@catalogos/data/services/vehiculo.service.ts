import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, first, map, tap } from 'rxjs/operators';
import { ConfigService } from './../../../@aguila/data/services/config.service';
import { HttpClient } from '@angular/common/http';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { Vehiculo } from '../models/vehiculo';
import { MatDialog } from '@angular/material/dialog';
import { TipoVehiculo } from '../models/tipoVehiculo';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class VehiculoService extends ServicioComponente {

  private tiposVehiculos = new BehaviorSubject<TipoVehiculo[]>([]);
  private urlTipoVehiculo = environment.UrlAguilaApi + "/api/tipoVehiculos";

  constructor(sw: SweetService, http: HttpClient, cs: ConfigService,
    modal: MatDialog) {
    super("/api/vehiculos", http, sw, cs, modal);
  }

  //Sobre escribimos el metodo
  cargarEstacionTrabajo(): void {
    this.configService.getEstacionTrabajo().subscribe(res => {
      this.estacion = res.estacionTrabajo;
      this.limpiarVariables();
      this.cargarDatos();
    });
  };

  cargarDatos() {
    this.http.get(this.urlTipoVehiculo +
      `?idEmpresa=${this.getEmpresa().id}`).pipe(first(),
        map((response: any) => response.aguilaData as TipoVehiculo[]))
      .subscribe(res => {
        this.tiposVehiculos.next(res);
        this.setCargando(false);
      }, (error) => {
        this.sweetService.sweet_Error(error);
        this.paginaAnterior();
      });
  }

  getId(id: number) {
    return this.http.get(this.urlEndPoint + "/" + id).pipe(
      first(),
      map((response: any) => response.aguilaData as Vehiculo)
    );
  }

  crear(item: Vehiculo) {
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.post(this.urlEndPoint, item).pipe(
      map((res: any) => res.aguilaData as Vehiculo),
      tap((res) => {
        //this.listaDatos.getValue().push(res);
      }),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  modificar(item: Vehiculo) {
    this.sweetService.sweet_carga('Guardando Cambios');
    return this.http.put(this.urlEndPoint + "/" + item.idActivo, item).pipe(
      map((res: any) => res.aguilaData as boolean),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  getTiposVehiculos() {
    return this.tiposVehiculos.asObservable();
  }

  getTiposVehiculosValue() {
    return this.tiposVehiculos.value;
  }

  getCUI() {

  }
}
