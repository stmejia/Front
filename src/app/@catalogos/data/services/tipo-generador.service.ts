import { TipoGenerador } from './../models/tipoGenerador';
import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Recurso } from 'src/app/@aguila/data/models/recurso';
import { environment } from 'src/environments/environment';
import { Paginador } from 'src/app/@page/models/paginador';
import { catchError, first, map, tap } from 'rxjs/operators';
import { ConfiguracionComponent } from 'src/app/@page/models/configComponent';
import { Columna } from 'src/app/@page/models/columna';
import { ConfigService } from './../../../@aguila/data/services/config.service';
import { HttpClient } from '@angular/common/http';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { MenuOpciones } from './../../../@page/models/menu';
import { Estaciontrabajo } from 'src/app/@aguila/data/models/estaciontrabajo';

@Injectable({
  providedIn: 'root'
})
export class TipoGeneradorService {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/tipoGeneradores";
  private configComponent = new BehaviorSubject<ConfiguracionComponent>(null);
  private estacion: Estaciontrabajo;
  private recurso = new BehaviorSubject<Recurso>(null);
  private columnas = new BehaviorSubject<Columna[]>([]);
  private cargando = new BehaviorSubject<boolean>(true);
  private menuOpcionesTabla = new BehaviorSubject<MenuOpciones[]>([]);
  private paginador = new BehaviorSubject<Paginador>(null);
  private listaDatos = new BehaviorSubject<TipoGenerador[]>([]);

  constructor(private sweetService: SweetService, private http: HttpClient, private configService: ConfigService) {
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

  getId(id: number) {
    return this.http.get(this.urlEndPoint + "/" + id).pipe(
      map((response: any) => response.aguilaData as TipoGenerador),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  crear(item: TipoGenerador) {
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.post(this.urlEndPoint, item).pipe(
      map((res: any) => res.aguilaData as TipoGenerador),
      tap((res) => {
        this.listaDatos.getValue().push(res);
      }),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  modificar(item: TipoGenerador) {
    this.sweetService.sweet_carga('Guardando Cambios');
    return this.http.put(this.urlEndPoint + "/" + item.id, item).pipe(
      map((res: any) => res.aguilaData as boolean),
      tap((res) => {
        if (res) {
          this.setDatos(this.listaDatos.value.filter(el => el.id !== item.id));
          this.listaDatos.value.push(item);
        }
      }),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  eliminar(id: number) {
    this.sweetService.sweet_carga('Espere...');
    return this.http.delete(this.urlEndPoint + `/${id}`).pipe(
      map((response: any) => response.aguilaData as boolean),
      tap((res) => {
        this.setDatos(this.listaDatos.getValue().filter((em) => em.id !== id));
        this.paginador.value.totalCount -= 1;
      }),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  setDatos(lista: TipoGenerador[]) {
    this.listaDatos.next(lista);
  }

  getDatos(cargar: boolean = false): Observable<TipoGenerador[]> {
    if (cargar && this.listaDatos.value.length < 1) {
      this.cargarPagina().pipe(first()).subscribe();
    }
    return this.listaDatos.asObservable();
  }

  cargarPagina(noPagina: number = 1) {
    if (this.validarPermiso('Consultar')) {
      return this.http.get(this.urlEndPoint +
        `?idEmpresa=${this.estacion.sucursal.empresa.id}`).pipe(
          //Obtenemos los datos del meta para configurar el paginador
          tap((res: any) => this.configurarPaginador(res)),
          // Convertimos los datos
          map((response: any) => response.aguilaData as TipoGenerador[]),
          // Guardamos los datos recibidos
          tap((res) => this.setDatos(res)),
          catchError((e) => {
            this.sweetService.sweet_Error(e);
            return throwError(e);
          })
        );
    } else {
      this.errorPermiso();
    }
  }

  cargarRecurso() {
    this.setCargando(true);
    return this.http.options(this.urlEndPoint).pipe(
      tap(res => console.log(res)),
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
    this.setCargando(true);
    this.configService.getEstacionTrabajo().subscribe(res => {
      this.estacion = res.estacionTrabajo;
      this.limpiarVariables();
      this.setCargando(false);
    });
  }

  limpiarVariables() {

  }

  configurarPaginador(res: any) {
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

  setPaginador(paginador: Paginador) {
    this.paginador.next(paginador);
  }

  getPaginador(): Observable<Paginador> {
    return this.paginador.asObservable();
  }

  setMenuOpcionesTabla(menuOpciones: MenuOpciones[]) {
    this.menuOpcionesTabla.next(menuOpciones);
  }

  getMenuOpcionesTabla(): Observable<MenuOpciones[]> {
    return this.menuOpcionesTabla.asObservable();
  }

  setColumnas(columnas: Columna[]) {
    this.columnas.next(columnas)
  }

  getColumnas(): Observable<Columna[]> {
    return this.columnas.asObservable();
  }

  validarPermiso(opcion: string): boolean {
    return this.configService.opcionDisponible(this.recurso.value.id, opcion);
  }

  errorPermiso() {
    this.sweetService.sweet_error_permiso_recurso(this.recurso.value.nombre);
  }

  setConfiguracionComponent(configuracionComponent: ConfiguracionComponent) {
    this.configComponent.next(configuracionComponent);
  }

  getConfiguracionComponent(): Observable<ConfiguracionComponent> {
    return this.configComponent.asObservable();
  }

  getEstacionTrabajo() {
    return this.configService.getEstacionTrabajo().pipe(first());
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

}
