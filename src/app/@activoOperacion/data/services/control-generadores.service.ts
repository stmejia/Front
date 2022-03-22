import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, forkJoin, Observable, throwError } from 'rxjs';
import { catchError, first, map, tap } from 'rxjs/operators';
import { Empresa } from 'src/app/@aguila/data/models/empresa';
import { Estaciontrabajo } from 'src/app/@aguila/data/models/estaciontrabajo';
import { Recurso } from 'src/app/@aguila/data/models/recurso';
import { Usuario } from 'src/app/@aguila/data/models/usuario';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { Estados } from 'src/app/@catalogos/data/models/estados';
import { Generador } from 'src/app/@catalogos/data/models/generador';
import { GeneradorService } from 'src/app/@catalogos/data/services/generador.service';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { ConfiguracionComponent } from 'src/app/@page/models/configComponent';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { MenuOpciones } from 'src/app/@page/models/menu';
import { Paginador } from 'src/app/@page/models/paginador';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';
import { EventosControlEquipo } from '../models/eventosControlEquipo';
import { ControlEventosEquiposService } from './control-eventos-equipos.service';

@Injectable({
  providedIn: 'root'
})
export class ControlGeneradoresService {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/controlGeneradores";
  private estacion: Estaciontrabajo;
  private recurso = new BehaviorSubject<Recurso>(null);
  private cargando = new BehaviorSubject<boolean>(true);
  private configComponent = new BehaviorSubject<ConfiguracionComponent>(null);
  private menuOpcionesTabla = new BehaviorSubject<MenuOpciones[]>([]);
  private columnas = new BehaviorSubject<ColumnaTabla[]>([]);
  private paginador = new BehaviorSubject<Paginador>(null);
  private listaDatos = new BehaviorSubject<any[]>([]);
  private listaDatosReportes = new BehaviorSubject<any[]>([]);
  private filtrosComponent = new BehaviorSubject<FiltrosC[]>([]);
  private listaDatosReporteMovimientos = new BehaviorSubject<Generador[]>([]);
  private formatoFechaHora: string = environment.formatoFechaHora;

  constructor(private sweetService: SweetService, private http: HttpClient,
    private configService: ConfigService, private modal: MatDialog,
    private generadorService: GeneradorService, private controlEventosService: ControlEventosEquiposService) {
    forkJoin([
      this.cargarRecurso().pipe(first(val => val != null)),
      this.generadorService.getCargando().pipe(first(v => v === false)),
      this.controlEventosService.getCargando().pipe(first(v => v === false)),
    ]).subscribe(res => {
      this.cargarEstacionTrabajo();
    });
  }

  getId(id) {
    if (!this.validarPermiso('Consultar')) {
      this.errorPermiso("Consultar");
      return throwError(null);
    }
    return this.http.get(this.urlEndPoint + `/${id}`).pipe(
      first(),
      map((response: any) => response.aguilaData as Generador),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  cargarRecurso() {
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
    this.setDatos([]);
    this.setDatosReporte([]);
    this.setDatosReporteMovimientos([]);
    this.setPaginador(null);
  }

  cargarPagina(filtros: QueryFilter[]): void {
    if (!this.validarPermiso('Consultar')) {
      this.errorPermiso("Consultar");
      return;
    }

    this.sweetService.sweet_carga("Cargando Información");
    let filter = "?idEmpresa=" + this.getEmpresa().id + '&';

    for (let filtro of filtros) {
      filter += `${filtro.filtro}=${filtro.parametro}&`
    }

    this.http.get(this.urlEndPoint + filter).pipe(
      first(),
      tap((res: any) => this.configurarPaginador(res)),
      map((response: any) => response.aguilaData as any[]),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })).subscribe(res => {
        this.setDatos(res);
        this.sweetService.sweet_notificacion("Listo", 1000, "info");
      });

  }

  cargarReporteMovimientos(filtros: QueryFilter[]): void { //Inventario
    if (!this.validarPermiso('reporteMovimientos')) {
      this.errorPermiso("reporteMovimientos");
      return;
    }
    this.sweetService.sweet_carga("Cargando Información");

    let filter = "?";

    for (let filtro of filtros) {
      filter += `${filtro.filtro}=${filtro.parametro}&`
    }
    filter += `idEmpresa=${this.getEmpresa().id}`
    this.http.get(this.urlEndPoint + "/reporteMovimientos" + filter).pipe(
      first(),
      map((response: any) => response.aguilaData as any[]),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })).subscribe(res => {
        this.setDatosReporteMovimientos(res);
        this.sweetService.sweet_notificacion("Listo", 1000, "info");
      });
  }

  getDatosReporteMovimientos() {
    return this.listaDatosReporteMovimientos.asObservable();
  }

  setDatosReporteMovimientos(datos) {
    this.listaDatosReporteMovimientos.next(datos);
  }

  cargarPaginaReportes(filtros: QueryFilter[]): void {
    if (!this.validarPermiso('reporteInventario')) {
      this.errorPermiso("reporteInventario");
      return;
    }
    this.sweetService.sweet_carga("Cargando Información");
    let filter = "?";
    for (let filtro of filtros) {
      filter += `${filtro.filtro}=${filtro.parametro}&`
    }
    filter += `idEmpresa=${this.getEmpresa().id}&idEstacionTrabajo=${this.getEstacionTrabajo().id}&global=true`
    this.http.get(this.urlEndPoint + "/reporteInventario" + filter).pipe(
      first(),
      map((response: any) => response.aguilaData as any[]),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })).subscribe(res => {
        this.setDatosReporte(res);
        this.sweetService.sweet_notificacion("Listo", 1000, "info");
      });
  }

  getDatosReporte() {
    return this.listaDatosReportes.asObservable();
  }

  setDatosReporte(datos) {
    this.listaDatosReportes.next(datos);
  }

  getDatos() {
    return this.listaDatos.asObservable();
  }

  setDatos(datos) {
    this.listaDatos.next(datos);
  }

  getEstados() {
    if (!this.validarPermiso('Consultar')) {
      this.errorPermiso("Consultar");
      return throwError(null);
    }
    return this.http.get(this.urlEndPoint +
      `/activosEstados/${this.getEmpresa().id}`).pipe(
        first(),
        map((response: any) => response.aguilaData as Estados[]),
        catchError((e) => {
          this.sweetService.sweet_Error(e);
          return [];
        })
      );
  }

  configurarPaginador(res: any): void {
    var pa: number[] = [];
    for (let i = res.meta.currentPage - 2; i <= res.meta.currentPage + 2; i++) {
      if (i > 0 && i <= res.meta.totalPages) {
        pa.push(i);
      }
    }
    let paginador = res.meta as Paginador;
    paginador.paginas = pa;
    this.setPaginador(paginador);
  }

  setPaginador(paginador: Paginador): void {
    this.paginador.next(paginador);
  }

  getPaginador(): Observable<Paginador> {
    return this.paginador.asObservable();
  }

  setIngresoSalida(ingresoSalida: any) {
    if (!this.validarPermiso("IngresoSalida")) {
      this.errorPermiso("IngresoSalida");
      return;
    }
    this.sweetService.sweet_carga("Espere", true);
    return this.http.post(this.urlEndPoint + '/ingresoSalida', ingresoSalida).pipe(
      first(),
      map((r: AguilaResponse<any>) => r.aguilaData),
      tap(r => this.sweetService.sweet_notificacion("Listo", 1500, 'info')),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  getMovimientosEquipo(idEquipo, noPagina) {
    if (!this.validarPermiso("Historial")) {
      this.errorPermiso("Historial");
      return throwError("Error De Permisos");
    }
    this.sweetService.sweet_carga("Espere", true);
    return this.http.get(this.urlEndPoint + `/historial?idActivo=${idEquipo}&PageNumber=${noPagina}`)
      .pipe(
        first(),
        map((r: AguilaResponse<any[]>) => r),
        catchError((e) => {
          this.sweetService.sweet_Error(e);
          return throwError(e);
        }));
  }

  reservarEquipo(reserva: any) {
    if (!this.validarPermiso("ReservarEquipo")) {
      this.errorPermiso("ReservarEquipo");
      return throwError("Error De Permisos");
    }
    this.sweetService.sweet_carga("Espere", true);
    return this.http.post(this.urlEndPoint + '/reserva', reserva).pipe(
      first(),
      map((r: AguilaResponse<any>) => r.aguilaData),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  quitarReservaEquipo(movimiento: any) {
    if (!this.validarPermiso("QuitarReserva")) {
      this.errorPermiso("QuitarReserva");
      return throwError("Error De Permisos");
    }
    this.sweetService.sweet_carga("Espere", true);
    return this.http.post(this.urlEndPoint + '/quitarReserva', movimiento).pipe(
      first(),
      map((r: AguilaResponse<any>) => r.aguilaData),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  ponerBodegaEquipo(movimiento: any) {
    if (!this.validarPermiso("PonerBodega")) {
      this.errorPermiso("PonerBodega");
      return throwError("Error De Permisos");
    }
    this.sweetService.sweet_carga("Espere", true);
    return this.http.post(this.urlEndPoint + '/bodega', movimiento).pipe(
      first(),
      map((r: AguilaResponse<any>) => r.aguilaData),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  enviarReparacionEquipo(movimiento: any) {
    if (!this.validarPermiso("PonerReparacion")) {
      this.errorPermiso("PonerReparacion");
      return throwError("Error De Permisos");
    }
    this.sweetService.sweet_carga("Espere", true);
    return this.http.post(this.urlEndPoint + '/reparacion', movimiento).pipe(
      first(),
      map((r: AguilaResponse<any>) => r.aguilaData),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  evniarRentaInternaEquipo(movimiento: any) {
    if (!this.validarPermiso("RentaInterna")) {
      this.errorPermiso("RentaInterna");
      return throwError("Error De Permisos");
    }
    this.sweetService.sweet_carga("Espere", true);
    return this.http.post(this.urlEndPoint + '/rentaInterna', movimiento).pipe(
      first(),
      map((r: AguilaResponse<any>) => r.aguilaData),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  evniarRentaExternaEquipo(movimiento: any) {
    if (!this.validarPermiso("RentaExterna")) {
      this.errorPermiso("RentaExterna");
      return throwError("Error De Permisos");
    }
    this.sweetService.sweet_carga("Espere", true);
    return this.http.post(this.urlEndPoint + '/rentaExterna', movimiento).pipe(
      first(),
      map((r: AguilaResponse<any>) => r.aguilaData),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  enviarRuta(movimiento: any) {
    if (!this.validarPermiso("EnviarRuta")) {
      this.errorPermiso("EnviarRuta");
      return throwError("Error De Permisos");
    }
    this.sweetService.sweet_carga("Espere", true);
    return this.http.post(this.urlEndPoint + '/ruta', movimiento).pipe(
      first(),
      map((r: AguilaResponse<any>) => r.aguilaData),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  crearEvento(evento: EventosControlEquipo) {
    if (!this.validarPermiso("AgregarEvento")) {
      this.errorPermiso("AgregarEvento");
      return;
    }
    return this.controlEventosService.crear(evento);
  }

  ponerDisponible(movimiento: any) {
    if (!this.validarPermiso('Poner Disponible')) {
      this.errorPermiso("Poner Disponible");
      return throwError("Error De Permiso");
    }
    this.sweetService.sweet_carga("Espere");
    return this.http.post(this.urlEndPoint + '/disponible', movimiento).pipe(
      first(),
      map((r: AguilaResponse<any>) => r.aguilaData),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }
  
  validarPermiso(opcion: string): boolean {
    return this.configService.opcionDisponible(this.recurso.value.id, opcion);
  }

  errorPermiso(permiso: string) {
    this.sweetService.sweet_error_permiso_recurso(this.recurso.value.nombre, permiso);
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

  getEstacionTrabajo(): Estaciontrabajo {
    return this.estacion;
  }

  getEmpresa(): Empresa {
    return this.estacion.sucursal.empresa;
  }

  getUsuario(): Usuario {
    return this.configService.getUsuarioValue();
  }

  setMenuOpcionesTabla(menuOpciones: MenuOpciones[]): void {
    this.menuOpcionesTabla.next(menuOpciones);
  }

  getMenuOpcionesTabla(): Observable<MenuOpciones[]> {
    return this.menuOpcionesTabla.asObservable();
  }

  setColumnas(columnas: ColumnaTabla[]) {
    this.columnas.next(columnas);
  }

  getColumnas(): Observable<ColumnaTabla[]> {
    return this.columnas.asObservable();
  }

  setConfiguracionComponent(configuracionComponent: ConfiguracionComponent): void {
    this.configComponent.next(configuracionComponent);
  }

  getConfiguracionComponent(): Observable<ConfiguracionComponent> {
    return this.configComponent.asObservable();
  }

  getFormatoFechaHora() {
    return this.formatoFechaHora;
  }

  setFiltrosComponent(filtros: FiltrosC[]) {
    this.filtrosComponent.next(filtros);
  }

  getFiltrosComponent(): Observable<FiltrosC[]> {
    return this.filtrosComponent.asObservable();
  }
  // Generadores
  getTiposGeneradores() {
    //return this.generadorService.getTiposGenerador();
    return null;
  }

  getTiposGeneradoresValue() {
    //return this.generadorService.getTiposGeneradorValue();
    return [];
  }

  getRecursoGenerador() {
    return this.generadorService.getRecurso();
  }
}
