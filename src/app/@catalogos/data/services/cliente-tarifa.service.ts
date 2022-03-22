import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, first, map, tap } from 'rxjs/operators';
import { Recurso } from 'src/app/@aguila/data/models/recurso';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { Columna } from 'src/app/@page/models/columna';
import { MenuOpciones } from 'src/app/@page/models/menu';
import { Paginador } from 'src/app/@page/models/paginador';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';
import { ClienteTarifa } from '../models/clienteTarifa';

@Injectable({
  providedIn: 'root'
})
export class ClienteTarifaService {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/clienteTarifas";
  private recurso = new BehaviorSubject<Recurso>(null);
  private columnas = new BehaviorSubject<Columna[]>([]);
  private cargando = new BehaviorSubject<boolean>(true);
  private menuOpcionesTabla = new BehaviorSubject<MenuOpciones[]>([]);
  private paginador = new BehaviorSubject<Paginador>(null);
  private listaDatos = new BehaviorSubject<ClienteTarifa[]>([]);

  constructor(private sweetService: SweetService, private http: HttpClient, private configService: ConfigService) {
    if (!this.recurso.value) {
      this.cargarRecurso().pipe(first(val => val != null)).subscribe((res) => { console.log(res) },
        (error) => {
          this.sweetService.sweet_alerta('Error', 'No es posible cargar el Recurso', 'error');
          this.paginaAnterior();
        }
      );
    }
  }

  getId(id: number) {
    return this.http.get(this.urlEndPoint + "/" + id).pipe(
      map((response: any) => response.aguilaData as ClienteTarifa)
    );
  }

  crear(item: ClienteTarifa) {
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.post(this.urlEndPoint, item).pipe(
      first(),
      map((res: any) => res.aguilaData as ClienteTarifa),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  modificar(item: ClienteTarifa) {
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

  cargarPagina(filtros: QueryFilter[]) {
    this.sweetService.sweet_carga("Espere", true);
    if (this.validarPermiso('Consultar')) {
      let filter = "?";
      for (let filtro of filtros) {
        filter += `${filtro.filtro}=${filtro.parametro}&`
      }
      this.http.get(this.urlEndPoint + filter).pipe(
        first(),
        tap((res: any) => this.configurarPaginador(res)),
        map((response: any) => response.aguilaData as ClienteTarifa[]),
        tap((res) => this.setDatos(res)),
        tap(res=>console.log(res)),
        catchError((e) => {
          this.sweetService.sweet_Error(e);
          return [];
        })
      ).subscribe(() => this.sweetService.sweet_notificacion("Listo", 2000));
    } else {
      this.errorPermiso("Consultar");
    }
  }

  getDatosFiltro(filtros: QueryFilter[]) {
    this.sweetService.sweet_carga("Espere", true);
    if (this.validarPermiso('Consultar')) {
      let filter = "?";
      for (let filtro of filtros) {
        filter += `${filtro.filtro}=${filtro.parametro}&`
      }
      return this.http.get(this.urlEndPoint + filter).pipe(
        first(),
        map((response: any) => response.aguilaData as ClienteTarifa[]),
        catchError((e) => {
          this.sweetService.sweet_Error(e);
          return [];
        })
      );
    } else {
      this.errorPermiso("Consultar");
    }
  }

  setDatos(lista: ClienteTarifa[]) {
    this.listaDatos.next(lista);
  }

  getDatos(): Observable<ClienteTarifa[]> {
    return this.listaDatos.asObservable();
  }

  cargarRecurso() {
    this.setCargando(true);
    return this.http.options(this.urlEndPoint).pipe(
      map((response: any) => response.aguilaData as Recurso),
      tap(recurso => {
        this.recurso.next(recurso);
        this.setCargando(false);
      }),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  validarPermiso(opcion: string): boolean {
    return this.configService.opcionDisponible(this.recurso.value.id, opcion);
  }

  getEstacionTrabajo() {
    return this.configService.getEstacionTrabajo().pipe(first());
  }

  errorPermisoRecurso() {
    this.sweetService.sweet_error_permiso_recurso(this.recurso.value.nombre);
  }

  errorPermiso(permiso: string) {
    this.sweetService.sweet_error_permiso_recurso(this.recurso.value.nombre, permiso);
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

  paginaAnterior() {
    this.configService.regresar();
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

  setCargando(estado: boolean) {
    this.cargando.next(estado);
  }

  getCargando(): Observable<boolean> {
    return this.cargando.asObservable().pipe(first(val => val == false));
  }

  getRecurso() {
    return this.recurso.value;
  }

}
