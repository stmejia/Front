import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { Recurso } from 'src/app/@aguila/data/models/recurso';
import { environment } from 'src/environments/environment';
import { Paginador } from 'src/app/@page/models/paginador';
import { catchError, first, map, tap } from 'rxjs/operators';
import { throwError } from 'rxjs/internal/observable/throwError';
import { ConfiguracionComponent } from 'src/app/@page/models/configComponent';
import { Columna } from 'src/app/@page/models/columna';
import { ConfigService } from './../../../@aguila/data/services/config.service';
import { HttpClient } from '@angular/common/http';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { MenuOpciones } from './../../../@page/models/menu';
import { Proveedor } from '../models/proveedor';
import { MatDialog } from '@angular/material/dialog';
import { ProveedoresComponent } from '../../components/proveedor/proveedores.component';
import { ComponentType } from '@angular/cdk/portal';
import { Estaciontrabajo } from 'src/app/@aguila/data/models/estaciontrabajo';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/proveedores";
  private configComponent = new BehaviorSubject<ConfiguracionComponent>(null);
  private estacion: Estaciontrabajo;
  private recurso = new BehaviorSubject<Recurso>(null);
  private columnas = new BehaviorSubject<Columna[]>([]);
  private cargando = new BehaviorSubject<boolean>(true);
  private menuOpcionesTabla = new BehaviorSubject<MenuOpciones[]>([]);
  private paginador = new BehaviorSubject<Paginador>(null);
  private listaDatos = new BehaviorSubject<Proveedor[]>([]);

  //Columnas que se usaran para el modal
  private columnasLista: Columna[] = [
    { nombre: 'NIT', targetOpt: ['entidadComercial', 'nit'], tipo: 'objeto', aligment: 'left' },
    { nombre: 'Nombre', targetOpt: ['entidadComercial', 'nombre'], tipo: 'objeto', aligment: 'left' },
    { nombre: 'Raz??n Social', targetOpt: ['entidadComercial', 'razonSocial'], tipo: 'objeto', aligment: 'left' },
    { nombre: 'Direcci??n', targetId: 'vDireccion', tipo: 'texto', aligment: 'left' },
  ];

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

  getId(id: number) {
    return this.http.get(this.urlEndPoint + "/" + id).pipe(
      map((response: any) => response.aguilaData as Proveedor),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  getNIT(nit: string, codigo: string, idEmpresa: number) {
    this.sweetService.sweet_carga('Espere');
    if (this.validarPermiso('Consultar')) {
      return this.http.get(this.urlEndPoint + `?nit=${nit}&codigo=${codigo}&idEmpresa=${idEmpresa}`).pipe(
        map((res: any) => res.aguilaData as Proveedor[]),
        catchError((e) => {
          this.sweetService.sweet_Error(e);
          return throwError(e);
        })
      );
    } else {
      this.errorPermiso();
    }
  }

  crear(item: Proveedor) {
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.post(this.urlEndPoint, item).pipe(
      map((res: any) => res.aguilaData as Proveedor),
      tap((res) => {
        this.listaDatos.getValue().push(res);
      }),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  modificar(item: Proveedor) {
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

  bloquear(id: number) {
    this.sweetService.sweet_carga('Espere...');
    return this.http.put(this.urlEndPoint + "/inactivar/" + id, id).pipe(
      map((res: any) => res.aguilaData as boolean),
      tap((res) => {
        if (res) {
          this.setDatos(this.listaDatos.value.filter(el => el.id !== id));
        }
      }),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  setDatos(lista: Proveedor[]) {
    this.listaDatos.next(lista);
  }

  getDatos(cargar: boolean = false): Observable<Proveedor[]> {
    if (cargar && this.listaDatos.value.length < 1) {
      this.cargarPagina().pipe(first()).subscribe();
    }
    return this.listaDatos.asObservable();
  }

  cargarPagina(noPagina: number = 1) {
    if (this.validarPermiso('Consultar')) {
      return this.http.get(this.urlEndPoint + `?PageNumber=${noPagina}&idEmpresa=${this.estacion.sucursal.empresa.id}`).pipe(
        //Obtenemos los datos del meta para configurar el paginador
        tap((res: any) => this.configurarPaginador(res)),
        // Convertimos los datos
        map((response: any) => response.aguilaData as Proveedor[]),
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

  //mSelect: true = Seleccion multiple, tit: Titulo de la ventana, columnas: Columnas que mostrara la tabla
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

}
