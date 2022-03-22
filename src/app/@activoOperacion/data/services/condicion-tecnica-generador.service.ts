import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Img, PdfMakeWrapper, QR } from 'pdfmake-wrapper';
import { BehaviorSubject, forkJoin, Observable, throwError } from 'rxjs';
import { catchError, first, map, tap } from 'rxjs/operators';
import { Estaciontrabajo } from 'src/app/@aguila/data/models/estaciontrabajo';
import { Recurso } from 'src/app/@aguila/data/models/recurso';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { ConfiguracionComponent } from 'src/app/@page/models/configComponent';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { MenuOpciones } from 'src/app/@page/models/menu';
import { Paginador } from 'src/app/@page/models/paginador';
import { SweetService } from 'src/app/@page/services/sweet.service';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { environment } from 'src/environments/environment';
import { CondicionTecnicaGenerador } from '../models/condicionTecnicaGenerador';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { Estados } from 'src/app/@catalogos/data/models/estados';
import * as moment from 'moment';
import { Empresa } from 'src/app/@aguila/data/models/empresa';
import { GeneradorService } from 'src/app/@catalogos/data/services/generador.service';
import { CondicionGenerador } from '../models/condicionGenerador';

@Injectable({
  providedIn: 'root'
})
export class CondicionTecnicaGeneradorService {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/condicionTecnicaGenSet";
  private estacion: Estaciontrabajo;
  private configComponent = new BehaviorSubject<ConfiguracionComponent>(null);
  private filtrosComponent = new BehaviorSubject<FiltrosC[]>([]);
  private recurso = new BehaviorSubject<Recurso>(null);
  private cargando = new BehaviorSubject<boolean>(true);
  private menuOpcionesTabla = new BehaviorSubject<MenuOpciones[]>([]);
  private columnas = new BehaviorSubject<ColumnaTabla[]>([]);
  private paginador = new BehaviorSubject<Paginador>(null);
  private listaDatos = new BehaviorSubject<CondicionTecnicaGenerador[]>([]);

  constructor(private sweetService: SweetService, private http: HttpClient,
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
      map((res: any) => res.aguilaData as CondicionTecnicaGenerador),
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
      .pipe(first(), map((r: AguilaResponse<CondicionTecnicaGenerador>) => r.aguilaData));
  }

  getUltimaCondicionGenerador(idActivo: number | string) {
    return this.http.get(environment.UrlAguilaApi + '/api/condicionGenSet/ultima/' + idActivo)
      .pipe(first(), map((r: AguilaResponse<CondicionGenerador>) => r.aguilaData));
  }

  crear(condicion: CondicionTecnicaGenerador) {
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.post(this.urlEndPoint, condicion).pipe(
      first(),
      map((res: any) => res.aguilaData as CondicionTecnicaGenerador),
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

    this.getId(id).subscribe(async (res) => {
      try {
        let CodigoQR = new QR(res.condicionActivo.id.toString()).fit(80).alignment("center").margin([0, 10, 0, 0]).end;
        let logoEmpresa;

        if (this.getEstacionTrabajo().sucursal.empresa.imagenLogo) {
          logoEmpresa = await new Img(this.getEstacionTrabajo().sucursal.empresa.imagenLogo.imagenDefault.urlImagen).build();
        } else {
          logoEmpresa = await new Img(this.configService.getConfigLogoEmpresa().urlImagenDefaul).build();
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
                    { text: this.getEmpresa().nombre, alignment: "center", margin: [0, 0, 0, 0], bold: true, fontSize: 20 },
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

        pdf.add({ text: "Inspección Técnica De Generador", bold: true, alignment: "center", fontSize: 19, margin: [0, -10, 0, 10] });

        let informacion = [
          {
            columns: [
              {
                text: [
                  { text: "", bold: true },
                  { text: "" }
                ], fontSize: 16, margin: [0, 10, 0, 2]
              },
              {
                text: [
                  { text: "Serie: ", bold: true },
                  { text: res.condicionActivo.serie },
                  { text: "  No.: ", bold: true },
                  { text: res.condicionActivo.numero }
                ], fontSize: 16, alignment: "right", margin: [0, 10, 0, 2]
              },
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Inspector De Equipos: ", bold: true },
                  { text: res.condicionActivo.usuario.nombre }
                ], fontSize: 16, margin: [0, 0, 0, 0]
              },
              {
                text: [
                  { text: "Fecha ", bold: true },
                  { text: moment(res.condicionActivo.fecha).format("DD-MM-YYYY HH:mm") }
                ], alignment: "right", margin: [0, 0, 0, 0]
              }
            ]
          },
          {
            text: [
              { text: "Tipo Condición: ", bold: true },
              { text: res.condicionActivo.tipoCondicion }
            ], alignment: "right", margin: [0, -5, 0, 2]
          },
          { text: "Información Del Equipo", alignment: "center", bold: true, fontSize: "18", margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Código De Equipo: ", bold: true },
                  { text: res.condicionActivo.activoOperacion.codigo }
                ], fontSize: 14, margin: [0, 0, 0, 2]
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
          { text: "Batería", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Código: ", bold: true },
                  { text: res.bateriaCodigo }
                ]
              },
              {
                text: [
                  { text: "Nivel Acido: ", bold: true },
                  { text: res.bateriaNivelAcido ? "SI" : "NO" }
                ]
              },
              {
                text: [
                  { text: "Arnés: ", bold: true },
                  { text: res.bateriaArnes ? "SI" : "NO" }
                ]
              },
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Terminales: ", bold: true },
                  { text: res.bateriaTerminales ? "SI" : "NO" }
                ]
              },
              {
                text: [
                  { text: "Golpes: ", bold: true },
                  { text: res.bateriaGolpes ? "SI" : "NO" }
                ]
              },
              {
                text: [
                  { text: "Carga: ", bold: true },
                  { text: res.bateriaCarga ? "SI" : "NO" }
                ]
              }
            ]
          },
          { text: "Combustible Y Lubricantes", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Diesel: ", bold: true },
                  { text: res.combustibleDiesel ? "SI" : "NO" }
                ]
              },
              {
                text: [
                  { text: "Agua: ", bold: true },
                  { text: res.combustibleAgua ? "SI" : "NO" }
                ]
              },
              {
                text: [
                  { text: "Aceite: ", bold: true },
                  { text: res.combustibleAceite ? "SI" : "NO" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Fugas: ", bold: true },
                  { text: res.combustibleFugas ? "SI" : "NO" }
                ]
              },

            ]
          },
          { text: "Filtros", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Aceite: ", bold: true },
                  { text: res.filtroAceite ? "SI" : "NO" }
                ]
              },
              {
                text: [
                  { text: "Diesel: ", bold: true },
                  { text: res.filtroDiesel ? "SI" : "NO" }
                ]
              }
            ]
          },
          { text: "Bomba De Agua", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "En buen estado: ", bold: true },
                  { text: res.bombaAguaEstado ? "Si" : "No" }
                ]
              },
            ]
          },
          { text: "Sistema De Escape", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Agujeros: ", bold: true },
                  { text: res.escapeAgujeros ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Dañado: ", bold: true },
                  { text: res.escapeDañado ? "Si" : "No" }
                ]
              }
            ]
          },
          { text: "Cojinetes", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "En Buen Estado: ", bold: true },
                  { text: res.cojinetesEstado ? "Si" : "No" }
                ]
              },
            ]
          },
          { text: "Sistema De Arranque", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Funcionamiento Normal: ", bold: true },
                  { text: res.arranqueFuncionamiento ? "Si" : "No" }
                ]
              },
            ]
          },
          { text: "Faja Alternador", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "En Buen Estado: ", bold: true },
                  { text: res.fajaAlternador ? "Si" : "No" }
                ]
              }
            ]
          },
          { text: "Funcionamiento Sistema De Enfriamiento", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Aire: ", bold: true },
                  { text: res.enfriamientoAire ? "SI" : "NO" }
                ]
              },
              {
                text: [
                  { text: "Agua: ", bold: true },
                  { text: res.enfriamientoAgua ? "SI" : "NO" }
                ]
              }
            ]
          },
          { text: "Cantidad Generada", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "445 - 460 Volts: ", bold: true },
                  { text: res.cantidadGeneradaVolts ? "SI" : "NO" }
                ]
              },
            ]
          },
        ];

        pdf.add(informacion);
        pdf.add(detalle);

        pdf.add(CodigoQR);

        pdf.create().open();
        this.sweetService.sweet_alerta('Documento PDF', 'El documento se abrira en una pestaña nueva', 'info');
      } catch (error) {
        console.log(error);
        this.sweetService.sweet_alerta("Error", "No fue posible generar el documento.", "error");
      }
    });
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
        map((response: any) => response.aguilaData as CondicionTecnicaGenerador[]),
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

  setDatos(list: CondicionTecnicaGenerador[]) {
    this.listaDatos.next(list);
  }

  getDatos(): Observable<CondicionTecnicaGenerador[]> {
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
    return this.generadorService.getTiposGenerador();
  }

  setDatosGeneradores(datos: any[]) {
    this.generadorService.setDatos([]);
  }

  setFiltrosComponentGeneradores(filtros: FiltrosC[]) {
    this.generadorService.setFiltrosComponent(filtros);
  }
}
