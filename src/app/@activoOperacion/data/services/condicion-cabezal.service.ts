import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, throwError } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
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
import { CondicionCabezal } from '../models/condicionCabezal';
import { Empresa } from 'src/app/@aguila/data/models/empresa';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { Estados } from 'src/app/@catalogos/data/models/estados';
import { Img, PdfMakeWrapper, QR, Table } from 'pdfmake-wrapper';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import * as moment from 'moment';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { VehiculoService } from 'src/app/@catalogos/data/services/vehiculo.service';
import { ImagenRecursoConfiguracion } from 'src/app/@aguila/data/models/imagenRecursoConfiguracion';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { TitulosReporte } from 'src/app/@page/models/titulosReporte';

@Injectable({
  providedIn: 'root'
})
export class CondicionCabezalService {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/condicionCabezal";
  private estacion: Estaciontrabajo;
  private configComponent = new BehaviorSubject<ConfiguracionComponent>(null);
  private filtrosComponent = new BehaviorSubject<FiltrosC[]>([]);
  private recurso = new BehaviorSubject<Recurso>(null);
  private cargando = new BehaviorSubject<boolean>(true);
  private menuOpcionesTabla = new BehaviorSubject<MenuOpciones[]>([]);
  private columnas = new BehaviorSubject<ColumnaTabla[]>([]);
  private paginador = new BehaviorSubject<Paginador>(null);
  private listaDatos = new BehaviorSubject<CondicionCabezal[]>([]);
  private listaDatosReporteInspecciones = new BehaviorSubject<CondicionCabezal[]>([]);
  formatoFecha: string = "DD/MM/YYYY";

  constructor(private sweetService: SweetService, private http: HttpClient,
    private configService: ConfigService, private vehiculosService: VehiculoService,
    private modal: MatDialog) {
    if (!this.recurso.value) {
      forkJoin([
        this.cargarRecurso().pipe(first(val => val != null)),
        this.vehiculosService.getCargando().pipe(first(v => v === false))
      ]).subscribe(res => {
        this.cargarEstacionTrabajo();
      });
    }
    PdfMakeWrapper.setFonts(pdfFonts);
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
    this.setDatosReporteInspecciones([]);
    this.setDatosVehiculosRemolque([]);
    //Variables a limpiar
  }

  getId(id: number | string) {
    return this.http.get(this.urlEndPoint + "/" + id).pipe(
      first(),
      map((res: any) => res.aguilaData as CondicionCabezal),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  getEstadosCondiciones() {
    return this.http.get(this.urlEndPoint + '/estados/' + this.getEmpresa().id)
      .pipe(map((r: AguilaResponse<Estados[]>) => r.aguilaData));
  }

  getUltimaCondicion(idActivo: number | string) {
    return this.http.get(this.urlEndPoint + '/ultima/' + idActivo)
      .pipe(first(), map((r: AguilaResponse<CondicionCabezal>) => r.aguilaData));
  }

  crear(condicion: CondicionCabezal) {
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.post(this.urlEndPoint, condicion).pipe(
      first(),
      map((res: any) => res.aguilaData as CondicionCabezal),
      tap((res) => {
        this.imprimirCondicion(res.condicionActivo.id);
      }),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  async imprimirCondicion(id: number) {
    this.sweetService.sweet_carga('Generando Documento', true);
    let linkInstructivo = `${window.location.protocol}//${window.location.hostname}/assets/instructivos/Instructivo_Condicion_EquipoRemolque_Cabezal.jpg`;
    this.getId(id).subscribe(async (res) => {
      try {
        let CodigoQR = new QR(res.condicionActivo.id.toString()).fit(80).alignment("center").margin([0, 10, 0, 0]).end;
        let QRInstructivo = new QR(linkInstructivo).fit(80).alignment("center").margin([0, 10, 0, 0]).end;
        let logoEmpresa;
        let firmaCondicion;

        if (this.getEstacionTrabajo().sucursal.empresa.imagenLogo) {
          logoEmpresa = await new Img(this.getEstacionTrabajo().sucursal.empresa.imagenLogo.imagenDefault.urlImagen).build();
        } else {
          logoEmpresa = await new Img(this.configService.getConfigLogoEmpresa().urlImagenDefaul).build();
        }

        if (res.condicionActivo.imagenFirmaPiloto) {
          firmaCondicion = await new Img(res.condicionActivo.imagenFirmaPiloto.imagenDefault.urlImagen)
            .alignment("center").width(350).margin([0, 10, 0, 0]).build();
        }

        let fecha = moment().format("DD-MM-YYYY HH:mm");
        let pdf: PdfMakeWrapper = new PdfMakeWrapper();

        pdf.pageSize('LETTER');//LETTER
        pdf.pageOrientation('portrait');

        pdf.info({
          title: "Inspección De Cabezal",
          author: 'AguilaApp',
          subject: 'Inspección'
        });

        pdf.header((currentPage: any) => {
          return [
            {
              columns: [
                { image: logoEmpresa.image, margin: [0, 0, 0, 0], width: 40 },
                {
                  text: [
                    { text: this.getEmpresa().nombre, alignment: "center", margin: [0, 0, 0, 0], bold: true, fontSize: 16 },
                  ]
                }
              ]
            }
          ]
        });

        pdf.footer((currentPage: any, pageCount: any, pageSize: any) => {
          return [
            {
              columns: [
                { text: `Generado por: ${this.configService.getUsuarioValue().nombre}`, margin: [10, 5, 10, 0], alignment: "left" },
                { text: `Fecha y Hora de impresión: ${fecha}`, margin: [10, 5, 10, 0], alignment: "right" }
              ]
            },
            {
              columns: [{ text: `Página ${currentPage} de ${pageCount}`, alignment: (currentPage % 2) ? 'left' : 'right', margin: [10, 5, 10, 0] }]
            }
          ]
        });

        pdf.add({ text: "CONDICIÓN DE CABEZAL", bold: true, alignment: "center", fontSize: 14, margin: [0, -10, 0, 10] });
        pdf.add({ text: "FOR-TT-CEQ-01", bold: true, alignment: "center", fontSize: 8, margin: [0, -10, 0, 10] });

        let informacion = [
          {
            columns: [
              {
                text: [
                  { text: "Piloto: ", bold: true },
                  { text: res.condicionActivo.empleado.nombres }
                ], fontSize: 12, margin: [0, 5, 0, 2]
              },
              {
                text: [
                  { text: "Serie: ", bold: true },
                  { text: res.condicionActivo.serie },
                  { text: "  No.: ", bold: true },
                  { text: res.condicionActivo.numero }
                ], fontSize: 12, alignment: "right", margin: [0, 5, 0, 2]
              },
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Inspector De Equipos: ", bold: true },
                  { text: res.condicionActivo.usuario.nombre }
                ], fontSize: 12, margin: [0, -3, 0, 0]
              },
              {
                text: [
                  { text: "Fecha ", bold: true },
                  { text: moment(res.condicionActivo.fecha).format("DD-MM-YYYY HH:mm") }
                ], alignment: "right", margin: [0, -3, 0, 0], fontSize: 12
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Predio: ", bold: true },
                  { text: res.condicionActivo.estacionTrabajo ? res.condicionActivo.estacionTrabajo.nombre : "" }
                ], alignment: "left", margin: [0, -3, 0, 2], fontSize: 12
              },
              {
                text: [
                  { text: "Tipo Condición: ", bold: true },
                  { text: res.condicionActivo.movimiento }
                ], alignment: "right", margin: [0, -3, 0, 2], fontSize: 12
              }
            ]
          },
          { text: "Información Del Equipo", alignment: "center", bold: true, fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Código De Equipo: ", bold: true },
                  { text: res.condicionActivo.activoOperacion.codigo }
                ], fontSize: 12, margin: [0, 0, 0, 2]
              },
              {
                text: [
                  { text: "Placa: ", bold: true },
                  { text: res.condicionActivo.placa }
                ], fontSize: 12, margin: [0, 0, 0, 2]
              },
            ]
          }
        ]

        let detalle = [
          {
            text: "Detalle De Condición", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5]
          },
          {
            columns: [
              {
                text: [
                  { text: "Winshild: ", bold: true },
                  { text: res.windShield }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Plumillas: ", bold: true },
                  { text: res.plumillas }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Viscera: ", bold: true },
                  { text: res.viscera }
                ], fontSize: 12
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Rompe Vientos: ", bold: true },
                  { text: res.rompeVientos }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Persiana: ", bold: true },
                  { text: res.persiana }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Bumper: ", bold: true },
                  { text: res.bumper }
                ], fontSize: 12
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Capo: ", bold: true },
                  { text: res.capo }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Retrovisor: ", bold: true },
                  { text: res.retrovisor }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Ojo De Buey: ", bold: true },
                  { text: res.ojoBuey }
                ], fontSize: 12
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Patas De Gallo: ", bold: true },
                  { text: res.pataGallo }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Porta Llanta: ", bold: true },
                  { text: res.portaLlanta }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Spoilers: ", bold: true },
                  { text: res.spoilers }
                ], fontSize: 12
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Salpicaderas: ", bold: true },
                  { text: res.salpicadera }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Guardafangos: ", bold: true },
                  { text: res.guardaFango }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Tapón Tanques De Comb.: ", bold: true },
                  { text: res.taponCombustible }
                ], fontSize: 12
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Baterías: ", bold: true },
                  { text: res.baterias }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Luces Delanteras: ", bold: true },
                  { text: res.lucesDelanteras }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Luces Traseras: ", bold: true },
                  { text: res.lucesTraseras }
                ], fontSize: 12
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Pintura: ", bold: true },
                  { text: res.pintura }
                ], fontSize: 12
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Observaciones: ", bold: true },
                  { text: res.condicionActivo.observaciones }
                ], fontSize: 12
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Irregularidades Observaciones: ", bold: true },
                  { text: res.condicionActivo.irregularidadesObserv }
                ], fontSize: 12
              }
            ]
          }
        ]

        let columnas: ColumnaTabla[] = [
          { titulo: "No.", target: ["id"], tipo: "texto", aligment: "center", visible: true },
          { titulo: "Código", target: ["codigo"], tipo: "texto", aligment: "left", visible: true },
          { titulo: "Marca", target: ["marca"], tipo: "texto", aligment: "left", visible: true },
          { titulo: "P. Izq.", target: ["profundidadIzq"], tipo: "texto", aligment: "center", visible: true },
          { titulo: "P. Cto.", target: ["profundidadCto"], tipo: "texto", aligment: "center", visible: true },
          { titulo: "P. Der.", target: ["profundidadDer"], tipo: "texto", aligment: "center", visible: true },
          { titulo: "PSI", target: ["psi"], tipo: "texto", aligment: "center", visible: true },
          { titulo: "Estado", target: ["estado"], tipo: "texto", aligment: "left", visible: true },
          { titulo: "Observaciones", target: ["observaciones"], tipo: "texto", aligment: "left", visible: true },
        ];

        let tablaLlantas = this.getTablaPDF(columnas, res.condicionesLlantas);

        let tablaLlantasR = res.condicionesLlantasRepuesto.length > 0 ? this.getTablaPDF(columnas, res.condicionesLlantasRepuesto) : '';

        pdf.add(informacion);
        pdf.add(detalle);
        pdf.add({ text: "Condición De Llantas", alignment: "center", bold: true, fontSize: 16, margin: [0, 5, 0, 5] });
        pdf.add(tablaLlantas);

        if (res.condicionesLlantasRepuesto.length > 0) {
          pdf.add({ text: "Condición Llantas De Repuesto", alignment: "center", bold: true, fontSize: 16, margin: [0, 5, 0, 5] });
          pdf.add(tablaLlantasR);
        }

        let imagenes = [
          {
            columns: [
              CodigoQR,
              firmaCondicion || "",
              QRInstructivo
            ]
          },
          {
            columns: [
              { text: "Código Inspección", bold: true, alignment: "left", fontSize: 10, margin: [0, 0, 0, 0] },
              { text: "Firma Piloto", bold: true, alignment: "center", fontSize: 10, margin: [0, 0, 0, 0] },
              { text: "Instructivo Inspección", bold: true, alignment: "right", fontSize: 10, margin: [0, 0, 0, 0] }
            ]
          }
        ]

        pdf.add(imagenes);

        pdf.create().open();
        this.sweetService.sweet_alerta('Documento PDF', 'El documento se abrira en una pestaña nueva', 'info');
      } catch (error) {
        console.log(error);
        this.sweetService.sweet_alerta("Error", "No fue posible generar el documento.", "error");
      }
    });
  }

  async imprimirDetalleLlantas(id: number) {
    this.sweetService.sweet_carga('Generando Documento', true);
    this.getId(id).subscribe(async (res) => {
      let titulosDocumento: TitulosReporte = {
        titulo: {
          text: this.getEmpresa().nombre,
          bold: true,
          size: 18
        },
        subTitulos: [
          { text: "Inspección De Llantas", bold: true, size: 16 },
          { text: `No. Inspección: ${res.condicionActivo.serie}-${res.condicionActivo.numero}` },
          { text: `Inspector De Equipos: ${res.condicionActivo.empleado.nombres} ${res.condicionActivo.empleado.apellidos}` }
        ]
      }

      let columnas: ColumnaTabla[] = [
        { titulo: "No.", target: ["id"], tipo: "texto", aligment: "center", visible: true },
        { titulo: "Código", target: ["codigo"], tipo: "texto", aligment: "left", visible: true },
        { titulo: "Marca", target: ["marca"], tipo: "texto", aligment: "left", visible: true },
        { titulo: "P. Izq.", target: ["profundidadIzq"], tipo: "texto", aligment: "center", visible: true },
        { titulo: "P. Cto.", target: ["profundidadCto"], tipo: "texto", aligment: "center", visible: true },
        { titulo: "P. Der.", target: ["profundidadDer"], tipo: "texto", aligment: "center", visible: true },
        { titulo: "PSI", target: ["psi"], tipo: "texto", aligment: "center", visible: true },
        { titulo: "Estado", target: ["estado"], tipo: "texto", aligment: "left", visible: true },
        { titulo: "Observaciones", target: ["observaciones"], tipo: "texto", aligment: "left", visible: true },
      ];

      let llantas = res.condicionesLlantas.concat(res.condicionesLlantasRepuesto);
      console.log(llantas);

      this.generarExcelTabla(columnas, llantas, titulosDocumento);
    }, (error) => {
      console.log(error);
      this.sweetService.sweet_Error(error);
    });

  }

  getTablaPDF(columnas: ColumnaTabla[], datos: any[]) {
    let tabla = new Table([]).layout('lightHorizontalLines').alignment("center").width("*").end;
    let encabezados = [];

    for (let columna of columnas) {
      let c = {
        text: columna.titulo,
        bold: true,
        fillColor: '#000000',
        color: '#FFFFFF',
        alignment: columna.aligment || 'left',
        fontSize: 12
      }
      encabezados.push(c);
    }

    tabla.table.body.push(encabezados);

    for (let dato of datos) {
      let fila = []
      for (let columna of columnas) {
        if (columna.tipo == "texto") {
          fila.push({
            text: this.getDatoObjeto(dato, columna.target),
            alignment: columna.aligment || 'left', fontSize: 10
          });
        }
      }
      encabezados.concat(fila);
      tabla.table.body.push(fila);
    }
    return tabla;
  }

  getDatoObjeto(item: any, target: string[]) {
    if (item) {
      let n = item;
      target.forEach(i => {
        n = n[i] ? n[i] : "";
      });
      return n;
    }
    return "";
  }

  cargarPagina(filtros: QueryFilter[]): void {
    this.sweetService.sweet_carga("Cargando Información");
    if (this.validarPermiso('Consultar')) {
      let filter = "?";

      for (let filtro of filtros) {
        filter += `${filtro.filtro}=${filtro.parametro}&`
      }

      filter += "idEmpresa=" + this.estacion.sucursal.empresa.id;

      this.http.get(this.urlEndPoint + filter).pipe(
        first(),
        tap((res: any) => this.configurarPaginador(res)),
        map((response: any) => response.aguilaData as CondicionCabezal[]),
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

  cargarReporteInspecciones(filtros: QueryFilter[]): void { //Inventario
    if (!this.validarPermiso('reporteInspecciones')) {
      this.errorPermiso("Reporte Inspecciones");
      return;
    }

    this.sweetService.sweet_carga("Cargando Información");
    let filter = "?";
    for (let filtro of filtros) {
      filter += `${filtro.filtro}=${filtro.parametro}&`
    }
    filter += `idEmpresa=${this.getEmpresa().id}`
    this.http.get(this.urlEndPoint + "/reporteCondiciones" + filter).pipe(
      //this.http.get(environment.UrlAguilaApi + "/api/controlVehiculos/reporteCondiciones" + filter).pipe(
      first(),
      map((response: any) => response.aguilaData as any[]),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })).subscribe(res => {
        this.setDatosReporteInspecciones(res);
        this.sweetService.sweet_notificacion("Listo", 1000, "info");
      });
  }

  getDatosReporteInspecciones() {
    return this.listaDatosReporteInspecciones.asObservable();
  }

  setDatosReporteInspecciones(datos) {
    this.listaDatosReporteInspecciones.next(datos);
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

  setDatos(list: CondicionCabezal[]) {
    this.listaDatos.next(list);
  }

  getDatos(): Observable<CondicionCabezal[]> {
    return this.listaDatos.asObservable();
  }

  setColumnas(columnas: ColumnaTabla[]) {
    this.columnas.next(columnas)
  }

  getColumnas(): Observable<ColumnaTabla[]> {
    return this.columnas.asObservable();
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

  errorPermiso(permiso: string) {
    this.sweetService.sweet_error_permiso_recurso(this.recurso.value.nombre, permiso);
  }

  setConfiguracionComponent(configuracionComponent: ConfiguracionComponent) {
    this.configComponent.next(configuracionComponent);
  }

  getConfiguracionComponent(): Observable<ConfiguracionComponent> {
    return this.configComponent.asObservable();
  }

  setFiltrosComponent(filtros: FiltrosC[]) {
    this.filtrosComponent.next(filtros);
  }

  getFiltrosComponent(): Observable<FiltrosC[]> {
    return this.filtrosComponent.asObservable();
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

  getRecurso() {
    return this.recurso.value;
  }

  getEmpresa(): Empresa {
    return this.estacion.sucursal.empresa;
  }

  getEstacionTrabajo(): Estaciontrabajo {
    return this.estacion;
  }

  getUsuario() {
    return this.configService.getUsuarioValue();
  }

  //Service Vehiculos
  getTiposVehiculosValue() {
    return this.vehiculosService.getTiposVehiculosValue();
  }

  setDatosVehiculosRemolque(datos: any[]) {
    this.vehiculosService.setDatos([]);
  }

  setFiltrosComponentVehiculosRemolque(filtros: FiltrosC[]) {
    this.vehiculosService.setFiltrosComponent(filtros);
  }

  getImagenRecursoConfiguracion(propiedad: string) {
    return this.http.get(this.urlEndPoint + "/ImagenConfiguracion/" + propiedad).pipe(
      first(), map((res: AguilaResponse<ImagenRecursoConfiguracion>) => res.aguilaData)
    );
  }

  abrirModal(component: ComponentType<any>, data?: any) {
    return this.modal.open(component, data).afterClosed();
  }

  async generarExcelTabla(columnas: ColumnaTabla[], datos: any[], titulos: TitulosReporte, logo: string = "") {
    this.sweetService.sweet_carga('Generando Documento', true);

    try {
      let workbook: Workbook = new Workbook();
      let fecha = moment().format("DD-MM-YYYY HH:mm");
      let logoEmpresa;

      //Cargamos el logo de la empresa
      if (logo.length > 0) {
        logoEmpresa = await new Img(logo).width(70).alignment("center").build();
      } else {
        if (this.configService.getEstacionTrabajoV().sucursal.empresa.imagenLogo) {
          logoEmpresa = await new Img(this.configService.getEstacionTrabajoV()
            .sucursal.empresa.imagenLogo.imagenDefault.urlImagen)
            .width(70).alignment("center").build();
        } else {
          logoEmpresa = await new Img(this.configService.getConfigLogoEmpresa().urlImagenDefaul)
            .width(70).alignment("center").build();
        }
      }

      let idLogoEmpresa = workbook.addImage({
        base64: logoEmpresa.image,
        extension: "jpeg"
      });

      //Asignamos Propiedades al Libro
      workbook.creator = 'AguilaApp';
      workbook.lastModifiedBy = this.configService.getUsuarioValue().username;
      workbook.created = new Date();
      workbook.modified = new Date();

      //Agregamos una Hoja de Trabajo
      workbook.addWorksheet("Reporte");
      let ws = workbook.getWorksheet('Reporte');

      //Configuracion de Página
      ws.pageSetup = {
        margins: {
          left: 0.7,
          right: 0.7,
          top: 0.7,
          bottom: 0.7,
          header: 0.3,
          footer: 0.3
        },
        orientation: 'landscape',
        paperSize: 5, //Papel Tamaño Oficio
      }

      //Header y Footer
      ws.headerFooter.oddHeader =
        `&L Fecha: ${fecha}` +
        `&R Generado por: ${this.configService.getUsuarioValue().username}`;
      ws.headerFooter.oddFooter = "&C Página &P de &N";

      //Contenido del documento
      ws.addRow([titulos.titulo.text]);

      titulos.subTitulos.forEach((v, i) => {
        ws.addRow([v.text])
      });

      ws.addImage(idLogoEmpresa, {
        tl: { col: 0, row: 0 },
        ext: { width: 45, height: 45 }
      });

      let headers = [];
      for (let columna of columnas) {
        if (columna.tipo !== 'opcion' && columna.tipo !== 'imagen' && columna.visible) {
          headers.push({ name: columna.titulo, filterButton: true });
        }
      }

      let filas = [];
      for (let dato of datos) {
        let fila = []
        for (let columna of columnas) {
          //Validamos si el contenido es un texto
          if (columna.tipo == 'texto' && columna.visible) {
            fila.push(this.getDatoObjeto(dato, columna.target));
          }

          //Validamos si el contenido es un booleano
          if (columna.tipo == 'boolean' && columna.visible) {
            fila.push(this.getDatoObjeto(dato, columna.target) ? 'Si' : 'No');
          }

          //Validamos si el contenido es una fecha
          if (columna.tipo == 'fecha' && columna.visible) {
            fila.push(moment(this.getDatoObjeto(dato, columna.target)).isValid() ? moment(this.getDatoObjeto(dato, columna.target)).format(columna.formatoFecha || this.formatoFecha) : "");
          }

          //Validamos si el contenido es una fecha
          if (columna.tipo == 'concatenar' && columna.visible) {
            fila.push(this.getDatoObjetoConcatenar(dato, columna.targetConcatenar, columna.caracterConcatenar));
          }
        }
        filas.push(fila);
      }

      ws.addTable({
        name: "Tabla_1",
        ref: `A${titulos.subTitulos.length + 3}`,
        headerRow: true,
        totalsRow: false,
        style: {
          theme: 'TableStyleLight1',
        },
        columns: headers,
        rows: filas
      });

      // ----- Aplicando Estilos ----- \\
      ws.mergeCells(1, 1, 1, headers.length); //Combinamos Celdas

      ws.getCell(1, 1).font = {
        bold: titulos.titulo.bold,
        size: titulos.titulo.size
      }

      ws.getCell(1, 1).alignment = {
        vertical: 'middle',
        horizontal: 'center'
      }

      titulos.subTitulos.forEach((v, i) => {
        ws.mergeCells(i + 2, 1, i + 2, headers.length); //Combinamos Celdas

        ws.getCell(i + 2, 1).font = {
          bold: v.bold,
          size: v.size
        }

        ws.getCell(i + 2, 1).alignment = {
          vertical: 'middle',
          horizontal: 'center'
        }
      });

      //Ajustamos el ancho de las columnas al contenido que tengan
      ws.columns.forEach((column, i) => {
        var maxLength = 30;
        var ancho = 10;
        column["eachCell"]({ includeEmpty: true }, function (cell) {
          if (parseInt(cell.row) > titulos.subTitulos.length + 2) {
            var columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > ancho) {
              ancho = columnLength;
            }
          }
        });
        column.width = ancho > maxLength ? 32 : ancho + 2;
      });

      // ----- Descargando Documento -----\\
      workbook.xlsx.writeBuffer().then(data => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, `${titulos.titulo.text}.xlsx`);
        this.sweetService.sweet_alerta('Documento XLSX', 'Descargando Documento', 'info');
      });

    } catch (e) {
      console.log(e);
      this.sweetService.sweet_alerta('Error', 'No fue posible generar el documento', 'error');
    }
  }

  getDatoObjetoConcatenar(item: any, target: string[][], caracterConcatenar: string) {
    let s: string = "";
    if (item) {
      target.forEach(t => {
        let n = item;
        t.forEach(i => {
          n = n[i] ? n[i] : "";
        });
        s += n.toString().trim();
        s += caracterConcatenar;
      });
    }
    return s;
  }
}
