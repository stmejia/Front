import { HttpClient } from '@angular/common/http';
import { Injectable, Type } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, throwError } from 'rxjs';
import { catchError, first, map, tap } from 'rxjs/operators';
import { Empresa } from 'src/app/@aguila/data/models/empresa';
import { Estaciontrabajo } from 'src/app/@aguila/data/models/estaciontrabajo';
import { Recurso } from 'src/app/@aguila/data/models/recurso';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { Columna } from 'src/app/@page/models/columna';
import { ConfiguracionComponent } from 'src/app/@page/models/configComponent';
import { MenuOpciones } from 'src/app/@page/models/menu';
import { Paginador } from 'src/app/@page/models/paginador';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';
import { ActivoMovimientos } from '../models/activoMovimientos';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';

@Injectable({
  providedIn: 'root'
})
export class ActivoMovimientosService implements ServicioComponente {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/activoMovimientos";
  private estacion: Estaciontrabajo;
  private configComponent = new BehaviorSubject<ConfiguracionComponent>(null);
  private recurso = new BehaviorSubject<Recurso>(null);
  private cargando = new BehaviorSubject<boolean>(true);
  private menuOpcionesTabla = new BehaviorSubject<MenuOpciones[]>([]);
  private columnas = new BehaviorSubject<ColumnaTabla[]>([]);
  private paginador = new BehaviorSubject<Paginador>(null);
  private listaDatos = new BehaviorSubject<ActivoMovimientos[]>([]);

  constructor(private sweetService: SweetService, private http: HttpClient, private configService: ConfigService) {
    if (!this.recurso.value) {
      forkJoin([
        this.cargarRecurso().pipe(first(val => val != null))
      ]).subscribe(res => {
        this.cargarEstacionTrabajo();
      });
    }
  }

  cargarRecurso(): Observable<Recurso> {
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

  cargarEstacionTrabajo(): void {
    this.configService.getEstacionTrabajo().subscribe(res => {
      this.estacion = res.estacionTrabajo;
      this.limpiarVariables();
      this.setCargando(false);
    });
  }

  limpiarVariables(): void {
    this.setDatos([]);
  }

  validarPermiso(permiso: string): boolean {
    return this.configService.opcionDisponible(this.recurso.value.id, permiso);
  }

  setCargando(estado: boolean): void {
    this.cargando.next(estado);
  }

  getCargando(): Observable<boolean> {
    return this.cargando.asObservable();
  }

  getRecurso(): Recurso {
    return this.recurso.value;
  }

  getEmpresa(): Empresa {
    return this.estacion.sucursal.empresa;
  }

  errorPermiso(permiso: string): void {
    this.sweetService.sweet_error_permiso_recurso(this.recurso.value.nombre, permiso);
  }

  getEstacionTrabajo(): Estaciontrabajo {
    return this.estacion;
  }

  paginaAnterior(): void {
    this.configService.regresar();
  }

  setConfiguracionComponent(configuracionComponent: ConfiguracionComponent): void {
    this.configComponent.next(configuracionComponent);
  }

  getConfiguracionComponent(): Observable<ConfiguracionComponent> {
    return this.configComponent.asObservable();
  }

  setMenuOpcionesTabla(menuOpciones: MenuOpciones[]): void {
    this.menuOpcionesTabla.next(menuOpciones);
  }

  getMenuOpcionesTabla(): Observable<MenuOpciones[]> {
    return this.menuOpcionesTabla.asObservable();
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

  setColumnas(columnas: ColumnaTabla[]) {
    this.columnas.next(columnas);
  }

  getColumnas(): Observable<ColumnaTabla[]> {
    return this.columnas.asObservable();
  }

  cargarPagina(filtros: QueryFilter[]): void {
    this.sweetService.sweet_carga("Cargando Información");
    if (this.validarPermiso('Consultar')) {
      let filter = "?";

      for (let filtro of filtros) {
        filter += `${filtro.filtro}=${filtro.parametro}&`
      }

      this.http.get(this.urlEndPoint + filter).pipe(
        first(),
        tap((res: any) => this.configurarPaginador(res)),
        map((response: any) => response.aguilaData as ActivoMovimientos[]),
        catchError((e) => {
          this.sweetService.sweet_Error(e);
          return throwError(e);
        })).subscribe(res => {
          this.setDatos(res);
          this.sweetService.sweet_notificacion("Listo", 1000, "info");
        });
    } else {
      this.errorPermiso("Consultar");
    }
  }

  getDatos(): Observable<ActivoMovimientos[]> {
    return this.listaDatos.asObservable();
  }

  setDatos(lista: any[]): void {
    this.listaDatos.next(lista);
  }

}
