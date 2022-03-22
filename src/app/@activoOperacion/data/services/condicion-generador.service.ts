import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Img, PdfMakeWrapper, QR, Table } from 'pdfmake-wrapper';
import { BehaviorSubject, forkJoin, Observable, throwError } from 'rxjs';
import { catchError, first, map, tap } from 'rxjs/operators';
import { Estaciontrabajo } from 'src/app/@aguila/data/models/estaciontrabajo';
import { Recurso } from 'src/app/@aguila/data/models/recurso';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { GeneradorService } from 'src/app/@catalogos/data/services/generador.service';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { ConfiguracionComponent } from 'src/app/@page/models/configComponent';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { MenuOpciones } from 'src/app/@page/models/menu';
import { Paginador } from 'src/app/@page/models/paginador';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Empresa } from 'src/app/@aguila/data/models/empresa';
import * as moment from 'moment';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { Estados } from 'src/app/@catalogos/data/models/estados';
import { CondicionGenerador } from '../models/condicionGenerador';
import { ImagenRecursoConfiguracion } from 'src/app/@aguila/data/models/imagenRecursoConfiguracion';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { TipoGenerador } from 'src/app/@catalogos/data/models/tipoGenerador';

@Injectable({
  providedIn: 'root'
})
export class CondicionGeneradorService {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/condicionGenSet";
  private estacion: Estaciontrabajo;
  private configComponent = new BehaviorSubject<ConfiguracionComponent>(null);
  private filtrosComponent = new BehaviorSubject<FiltrosC[]>([]);
  private recurso = new BehaviorSubject<Recurso>(null);
  private cargando = new BehaviorSubject<boolean>(true);
  private menuOpcionesTabla = new BehaviorSubject<MenuOpciones[]>([]);
  private columnas = new BehaviorSubject<ColumnaTabla[]>([]);
  private paginador = new BehaviorSubject<Paginador>(null);
  private listaDatos = new BehaviorSubject<CondicionGenerador[]>([]);
  private listaDatosReporteInspecciones = new BehaviorSubject<CondicionGenerador[]>([]);

  constructor(private sweetService: SweetService, private http: HttpClient, private modal: MatDialog,
    private configService: ConfigService, private generadorService: GeneradorService) {
    forkJoin([
      this.cargarRecurso().pipe(first(val => val != null)),
      this.generadorService.getCargando().pipe(first(v => v === false)),
    ]).subscribe(res => {
      this.cargarEstacionTrabajo();
    });
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

  getTiposGenerador(){
    return this.http.get(environment.UrlAguilaApi + "/api/tipoGeneradores").pipe(first(), 
    map((res:AguilaResponse<TipoGenerador[]>) => res.aguilaData));
  }

  limpiarVariables() {
    this.filtrosComponent.next([]);
    this.menuOpcionesTabla.next([]);
    this.columnas.next([]);
    this.listaDatos.next([]);
    this.configComponent.next(null);
    this.paginador.next(null);
  }

  getId(id: number | string) {
    return this.http.get(this.urlEndPoint + "/" + id).pipe(
      first(),
      map((res: any) => res.aguilaData as CondicionGenerador),
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
      .pipe(first(), map((r: AguilaResponse<CondicionGenerador>) => r.aguilaData));
  }

  crear(condicion: CondicionGenerador) {
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.post(this.urlEndPoint, condicion).pipe(
      first(),
      map((res: any) => res.aguilaData as CondicionGenerador),
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
    let linkInstructivo = `${window.location.protocol}//${window.location.hostname}/assets/instructivos/Instructivo_Condicion_Gen_Set.jpg`;
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
          title: "Inspección De Equipo",
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
                    { text: this.getEmpresa().nombre, alignment: "center", margin: [0, 0, 0, 0], bold: true, fontSize: 18 },
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
                { text: `Generado por: ${this.configService.getUsuarioValue().nombre}`, margin: [10, 5, 10, 0], alignment: "left", fontSize: 10 },
                { text: `Fecha y Hora de impresión: ${fecha}`, margin: [10, 5, 10, 0], alignment: "right", fontSize: 10 }
              ]
            },
            {
              columns: [{ text: `Página ${currentPage} de ${pageCount}`, alignment: (currentPage % 2) ? 'left' : 'right', margin: [10, 5, 10, 0], fontSize: 10 }]
            }
          ]
        });

        pdf.add({ text: "Inspección De Generador", bold: true, alignment: "center", fontSize: 16, margin: [0, -10, 0, 10] });

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
              // {
              //   text: [
              //     { text: "Placa: ", bold: true },
              //     { text: res.condicionActivo.placa }
              //   ], fontSize: 14, margin: [0, 0, 0, 2]
              // },
            ]
          },
          // {
          //   text: [
          //     { text: "Equipo: ", bold: true },
          //     { text: "" }
          //   ], fontSize: 14
          // }
        ]

        let detalle = [
          { text: "Detalle De Condición", bold: true, alignment: "center", fontSize: 18, margin: [0, 10, 0, 5] },
          { text: "Estructura Exterior", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Puertas Golpeadas: ", bold: true },
                  { text: res.estExPuertasGolpeadas ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Puertas Quebradas: ", bold: true },
                  { text: res.estExPuertasQuebradas ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Puertas Faltantes: ", bold: true },
                  { text: res.estExPuertasFaltantes ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Puertas Sueltas: ", bold: true },
                  { text: res.estExPuertasSueltas ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Bisagras o Cerrojos Quebrados: ", bold: true },
                  { text: res.estExBisagrasQuebradas ? "Si" : "No" }
                ]
              }
            ]
          },
          { text: "Panel Eléctrico", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Golpes o Rajaduras: ", bold: true },
                  { text: res.panelGolpes ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Tornillos Faltantes: ", bold: true },
                  { text: res.panelTornillosFaltantes ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Otros: ", bold: true },
                  { text: res.panelOtros ? "Si" : "No" }
                ]
              }
            ]
          },
          { text: "Soporte Del Marco", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Golpes, Grietas, Cortes o Rajaduras: ", bold: true },
                  { text: res.soporteGolpes ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Tornillos Faltantes: ", bold: true },
                  { text: res.soporteTornillosFaltantes ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Marco o Uniones Quebradas: ", bold: true },
                  { text: res.soporteMarcoQuebrado ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Marco Flojo: ", bold: true },
                  { text: res.soporteMarcoFlojo ? "Si" : "No" }
                ]
              },
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Bisagras o Cerrojos Quebrados: ", bold: true },
                  { text: res.soporteBisagrasQuebradas ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Soldaduras En Buen Estado: ", bold: true },
                  { text: res.soporteSoldaduraEstado ? "Si" : "No" }
                ]
              }
            ]
          },
          { text: "Revisión Interna", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Cables Quemados: ", bold: true },
                  { text: res.revIntCablesQuemados ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Cables Sueltos: ", bold: true },
                  { text: res.revIntCablesSueltos ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Reparaciones Impropias: ", bold: true },
                  { text: res.revIntReparacionesImpropias ? "Si" : "No" }
                ]
              }
            ]
          },
          { text: "Tanque De Combustible", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Agujeros, Fisuras o Fugas: ", bold: true },
                  { text: res.tanqueAgujeros ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Soporte Del Tanque Dañados: ", bold: true },
                  { text: res.tanqueSoporteDanado ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Medidor De Diesel: ", bold: true },
                  { text: res.tanqueMedidorDiesel ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Codo De Suministro Quebrado o Flojo: ", bold: true },
                  { text: res.tanqueCodoQuebrado ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Tapón Del Tanque: ", bold: true },
                  { text: res.tanqueTapon ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Tubería De Succión y Retorno: ", bold: true },
                  { text: res.tanqueTuberia ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Horometro: ", bold: true },
                  { text: res.horometro || "" }
                ]
              },
              {
                text: [
                  { text: "Diesel En Gen-Set: ", bold: true },
                  { text: res.dieselEntradaSalida || "" }
                ]
              }
            ]
          },
          { text: "Piezas Faltantes", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Medidor De Aceite: ", bold: true },
                  { text: res.pFaltMedidorAceite ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Tapa De Aceite: ", bold: true },
                  { text: res.pFaltTapaAceite ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Tapón De Radiador: ", bold: true },
                  { text: res.pFaltTaponRadiador ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Observaciones: ", bold: true },
                  { text: res.condicionActivo.observaciones }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Irregularidades Observaciones: ", bold: true },
                  { text: res.condicionActivo.irregularidadesObserv }
                ]
              }
            ]
          }
        ];

        pdf.add(informacion);
        pdf.add(detalle);

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
            alignment: columna.aligment || 'left'
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
        map((response: any) => response.aguilaData as CondicionGenerador[]),
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

  setDatos(list: CondicionGenerador[]) {
    this.listaDatos.next(list);
  }

  getDatos(): Observable<CondicionGenerador[]> {
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

  //Service Generador
  getTiposGeneradorValue() {
    //return this.generadorService.getTiposGeneradorValue();
    return [];
  }

  setDatosGeneradores(datos: any[]) {
    this.generadorService.setDatos([]);
  }

  setFiltrosComponentGeneradores(filtros: FiltrosC[]) {
    this.generadorService.setFiltrosComponent(filtros);
  }

  getImagenRecursoConfiguracion(propiedad: string) {
    return this.http.get(this.urlEndPoint + "/ImagenConfiguracion/" + propiedad).pipe(
      first(), map((res: AguilaResponse<ImagenRecursoConfiguracion>) => res.aguilaData)
    );
  }

  abrirModal(component: ComponentType<any>, data?: any) {
    return this.modal.open(component, data).afterClosed();
  }
}
