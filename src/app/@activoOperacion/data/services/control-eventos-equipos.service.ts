import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, throwError } from 'rxjs';
import { catchError, first, map, tap } from 'rxjs/operators';
import { Empresa } from 'src/app/@aguila/data/models/empresa';
import { Estaciontrabajo } from 'src/app/@aguila/data/models/estaciontrabajo';
import { Recurso } from 'src/app/@aguila/data/models/recurso';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { ConfiguracionComponent } from 'src/app/@page/models/configComponent';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { MenuOpciones } from 'src/app/@page/models/menu';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';
import { EventosControlEquipo } from '../models/eventosControlEquipo';

@Injectable({
  providedIn: 'root'
})
export class ControlEventosEquiposService {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/eventosControlEquipo";
  private estacion: Estaciontrabajo;
  private configComponent = new BehaviorSubject<ConfiguracionComponent>(null);
  private filtrosComponent = new BehaviorSubject<FiltrosC[]>([]);
  private recurso = new BehaviorSubject<Recurso>(null);
  private cargando = new BehaviorSubject<boolean>(true);
  private menuOpcionesTabla = new BehaviorSubject<MenuOpciones[]>([]);
  private columnas = new BehaviorSubject<ColumnaTabla[]>([]);
  private listaDatos = new BehaviorSubject<EventosControlEquipo[]>([]);

  constructor(private sweetService: SweetService, private http: HttpClient,
    private configService: ConfigService) {
    forkJoin([
      this.cargarRecurso().pipe(first(val => val != null)),
    ]).subscribe(res => {
      this.cargarEstacionTrabajo();
    });
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
      this.limpiarVariables();
      this.setCargando(false);
    });
  }

  limpiarVariables() {
    this.filtrosComponent.next([]);
    this.menuOpcionesTabla.next([]);
    this.columnas.next([]);
    this.listaDatos.next([]);
    this.configComponent.next(null);
  }

  crear(evento: EventosControlEquipo) {
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.post(this.urlEndPoint, evento).pipe(
      first(),
      map((res: any) => res.aguilaData as EventosControlEquipo),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  setRevision(evento: EventosControlEquipo) {
    if (!this.validarPermiso('Revisar')) {
      this.errorPermiso("Revisar");
      return throwError("Error De Permiso");
    }
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.put(this.urlEndPoint + '/revisar/' + evento.id, evento).pipe(
      first(),
      map((res: any) => res.aguilaData as EventosControlEquipo),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );

  }

  setSolucion(evento: EventosControlEquipo) {
    if (!this.validarPermiso('Resolver')) {
      this.errorPermiso("Resolver");
      return throwError("Error De Permiso");
    }
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.put(this.urlEndPoint + '/resolver/' + evento.id, evento).pipe(
      first(),
      map((res: any) => res.aguilaData as EventosControlEquipo),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  anular(evento: EventosControlEquipo) {
    if (!this.validarPermiso('Anular')) {
      this.errorPermiso("Revisar");
      return throwError("Error De Permiso");
    }
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.put(this.urlEndPoint + '/anular/' + evento.id, evento).pipe(
      first(),
      map((res: any) => res.aguilaData as EventosControlEquipo),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );

  }

  getId(id: number | string) {
    if (!this.validarPermiso('Consultar')) {
      this.errorPermiso("Consultar");
      return throwError("Error De Permiso");
    }
    return this.http.get(this.urlEndPoint + "/" + id).pipe(
      first(),
      map((res: any) => res.aguilaData as EventosControlEquipo),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  cargarPagina(filtros: QueryFilter[]): void {
    if (!this.validarPermiso('Consultar')) {
      this.errorPermiso("Revisar");
      return;
    }
    this.sweetService.sweet_carga("Cargando Información");

    let filter = "?";
    for (let filtro of filtros) {
      filter += `${filtro.filtro}=${filtro.parametro}&`
    }
    //filter += "idEmpresa=" + this.estacion.sucursal.empresa.id;
    this.http.get(this.urlEndPoint + filter).pipe(
      first(),
      map((response: any) => response.aguilaData as EventosControlEquipo[]),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })).subscribe(res => {
        this.setDatos(res);
        this.sweetService.sweet_notificacion("Listo", 1000, "info");
      });
  }

  setDatos(list: EventosControlEquipo[]) {
    this.listaDatos.next(list);
  }

  getDatos(): Observable<EventosControlEquipo[]> {
    return this.listaDatos.asObservable();
  }

  setColumnas(columnas: ColumnaTabla[]) {
    this.columnas.next(columnas)
  }

  getColumnas(): Observable<ColumnaTabla[]> {
    return this.columnas.asObservable();
  }

  validarPermiso(opcion: string): boolean {
    return this.configService.opcionDisponible(this.recurso.value.id, opcion);
  }

  errorPermiso(permiso: string) {
    this.sweetService.sweet_error_permiso_recurso(this.recurso.value.nombre, permiso);
  }

  setConfiguracionComponent(configuracionComponent: ConfiguracionComponent) {
    this.configComponent.next(configuracionComponent);
  }

  getConfiguracionComponent(): Observable<ConfiguracionComponent> {
    return this.configComponent.asObservable();
  }

  setFiltrosComponent(filtros: FiltrosC[]) {
    this.filtrosComponent.next(filtros);
  }

  getFiltrosComponent(): Observable<FiltrosC[]> {
    return this.filtrosComponent.asObservable();
  }

  setMenuOpcionesTabla(menuOpciones: MenuOpciones[]) {
    this.menuOpcionesTabla.next(menuOpciones);
  }

  getMenuOpcionesTabla(): Observable<MenuOpciones[]> {
    return this.menuOpcionesTabla.asObservable();
  }

  paginaAnterior() {
    this.configService.regresar();
  }

  setCargando(estado: boolean) {
    this.cargando.next(estado);
  }

  getCargando(): Observable<boolean> {
    return this.cargando.asObservable();
  }

  getRecurso() {
    return this.recurso.value;
  }

  getEmpresa(): Empresa {
    return this.estacion.sucursal.empresa;
  }

  getEstacionTrabajo(): Estaciontrabajo {
    return this.estacion;
  }

  getUsuario() {
    return this.configService.getUsuarioValue();
  }
}
