import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Observable, throwError } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { catchError, first, map, tap } from 'rxjs/operators';
import { Estaciontrabajo } from 'src/app/@aguila/data/models/estaciontrabajo';
import { Recurso } from 'src/app/@aguila/data/models/recurso';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { Columna } from 'src/app/@page/models/columna';
import { ConfiguracionComponent } from 'src/app/@page/models/configComponent';
import { MenuOpciones } from 'src/app/@page/models/menu';
import { Paginador } from 'src/app/@page/models/paginador';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';
import { Llanta } from '../models/llanta';

@Injectable({
  providedIn: 'root'
})

export class LlantaService {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/llantas";
  private configComponent = new BehaviorSubject<ConfiguracionComponent>(null);
  private estacion: Estaciontrabajo;
  private recurso = new BehaviorSubject<Recurso>(null);
  private columnas = new BehaviorSubject<Columna[]>([]);
  private cargando = new BehaviorSubject<boolean>(true);
  private menuOpcionesTabla = new BehaviorSubject<MenuOpciones[]>([]);
  private paginador = new BehaviorSubject<Paginador>(null);
  private listaDatos = new BehaviorSubject<Llanta[]>([]);
  private columnasLista: Columna[] = [
    { nombre: 'Código', targetId: 'codigo', tipo: 'texto', aligment: 'center' },
    { nombre: 'Marca', targetId: 'marca', tipo: 'texto', aligment: 'left' },
    { nombre: 'Serie', targetId: 'serie', tipo: 'texto', aligment: 'left' },
    { nombre: 'Medidas', targetId: 'medidas', tipo: 'texto', aligment: 'left' },
  ];

  constructor(private sweetService: SweetService, private http: HttpClient, private configService: ConfigService, private modal: MatDialog) {
    if (!this.recurso.value) {
      forkJoin([
        this.cargarRecurso().pipe(first(v => v != null)),
      ]).subscribe(res => {
        this.cargarEstacionTrabajo();
      });
    }
  }

  getId(id: number) {
    return this.http.get(this.urlEndPoint + "/" + id).pipe(
      first(),
      map((res: any) => res.aguilaData as Llanta),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  crear(item: Llanta) {
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.post(this.urlEndPoint, item).pipe(
      first(),
      map((res: any) => res.aguilaData as Llanta),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  modificar(item: Llanta) {
    this.sweetService.sweet_carga('Guardando Cambios');
    return this.http.put(this.urlEndPoint + "/" + item.id, item).pipe(
      first(),
      map((res: any) => res.aguilaData as boolean),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  eliminar(id: number) {
    this.sweetService.sweet_carga('Espere...');
    if (this.validarPermiso('Eliminar')) {
      return this.http.delete(this.urlEndPoint + `/${id}`).pipe(
        first(),
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
    } else {
      this.errorPermiso("Eliminar");
    }
  }

  setDatos(lista: Llanta[]) {
    this.listaDatos.next(lista);
  }

  getDatos(): Observable<Llanta[]> {
    return this.listaDatos.asObservable();
  }

  cargarPagina(noPagina: number) {
    this.sweetService.sweet_carga("Espere", true);
    if (this.validarPermiso('Consultar')) {
      this.http.get(this.urlEndPoint +
        `?PageNumber=${noPagina}&idEmpresa=${this.estacion.sucursal.empresa.id}`).pipe(
          first(),
          tap((res: any) => this.configurarPaginador(res)),
          map((response: any) => response.aguilaData as Llanta[]),
          tap((res) => this.setDatos(res)),
          catchError((e) => {
            this.sweetService.sweet_Error(e);
            return [];
          })
        ).subscribe(() => this.sweetService.sweet_notificacion("Listo", 2000));
    } else {
      this.errorPermiso("Consultar");
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
      this.limpiarVariables();
      this.setCargando(false);
    });
  }

  limpiarVariables() {
    this.setDatos([]);
    this.setPaginador(null);
  }

  getDatosFiltros(filtros: QueryFilter[]) {
    this.sweetService.sweet_carga("Espere", true);
    if (this.validarPermiso('Consultar')) {
      let filter = "?";
      for (let filtro of filtros) {
        filter += `${filtro.filtro}=${filtro.parametro}&`
      }
      filter += "idEmpresa=" + this.estacion.sucursal.empresa.id;
      return this.http.get(this.urlEndPoint + filter).pipe(
        first(),
        map((response: any) => response.aguilaData as Llanta[]),
        catchError((e) => {
          this.sweetService.sweet_Error(e);
          return throwError(e);
        }));
    } else {
      this.errorPermiso("Consultar");
    }
  }

  abrirModal(mSelect: boolean, titulo: string, component: ComponentType<any>) {
    if (this.listaDatos.value.length < 1) {
      this.cargarPagina(1);
    }
    this.setConfiguracionComponent({ header: { titulo: titulo }, isModal: true, multiSelect: mSelect });
    this.setColumnas(this.columnasLista);
    return this.modal.open(component).afterClosed();
  }

  abrirComponenteModal(component: ComponentType<any>) {
    return this.modal.open(component).afterClosed();
  }

  validarPermiso(opcion: string): boolean {
    return this.configService.opcionDisponible(this.recurso.value.id, opcion);
  }

  getEstacionTrabajo() {
    return this.configService.getEstacionTrabajo().pipe(first());
  }

  setConfiguracionComponent(configuracionComponent: ConfiguracionComponent) {
    this.configComponent.next(configuracionComponent);
  }

  getConfiguracionComponent(): Observable<ConfiguracionComponent> {
    return this.configComponent.asObservable();
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
