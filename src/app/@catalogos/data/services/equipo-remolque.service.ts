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
import { ConfiguracionComponent } from 'src/app/@page/models/configComponent';
import { MenuOpciones } from 'src/app/@page/models/menu';
import { Paginador } from 'src/app/@page/models/paginador';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';
import { ActivoOperaciones } from '../models/activoOperaciones';
import { EquipoRemolque } from '../models/equipoRemolque';
import { TipoGenerador } from '../models/tipoGenerador';
import { TipoEquipoRemolqueService } from './tipo-equipo-remolque.service';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { Imagen } from 'src/app/@aguila/data/models/imagen';
import { Img } from 'pdfmake-wrapper';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { ImagenRecursoConfiguracion } from 'src/app/@aguila/data/models/imagenRecursoConfiguracion';
import { Lista } from '../models/lista';

@Injectable({
  providedIn: 'root'
})

export class EquipoRemolqueService {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/equipoRemolque";
  private configComponent = new BehaviorSubject<ConfiguracionComponent>(null);
  private estacion: Estaciontrabajo;
  private recurso = new BehaviorSubject<Recurso>(null);
  private cargando = new BehaviorSubject<boolean>(true);
  private menuOpcionesTabla = new BehaviorSubject<MenuOpciones[]>([]);
  private columnas = new BehaviorSubject<ColumnaTabla[]>([]);
  private paginador = new BehaviorSubject<Paginador>(null);
  private listaDatos = new BehaviorSubject<EquipoRemolque[]>([]);
  private filtrosComponent = new BehaviorSubject<FiltrosC[]>([]);
  private listaDatosActivoOperaciones = new BehaviorSubject<ActivoOperaciones[]>([]);
  private tipoEquiposRemolques = new BehaviorSubject<TipoGenerador[]>([]);
  protected urlTipoLista: string = environment.UrlAguilaApi + "/api/tiposLista";

  private columnasLista: ColumnaTabla[] = [
    { titulo: 'CUI', target: ['activoOperacion', 'codigo'], tipo: 'texto', aligment: 'center', visible: true },
    { titulo: 'Marca', target: ['activoOperacion', 'marca'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Placa', target: ['placa'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'Descripción', target: ['activoOperacion', 'descripcion'], tipo: 'texto', aligment: 'left', visible: true },
    { titulo: 'No. Llantas', target: ['llantas'], tipo: 'texto', aligment: 'right', visible: true }
  ];

  constructor(private sweetService: SweetService, private http: HttpClient,
    private configService: ConfigService, private modal: MatDialog,
    private tipoEquipoService: TipoEquipoRemolqueService) {
    forkJoin([
      this.cargarRecurso().pipe(first(val => val != null)),
      this.tipoEquipoService.getCargando().pipe(first(value => value === false)),
    ]).subscribe(res => {
      this.cargarEstacionTrabajo();
    }, (error) => {
      this.sweetService.sweet_alerta('Error', 'No es posible cargar el Recurso', 'error');
      this.paginaAnterior();
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
      this.cargarDatos();
    });
  }

  cargarDatos() {
    this.limpiarVariables();
    forkJoin([
      this.tipoEquipoService.getDatos().pipe(first())
    ]).subscribe(res => {
      if (res[0].length < 1) {
        this.tipoEquipoService.cargarPagina(1).subscribe(res => {
          this.tipoEquiposRemolques.next(res);
          this.setCargando(false);
        });
      } else {
        this.tipoEquiposRemolques.next(res[0]);
        this.setCargando(false);
      }
    });
  }

  limpiarVariables() {
    this.setDatos([]);
    this.setPaginador(null);
  }

  getId(id: number) {
    return this.http.get(this.urlEndPoint + "/" + id).pipe(
      first(),
      map((response: any) => response.aguilaData as EquipoRemolque)
    );
  }

  crear(item: EquipoRemolque) {
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.post(this.urlEndPoint, item).pipe(
      map((res: any) => res.aguilaData as EquipoRemolque),
      tap((res) => {
        this.listaDatos.getValue().push(res);
      }),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  modificar(item: EquipoRemolque) {
    this.sweetService.sweet_carga('Guardando Cambios');
    return this.http.put(this.urlEndPoint + "/" + item.idActivo, item).pipe(
      map((res: any) => res.aguilaData as boolean),
      tap((res) => {
        if (res) {
          this.setDatos(this.listaDatos.value.filter(el => el.idActivo !== item.idActivo));
          this.listaDatos.value.push(item);
        }
      }),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  getDatosFiltros(filtros: QueryFilter[]) { //No se Debe enviar Id Empresa
    if (this.validarPermiso('Consultar')) {
      let filter = "?";
      for (let filtro of filtros) {
        filter += `${filtro.filtro}=${filtro.parametro}&`
      }
      filter += "idEmpresa=" + this.estacion.sucursal.empresa.id;
      return this.http.get(this.urlEndPoint + filter).pipe(
        first(),
        map((response: any) => response.aguilaData as EquipoRemolque[]),
        catchError((e) => {
          this.sweetService.sweet_Error(e);
          return throwError(e);
        }));
    } else {
      this.errorPermiso();
    }
  }

  setDatos(list: EquipoRemolque[]) {
    this.listaDatos.next(list);
  }

  getDatos(): Observable<EquipoRemolque[]> {
    return this.listaDatos.asObservable();
  }

  setDatosActivoOperaciones(list: ActivoOperaciones[]) {
    this.listaDatosActivoOperaciones.next(list);
  }

  getDatosActivoOperaciones() {
    return this.listaDatosActivoOperaciones.asObservable();
  }

  cargarPagina(filtros: QueryFilter[]) {
    this.sweetService.sweet_carga("Espere", true);
    if (this.validarPermiso('Consultar')) {
      let filter = "?";
      for (let filtro of filtros) {
        filter += `${filtro.filtro}=${filtro.parametro}&`
      }
      filter += "idEmpresa=" + this.estacion.sucursal.empresa.id;

      this.http.get(this.urlEndPoint + filter).pipe(
        first(),
        tap((res: any) => this.configurarPaginador(res)),
        map((response: any) => response.aguilaData as EquipoRemolque[]),
        tap((res) => this.setDatos(res)),
        catchError((e) => {
          this.sweetService.sweet_Error(e);
          return [];
        })).subscribe(() => this.sweetService.sweet_notificacion("Listo", 2000));
    } else {
      this.errorPermiso();
    }
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

  setColumnas(columnas: ColumnaTabla[]) {
    this.columnas.next(columnas)
  }

  getColumnas(): Observable<ColumnaTabla[]> {
    return this.columnas.asObservable();
  }

  setFiltrosComponent(filtros: FiltrosC[]) {
    this.filtrosComponent.next(filtros);
  }

  getFiltrosComponent(): Observable<FiltrosC[]> {
    return this.filtrosComponent.asObservable();
  }

  setPaginador(paginador: Paginador) {
    this.paginador.next(paginador);
  }

  getPaginador(): Observable<Paginador> {
    return this.paginador.asObservable();
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

  getEstacionTrabajo() {
    return this.configService.getEstacionTrabajo().pipe(first());
  }

  getEmpresa() {
    return this.estacion.sucursal.empresa;
  }

  getEstacion() {
    return this.estacion;
  }

  getRecurso() {
    return this.recurso.value;
  }

  getTiposEquiposRemolque() {
    return this.tipoEquiposRemolques.asObservable();
  }

  getTiposEquiposRemolqueValue() {
    return this.tipoEquiposRemolques.value;
  }

  getImagenRecursoConfiguracion(propiedad: string) {
    return this.http.get(this.urlEndPoint + "/ImagenConfiguracion/" + propiedad).pipe(
      first(), map((res: AguilaResponse<ImagenRecursoConfiguracion>) => res.aguilaData)
    );
  }

  async descargarImagen(imagen: Imagen) {
    let img = await new Img(imagen.urlImagen).build();

    let link = document.createElement("a");
    link.href = img.image;
    link.download = imagen.nombre;
    link.target = "_blank";
    link.click();
    link.remove();
  }

  getListas(campo) {
    return this.http.get(this.urlTipoLista + `/lista?idRecurso=${this.getRecurso().id}&campo=${campo}&idEmpresa=${this.getEmpresa().id}`)
      .pipe(first(), map((res: AguilaResponse<Lista[]>) => res.aguilaData));
  }

  abrirModal(component: ComponentType<any>, data?: any) {
    return this.modal.open(component, data).afterClosed();
  }

  getUrlEndPoint() {
    return this.urlEndPoint;
}
}
