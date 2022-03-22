import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, throwError } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { catchError, first, map, tap } from 'rxjs/operators';
import { Recurso } from 'src/app/@aguila/data/models/recurso';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { Columna } from 'src/app/@page/models/columna';
import { ConfiguracionComponent } from 'src/app/@page/models/configComponent';
import { MenuOpciones } from 'src/app/@page/models/menu';
import { Paginador } from 'src/app/@page/models/paginador';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';
import { Producto } from '../models/producto';
import { Columns, PdfMakeWrapper, QR, Table, Txt } from 'pdfmake-wrapper';
import pdfFonts from 'pdfmake/build/vfs_fonts';

@Injectable({
  providedIn: 'root'
})

export class ProductoService {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/productos";
  private configComponent = new BehaviorSubject<ConfiguracionComponent>(null);
  private recurso = new BehaviorSubject<Recurso>(null);
  private columnas = new BehaviorSubject<Columna[]>([]);
  private cargando = new BehaviorSubject<boolean>(true);
  private menuOpcionesTabla = new BehaviorSubject<MenuOpciones[]>([]);
  private paginador = new BehaviorSubject<Paginador>(null);
  private listaDatos = new BehaviorSubject<Producto[]>([]);
  private producto = new BehaviorSubject<Producto>(null);

  private columnasModal: Columna[] = [
    { nombre: 'Código', targetId: 'codigo', tipo: 'texto', aligment: 'left' },
    { nombre: 'Nombre', targetId: 'nombres', tipo: 'texto', aligment: 'left' },
    { nombre: 'DPI', targetId: 'dpi', tipo: 'texto', aligment: 'left' },
  ];

  constructor(private sweetService: SweetService, private http: HttpClient, private configService: ConfigService,
    private modal: MatDialog) {
    PdfMakeWrapper.setFonts(pdfFonts);

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
      first(),
      map((res: any) => res.aguilaData as Producto),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  crear(item: Producto) {
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.post(this.urlEndPoint, item).pipe(
      first(),
      map((res: any) => res.aguilaData as Producto),
      tap((res) => {
        this.listaDatos.getValue().push(res);
      }),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  modificar(item: Producto) {
    this.sweetService.sweet_carga('Guardando Cambios');
    return this.http.put(this.urlEndPoint + "/" + item.id, item).pipe(
      first(),
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

  imprimirEtiqueta(item: Producto) {
    this.sweetService.sweet_carga('Generando Documento', true);
    let pdf: PdfMakeWrapper = new PdfMakeWrapper();

    let cuerpo = new Columns([
      new QR(item.codigo).fit(100).end,
      new Table([
        [new Txt(`Descripción: ${item.descripcion}`).end],
        [new Txt(`Código: ${item.codigo}`).end],
        [new Txt(`Categoria: ${item.descCategoria}`).end],
        [new Txt(`Sub Categoria: ${item.descSubCategoria}`).end]
      ]).widths(['*']).absolutePosition(120, 15).end
    ]).alignment("left").absolutePosition(15, 15).end;

    pdf.add(cuerpo);
    pdf.create().open();
    this.sweetService.sweet_alerta('Documento PDF', 'El documento se abrira en una pestaña nueva', 'info');

  }

  setDatos(lista: Producto[]) {
    this.listaDatos.next(lista);
  }

  setProducto(producto: Producto) {
    this.producto.next(producto);
  }

  getProducto(): Observable<Producto> {
    return this.producto.asObservable();
  }

  getDatos(cargar: boolean = false): Observable<Producto[]> {
    if (cargar && this.listaDatos.value.length < 1) {
      this.getEstacionTrabajo().subscribe(res => this.cargarPagina(1, res.estacionTrabajo.sucursal.empresaId));
    }
    return this.listaDatos.asObservable();
  }

  cargarPagina(noPagina: number, idEmpresa: number) {
    this.sweetService.sweet_carga("Espere", true);
    if (this.validarPermiso('Consultar')) {
      this.http.get(this.urlEndPoint +
        `?PageNumber=${noPagina}&idEmpresa=${idEmpresa}`).pipe(
          first(),
          tap((res: any) => this.configurarPaginador(res)),
          map((response: any) => response.aguilaData as Producto[]),
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

  abrirModal(mSelect: boolean, titulo: string, component: ComponentType<any>, idEmpresa: number) {
    if (this.listaDatos.value.length < 1) {
      this.cargarPagina(1, idEmpresa);
    }
    this.setConfiguracionComponent({ header: { titulo: titulo }, isModal: true, multiSelect: mSelect });
    this.setColumnas(this.columnasModal);
    return this.modal.open(component).afterClosed();
  }

  configurarBodega(component: ComponentType<any>) {
    return this.modal.open(component).afterClosed();
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
