import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Recurso } from 'src/app/@aguila/data/models/recurso';
import { environment } from 'src/environments/environment';
import { Paginador } from 'src/app/@page/models/paginador';
import { catchError, first, map, tap } from 'rxjs/operators';
import { ConfiguracionComponent } from 'src/app/@page/models/configComponent';
import { Columna } from 'src/app/@page/models/columna';
import { MatDialog } from '@angular/material/dialog';
import { ConfigService } from './../../../@aguila/data/services/config.service';
import { HttpClient } from '@angular/common/http';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { MenuOpciones } from './../../../@page/models/menu';
import { Servicio } from '../models/servicio';
import { QueryFilter } from 'src/app/@page/models/filtros';
import { ComponentType } from '@angular/cdk/portal';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/servicios";
  private configComponent = new BehaviorSubject<ConfiguracionComponent>(null);
  private recurso = new BehaviorSubject<Recurso>(null);
  private columnas = new BehaviorSubject<Columna[]>([]);
  private cargando = new BehaviorSubject<boolean>(true);
  private menuOpcionesTabla = new BehaviorSubject<MenuOpciones[]>([]);
  private paginador = new BehaviorSubject<Paginador>(null);
  private columnasLista: Columna[] = [
    { nombre: 'Código', targetId: 'codigo', tipo: 'texto', aligment: 'left' },
    { nombre: 'Nombre', targetId: 'nombre', tipo: 'texto', aligment: 'left' },
    { nombre: 'Precio', targetId: 'precio', tipo: 'texto', aligment: 'left' },
    { nombre: '¿Necesita Ruta?', targetId: 'ruta', tipo: 'boolean', aligment: 'center' },
  ];

  private listaDatos = new BehaviorSubject<Servicio[]>([]);

  constructor(private sweetService: SweetService, private http: HttpClient, private configService: ConfigService, 
    private modal: MatDialog) {
    if (!this.recurso.value) {
      this.cargarRecurso().pipe(
        first(val => val != null)
      ).subscribe(() => { },
        (error) => {
          this.sweetService.sweet_alerta('Error', 'No es posible cargar el Recurso', 'error');
          this.paginaAnterior();
        }
      );
    }
  }

  getId(id: number) {
    return this.http.get(this.urlEndPoint + "/" + id).pipe(
      map((response: any) => response.aguilaData as Servicio)
    );
  }

  crear(item: Servicio) {
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.post(this.urlEndPoint, item).pipe(
      map((res: any) => res.aguilaData as Servicio),
      tap((res) => {
        this.listaDatos.getValue().push(res);
      }),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  modificar(item: Servicio) {
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

  setDatos(list: Servicio[]) {
    this.listaDatos.next(list);
  }

  getDatos(cargar: boolean = false): Observable<Servicio[]> {
    if (cargar && this.listaDatos.value.length < 1) {
      this.getEstacionTrabajo().pipe(first()).subscribe(res => {
        this.cargarPagina(1);
      });
    }
    return this.listaDatos.asObservable();
  }

  cargarPagina(noPagina: number) {
    this.sweetService.sweet_carga("Espere", true);
    if (this.validarPermiso('Consultar')) {
      this.getEstacionTrabajo().pipe(first()).subscribe(res => {
        this.http.get(this.urlEndPoint +
          `?idEmpresa=${res.estacionTrabajo.sucursal.empresaId}&PageNumber=${noPagina}`).pipe(
            first(),
            tap((res: any) => this.configurarPaginador(res)),
            map((response: any) => response.aguilaData as Servicio[]),
            tap((res) => this.setDatos(res)),
            catchError((e) => {
              this.sweetService.sweet_Error(e);
              return [];
            })
          ).subscribe(() => this.sweetService.sweet_notificacion("Listo", 2000));
      });
    } else {
      this.errorPermiso();
    }
  }

  getDatosFiltros(filtros: QueryFilter[]) {
    this.sweetService.sweet_carga("Espere", true);
    if (this.validarPermiso('Consultar')) {
      let filter = "?";
      for (let filtro of filtros) {
        filter += `${filtro.filtro}=${filtro.parametro}&`
      }
      return this.http.get(this.urlEndPoint + filter).pipe(
        first(),
        map((response: any) => response.aguilaData as Servicio[]),
        catchError((e) => {
          this.sweetService.sweet_Error(e);
          return throwError(e);
        }));
    } else {
      this.errorPermiso();
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

  cargarRecurso() {
    this.setCargando(true);
    return this.http.options(this.urlEndPoint).pipe(
      tap(res => console.log(res)),
      map((response: any) => response.aguilaData as Recurso),
      tap(recurso => {
        this.recurso.next(recurso);
        this.setCargando(false);
      }),
      catchError((e) => {
        console.log(e);
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
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
    return this.configService.getEstacionTrabajo();
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
