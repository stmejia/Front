import { TipoListaService } from './tipo-lista.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Recurso } from 'src/app/@aguila/data/models/recurso';
import { environment } from 'src/environments/environment';
import { Paginador } from 'src/app/@page/models/paginador';
import { catchError, first, map, tap } from 'rxjs/operators';
import { throwError } from 'rxjs/internal/observable/throwError';
import { ConfiguracionComponent } from 'src/app/@page/models/configComponent';
import { Columna } from 'src/app/@page/models/columna';
import { MatDialog } from '@angular/material/dialog';
import { ConfigService } from './../../../@aguila/data/services/config.service';
import { HttpClient } from '@angular/common/http';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { MenuOpciones } from './../../../@page/models/menu';
import { Lista } from '../models/lista';

@Injectable({
  providedIn: 'root'
})
export class ListaService {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/listas";
  private configComponent = new BehaviorSubject<ConfiguracionComponent>(null);
  private recurso = new BehaviorSubject<Recurso>(null);
  private columnas = new BehaviorSubject<Columna[]>([]);
  private cargando = new BehaviorSubject<boolean>(true);
  private menuOpcionesTabla = new BehaviorSubject<MenuOpciones[]>([]);
  private paginador = new BehaviorSubject<Paginador>(null);
  private columnasLista: Columna[] = [
    { nombre: 'Nombre', targetId: 'nombre', texto: true, aligment: 'left' },
    { nombre: 'Cód Numerico', targetId: 'codNumerico', texto: true, aligment: 'center' },
    { nombre: 'Cód de Moneda', targetId: 'codMoneda', texto: true, aligment: 'center' }
  ];

  private listas = new BehaviorSubject<Lista[]>([]);

  constructor(private sweetService: SweetService, private http: HttpClient, private configService: ConfigService,
    private modal: MatDialog, private tipoListaService: TipoListaService) {
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
      map((response: any) => response.aguilaData as Lista),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  crear(item: Lista) {
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.post(this.urlEndPoint, item).pipe(
      map((res: any) => res.aguilaData as Lista),
      tap((res) => {
        this.listas.getValue().push(res);
      }),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  modificar(item: Lista) {
    this.sweetService.sweet_carga('Guardando Cambios');
    return this.http.put(this.urlEndPoint + "/" + item.id, item).pipe(
      map((res: any) => res.aguilaData as boolean),
      tap((res) => {
        if (res) {
          this.setDatos(this.listas.value.filter(el => el.id !== item.id));
          this.listas.value.push(item);
        }
      }),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  setDatos(list: Lista[]) {
    this.listas.next(list);
  }

  getTipoLista(id: number) {
    return this.tipoListaService.getId(id);
  }

  getDatos(cargar: boolean = false, idTipoLista: number): Observable<Lista[]> {
    if (cargar && this.listas.value.length < 1) {
      this.getEstacionTrabajo().pipe(first()).subscribe(res => {
        this.cargarPagina(idTipoLista, res.estacionTrabajo.sucursal.empresaId).pipe(first()).subscribe();
      });
    }
    return this.listas.asObservable();
  }

  //Carga un pagina
  cargarPagina(idTipoLista: number, idEmpresa: number) {
    if (this.validarPermiso('Consultar')) {
      return this.http.get(this.urlEndPoint +
        `?idEmpresa=${idEmpresa}&idTipoLista=${idTipoLista}`).pipe(
          //Obtenemos los datos del meta para configurar el paginador
          tap((res: any) => this.configurarPaginador(res)),
          // Convertimos los datos
          map((response: any) => response.aguilaData as Lista[]),
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

  //Cargamos el recurso
  cargarRecurso() {
    this.setCargando(true);
    return this.http.options(this.urlEndPoint).pipe(
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

  //Configuramos el paginador
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

  //----- Seteamos un paginador
  setPaginador(paginador: Paginador) {
    this.paginador.next(paginador);
  }

  //Obtenemos el paginador
  getPaginador(): Observable<Paginador> {
    return this.paginador.asObservable();
  }

  setMenuOpcionesTabla(menuOpciones: MenuOpciones[]) {
    this.menuOpcionesTabla.next(menuOpciones);
  }

  //Opciones que tendra la tabla del Componente
  getMenuOpcionesTabla(): Observable<MenuOpciones[]> {
    return this.menuOpcionesTabla.asObservable();
  }

  //Seteamos Columnas para una lista
  setColumnas(columnas: Columna[]) {
    this.columnas.next(columnas)
  }

  //Obtenemos las columnas para una lista
  getColumnas(): Observable<Columna[]> {
    return this.columnas.asObservable();
  }

  //Validamos los permisos
  validarPermiso(opcion: string): boolean {
    return this.configService.opcionDisponible(this.recurso.value.id, opcion);
  }

  //Mostramos un mensaje de error por falta de permisos
  errorPermiso() {
    this.sweetService.sweet_error_permiso_recurso(this.recurso.value.nombre);
  }

  //Seteamos la configuracion que tendra el componente
  setConfiguracionComponent(configuracionComponent: ConfiguracionComponent) {
    console.log(configuracionComponent);

    this.configComponent.next(configuracionComponent);
  }

  //Obtenemos la configuracion del componente
  getConfiguracionComponent(): Observable<ConfiguracionComponent> {
    return this.configComponent.asObservable();
  }

  //Nos devuelve a la pagina anterior
  paginaAnterior() {
    this.configService.regresar();
  }

  //Seteamos el estado del servicio
  setCargando(estado: boolean) {
    this.cargando.next(estado);
  }

  getEstacionTrabajo() {
    return this.configService.getEstacionTrabajo();
  }

  //Obtenemos el estado del servicio
  getCargando(): Observable<boolean> {
    return this.cargando.asObservable();
  }

}
