import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, first, map, tap } from 'rxjs/operators';
import { Estaciontrabajo } from 'src/app/@aguila/data/models/estaciontrabajo';
import { Recurso } from 'src/app/@aguila/data/models/recurso';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { ConfiguracionComponent } from 'src/app/@page/models/configComponent';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';
import { ActivoOperaciones, ISEquipo } from '../models/activoOperaciones';

@Injectable({
  providedIn: 'root'
})
export class ActivoOperacionService {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/activoOperaciones";
  private configComponent = new BehaviorSubject<ConfiguracionComponent>(null);
  private recurso = new BehaviorSubject<Recurso>(null);
  private cargando = new BehaviorSubject<boolean>(true);
  private estacion: Estaciontrabajo;

  constructor(private sweetService: SweetService, private http: HttpClient, private configService: ConfigService,
    private modal: MatDialog) {
    if (!this.recurso.value) {
      this.cargarRecurso().pipe(
        first(val => val != null)
      ).subscribe(() => { this.cargarEstacionTrabajo() },
        (error) => {
          this.sweetService.sweet_alerta('Error', 'No es posible cargar el Recurso', 'error');
          this.paginaAnterior();
        }
      );
    }
  }

  cargarRecurso() {
    this.setCargando(true);
    return this.http.options(this.urlEndPoint).pipe(
      map((response: any) => response.aguilaData as Recurso),
      tap(recurso => {
        this.recurso.next(recurso);
      }),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  cargarEstacionTrabajo() {
    this.configService.getEstacionTrabajo().subscribe(res => {
      this.estacion = res.estacionTrabajo;
      this.setCargando(false);
    });
  }

  getPagina(categoria: string, noPagina: number) {
    return this.http.get(this.urlEndPoint +
      `?categoria=${categoria}&PageNumber=${noPagina}&idEmpresa=${this.estacion.sucursal.empresa.id}`)
      .pipe(first());
  }

  getEquipoCodigo(codigo: string) {
    return this.http.get(this.urlEndPoint + '/' + codigo + '/' + this.getEmpresa().id).pipe(
      first(),
      map((r: AguilaResponse<ISEquipo>) => r.aguilaData),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  // setISEquipo(isEquipo: any) {
  //   return this.http.post(this.urlEndPoint + '/is', isEquipo).pipe(
  //     first(),
  //     map((r: AguilaResponse) => r.aguilaData as ISEquipo),
  //     catchError((e) => {
  //       this.sweetService.sweet_Error(e);
  //       return throwError(e);
  //     })
  //   );
  // }

  getDatosFiltros(filtros: QueryFilter[], empresa: boolean = true) {
    if (this.validarPermiso('Consultar')) {
      let filter = "?";
      for (let filtro of filtros) {
        filter += `${filtro.filtro}=${filtro.parametro}&`
      }
      empresa ? filter += "idEmpresa=" + this.estacion.sucursal.empresa.id : filter = filter;

      return this.http.get(this.urlEndPoint + filter).pipe(
        first(),
        map((response: any) => response.aguilaData as ActivoOperaciones[]),
        catchError((e) => {
          this.sweetService.sweet_Error(e);
          return throwError(e);
        }));
    } else {
      this.errorPermiso("Consultar");
    }
  }

  abrirComponenteModal(component: ComponentType<any>) {
    return this.modal.open(component).afterClosed();
  }

  setConfiguracionComponent(configuracionComponent: ConfiguracionComponent) {
    this.configComponent.next(configuracionComponent);
  }

  getConfiguracionComponent(): Observable<ConfiguracionComponent> {
    return this.configComponent.asObservable();
  }

  paginaAnterior() {
    this.configService.regresar();
  }

  setCargando(estado: boolean) {
    this.cargando.next(estado);
  }

  getEmpresa() {
    return this.estacion.sucursal.empresa;
  }

  getCargando(): Observable<boolean> {
    return this.cargando.asObservable();
  }

  getRecurso() {
    return this.recurso.value;
  }

  validarPermiso(opcion: string): boolean {
    return this.configService.opcionDisponible(this.recurso.value.id, opcion);
  }

  getEstacionTrabajo(): Estaciontrabajo {
    return this.estacion;
  }

  regresar() {
    this.configService.regresar();
  }

  errorPermiso(permiso: string) {
    this.sweetService.sweet_error_permiso_recurso(this.recurso.value.nombre, permiso);
  }

  getImagenRecurso(propiedad) {
    return this.configService.getImagenRecursoConfiguracion(this.recurso.value.id, propiedad);
  }
}
