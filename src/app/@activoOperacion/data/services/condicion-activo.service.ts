import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, throwError } from 'rxjs';
import { catchError, first, map, tap } from 'rxjs/operators';
import { Empresa } from 'src/app/@aguila/data/models/empresa';
import { Estaciontrabajo } from 'src/app/@aguila/data/models/estaciontrabajo';
import { Recurso } from 'src/app/@aguila/data/models/recurso';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { ConfiguracionComponent } from 'src/app/@page/models/configComponent';
import { MenuOpciones } from 'src/app/@page/models/menu';
import { Paginador } from 'src/app/@page/models/paginador';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';
import { CondicionActivo } from '../models/condicionActivo';
import { PdfMakeWrapper, QR, Table, Img } from 'pdfmake-wrapper';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import * as moment from 'moment';
import { CondicionCabezal } from '../models/condicionCabezal';
import { CondicionEquipo } from '../models/condicionEquipo';
import { CondicionFurgon } from '../models/condicionFurgon';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { CondicionGenerador } from '../models/condicionGenerador';

@Injectable({
  providedIn: 'root'
})
export class CondicionActivoService {

  urlEndPoint: string = environment.UrlAguilaApi + "/api/condicionActivos";
  private estacion: Estaciontrabajo;
  private configComponent = new BehaviorSubject<ConfiguracionComponent>(null);
  private recurso = new BehaviorSubject<Recurso>(null);
  private cargando = new BehaviorSubject<boolean>(true);
  private menuOpcionesTabla = new BehaviorSubject<MenuOpciones[]>([]);
  private columnas = new BehaviorSubject<ColumnaTabla[]>([]);
  private paginador = new BehaviorSubject<Paginador>(null);
  private listaDatos = new BehaviorSubject<CondicionActivo[]>([]);
  private filtrosComponent = new BehaviorSubject<FiltrosC[]>([]);
  private formatoFechaHora: string = environment.formatoFechaHora;

  constructor(private sweetService: SweetService, private http: HttpClient, private configService: ConfigService) {
    if (!this.recurso.value) {
      forkJoin([
        this.cargarRecurso().pipe(first(val => val != null))
      ]).subscribe(res => {
        this.cargarEstacionTrabajo();
      });
    }
    PdfMakeWrapper.setFonts(pdfFonts);
  }

  crear(item: CondicionActivo) {
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.post(this.urlEndPoint, item).pipe(
      first(),
      map((res: any) => res.aguilaData as CondicionActivo),
      // tap((res) => {
      //   this.listaDatos.getValue().push(res);
      // }),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  getId(id: number | string) {
    return this.http.get(this.urlEndPoint + "/" + id).pipe(
      first(),
      map((res: any) => res.aguilaData as CondicionActivo),
      catchError((e) => {
        this.sweetService.sweet_Error(e);
        return throwError(e);
      })
    );
  }

  cargarRecurso(): Observable<Recurso> {
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

  cargarEstacionTrabajo(): void {
    this.configService.getEstacionTrabajo().subscribe(res => {
      this.estacion = res.estacionTrabajo;
      this.limpiarVariables();
      this.setCargando(false);
    });
  }

  imprimirCondicion(id: any, titulo: string) {
    this.sweetService.sweet_carga('Generando Documento', true);
    this.getId(id).subscribe(async (res) => {

      let CodigoQR = new QR(res.id.toString()).fit(80).alignment("center").margin([0, 10, 0, 0]).end;
      let logoEmpresa;

      if (this.getEstacionTrabajo().sucursal.empresa.imagenLogo) {
        logoEmpresa = await new Img(this.getEstacionTrabajo().sucursal.empresa.imagenLogo.imagenDefault.urlImagen).build();
      } else {
        logoEmpresa = await new Img(this.configService.getConfigLogoEmpresa().urlImagenDefaul).build();
      }

      let fecha = moment().format("DD-MM-YYYY HH:mm");
      let pdf: PdfMakeWrapper = new PdfMakeWrapper();

      pdf.styles({
        bold_12: {
          bold: true,
          fontSize: 12
        },
        textoI: {
          alignment: 'center',
          bold: true
        },
        centro: {
          alignment: 'center'
        }
      });

      //Configuracion del Documento
      pdf.pageSize('LETTER');//LETTER
      pdf.pageOrientation('portrait');

      pdf.info({
        title: titulo,
        author: 'AguilaApp',
        subject: 'Reporte'
      });

      //pdf.pageMargins([10, 30, 10, 30]);

      //Encabezado de la Página
      pdf.header((currentPage: any) => {
        return [
          {
            columns: [
              { image: logoEmpresa.image, margin: [0, 0, 0, 0], width: 40 },
              {
                text: [
                  { text: titulo, alignment: "center", margin: [0, 0, 0, 0], bold: true, fontSize: 22 },
                ]
              }
            ]
          }
          //new Columns([{ text: titulo, alignment: "center", bold: true }])
        ]
      });

      //Pie de Página
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

      let informacion = [
        {
          columns: [
            {
              text: [
                { text: "Piloto: ", bold: true },
                { text: res.empleado }
              ], fontSize: 16, margin: [0, 10, 0, 2]
            },
            {
              text: [
                { text: "Serie: ", bold: true },
                { text: res.serie },
                { text: "  No.: ", bold: true },
                { text: res.numero }
              ], fontSize: 16, alignment: "right", margin: [0, 10, 0, 2]
            },
          ]
        },
        {
          columns: [
            {
              text: [
                { text: "Condicionista: ", bold: true },
                { text: res.usuario }
              ], fontSize: 16, margin: [0, 0, 0, 0]
            },
            {
              text: [
                { text: "Fecha ", bold: true },
                { text: moment(res.fecha).format("DD-MM-YYYY HH:mm") }
              ], alignment: "right", margin: [0, 0, 0, 0]
            }
          ]
        },
        {
          text: [
            { text: "Tipo Condición: ", bold: true },
            { text: res.movimiento }
          ], alignment: "right", margin: [0, -5, 0, 2]
        },
        { text: "Información Del Equipo", alignment: "center", bold: true, fontSize: "18", margin: [0, 5, 0, 5] },
        {
          columns: [
            {
              text: [
                { text: "Código De Equipo: ", bold: true },
                { text: res.codigo }
              ], fontSize: 14, margin: [0, 0, 0, 2]
            },
            {
              text: [
                { text: "Placa: ", bold: true },
                { text: res.placa }
              ], fontSize: 14, margin: [0, 0, 0, 2]
            },
          ]
        },
        {
          text: [
            { text: "Equipo: ", bold: true },
            { text: "" }
          ], fontSize: 14
        }
      ]

      let condicionDetalle = this.getDetalleCondicion(res.condicionDetalle, res.tipoCondicion);

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

      //----- Tabla Llantas
      let tablaLlantas = res.tipoCondicion != 'generador' ? this.getTablaPDF(columnas, res.condicionesLlantas) : '';

      //----- Tabla Llantas Repuesto
      let tablaLlantasR = res.tipoCondicion != 'generador' ? this.getTablaPDF(columnas, res.condicionesLlantasRepuesto) : '';

      pdf.add(informacion);
      pdf.add(condicionDetalle);

      if (res.tipoCondicion == 'generador') {
        pdf.add(CodigoQR);
        pdf.create().open();
        this.sweetService.sweet_alerta('Documento PDF', 'El documento se abrira en una pestaña nueva', 'info');
        return;
      }

      pdf.add({ text: "Condición De Llantas", alignment: "center", bold: true, fontSize: 18, margin: [0, 10, 0, 5] });
      pdf.add(tablaLlantas);

      pdf.add({ text: "Condición Llantas De Repuesto", alignment: "center", bold: true, fontSize: 18, margin: [0, 10, 0, 5] });
      pdf.add(tablaLlantasR);
      pdf.add(CodigoQR);

      pdf.create().open();
      this.sweetService.sweet_alerta('Documento PDF', 'El documento se abrira en una pestaña nueva', 'info');
    });

  }

  getDetalleCondicion(detalleCondicion: any, tipo: string) {
    switch (tipo.toLowerCase().trim()) {
      case "cabezal":
        let detalle = detalleCondicion as CondicionCabezal;
        let d = [
          {
            text: "Detalle De Condición", bold: true, alignment: "center", fontSize: 18, margin: [0, 10, 0, 5]
          },
          {
            columns: [
              {
                text: [
                  { text: "Winshild: ", bold: true },
                  { text: detalle.windShield }
                ]
              },
              {
                text: [
                  { text: "Plumillas: ", bold: true },
                  { text: detalle.plumillas }
                ]
              },
              {
                text: [
                  { text: "Viscera: ", bold: true },
                  { text: detalle.viscera }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Rompe Vientos: ", bold: true },
                  { text: detalle.rompeVientos }
                ]
              },
              {
                text: [
                  { text: "Persiana: ", bold: true },
                  { text: detalle.persiana }
                ]
              },
              {
                text: [
                  { text: "Bumper: ", bold: true },
                  { text: detalle.bumper }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Capo: ", bold: true },
                  { text: detalle.capo }
                ]
              },
              {
                text: [
                  { text: "Retrovisor: ", bold: true },
                  { text: detalle.retrovisor }
                ]
              },
              {
                text: [
                  { text: "Ojo De Buey: ", bold: true },
                  { text: detalle.ojoBuey }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Patas De Gallo: ", bold: true },
                  { text: detalle.pataGallo }
                ]
              },
              {
                text: [
                  { text: "Porta Llanta: ", bold: true },
                  { text: detalle.portaLlanta }
                ]
              },
              {
                text: [
                  { text: "Spoilers: ", bold: true },
                  { text: detalle.spoilers }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Salpicaderas: ", bold: true },
                  { text: detalle.salpicadera }
                ]
              },
              {
                text: [
                  { text: "Guardafangos: ", bold: true },
                  { text: detalle.guardaFango }
                ]
              },
              {
                text: [
                  { text: "Tapón Tanques De Comb.: ", bold: true },
                  { text: detalle.taponCombustible }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Baterías: ", bold: true },
                  { text: detalle.baterias }
                ]
              },
              {
                text: [
                  { text: "Luces Delanteras: ", bold: true },
                  { text: detalle.lucesDelanteras }
                ]
              },
              {
                text: [
                  { text: "Luces Traseras: ", bold: true },
                  { text: detalle.lucesTraseras }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Pintura: ", bold: true },
                  { text: detalle.pintura }
                ]
              }
            ]
          }
        ]
        return d;
        break;
      case "equipo":
        let detalleE = detalleCondicion as CondicionEquipo;
        let detalleEquipo = [
          {
            text: "Detalle De Condición", bold: true, alignment: "center", fontSize: 18, margin: [0, 10, 0, 5]
          },
          {
            text: "Luces", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5]
          },
          {
            columns: [
              {
                text: [
                  { text: "Luces A: ", bold: true },
                  { text: detalleE.lucesA ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces B: ", bold: true },
                  { text: detalleE.lucesB ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces C: ", bold: true },
                  { text: detalleE.lucesC ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces D: ", bold: true },
                  { text: detalleE.lucesD ? "Si" : "No" }
                ]
              },
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Luces E: ", bold: true },
                  { text: detalleE.lucesE ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces F: ", bold: true },
                  { text: detalleE.lucesF ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces PI: ", bold: true },
                  { text: detalleE.pi ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces SI: ", bold: true },
                  { text: detalleE.si ? "Si" : "No" }
                ]
              },
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Luces PD: ", bold: true },
                  { text: detalleE.pd ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces SD: ", bold: true },
                  { text: detalleE.sd ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            text: "Cintas Reflecticas", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5]
          },
          {
            columns: [
              {
                text: [
                  { text: "Laterales: ", bold: true },
                  { text: detalleE.cintaReflectivaLat }
                ]
              },
              {
                text: [
                  { text: "Frontales: ", bold: true },
                  { text: detalleE.cintaReflectivaFront }
                ]
              },
              {
                text: [
                  { text: "Traseras: ", bold: true },
                  { text: detalleE.cintaReflectivaTra }
                ]
              },
            ]
          },
          {
            text: "Otros Aspectos", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5]
          },
          {
            columns: [
              {
                text: [
                  { text: "Guarda Fangos G: ", bold: true },
                  { text: detalleE.guardaFangosG }
                ]
              },
              {
                text: [
                  { text: "Guarda Fangos I: ", bold: true },
                  { text: detalleE.guardaFangosI }
                ]
              },
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Fricciones: ", bold: true },
                  { text: detalleE.fricciones },
                  { text: "  - Llantas " + detalleE.friccionesLlantas }
                ]
              },
              {
                text: [
                  { text: "Bumper: ", bold: true },
                  { text: detalleE.bumper }
                ]
              },
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Manitas 1: ", bold: true },
                  { text: detalleE.manitas1 }
                ]
              },
              {
                text: [
                  { text: "Manitas 2: ", bold: true },
                  { text: detalleE.manitas2 }
                ]
              },
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Patas: ", bold: true },
                  { text: detalleE.patas }
                ]
              },
              {
                text: [
                  { text: "Ganchos", bold: true },
                  { text: detalleE.ganchos }
                ]
              },
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Balancines: ", bold: true },
                  { text: detalleE.balancines }
                ]
              },
              {
                text: [
                  { text: "Hoja De Resorte: ", bold: true },
                  { text: detalleE.hojasResortes }
                ]
              },
            ]
          },
        ];
        return detalleEquipo;
        break;
      case "furgon":
        let detalleF = detalleCondicion as CondicionFurgon;
        let detalleFurgon = [
          { text: "Detalle De Condición", bold: true, alignment: "center", fontSize: 18, margin: [0, 10, 0, 5] },
          { text: "Revisión Externa", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Golpes: ", bold: true },
                  { text: detalleF.revExtGolpe ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Separaciones: ", bold: true },
                  { text: detalleF.revExtSeparacion ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Roturas: ", bold: true },
                  { text: detalleF.revExtSeparacion ? "Si" : "No" }
                ]
              }
            ]
          },
          { text: "Revisión Interna", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Golpes: ", bold: true },
                  { text: detalleF.revIntGolpes ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Separaciones: ", bold: true },
                  { text: detalleF.revIntSeparacion ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Roturas: ", bold: true },
                  { text: detalleF.revIntRotura ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Filtraciones: ", bold: true },
                  { text: detalleF.revIntFiltra ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Piso Humedo: ", bold: true },
                  { text: detalleF.revIntPisoH ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Manchas: ", bold: true },
                  { text: detalleF.revIntManchas ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Olores: ", bold: true },
                  { text: detalleF.revIntOlores ? "Si" : "No" }
                ]
              }
            ]
          },
          { text: "Revisión De Puertas", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Sistema Cerrado: ", bold: true },
                  { text: detalleF.revPuertaCerrado }
                ]
              },
              {
                text: [
                  { text: "Empaque Puertas: ", bold: true },
                  { text: detalleF.revPuertaEmpaque }
                ]
              },
              {
                text: [
                  { text: "Cinta Reflectiva: ", bold: true },
                  { text: detalleF.revPuertaCinta }
                ]
              }
            ]
          },
          { text: "Luces", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Luces A: ", bold: true },
                  { text: detalleF.lucesA ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces B: ", bold: true },
                  { text: detalleF.lucesB ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces C: ", bold: true },
                  { text: detalleF.lucesC ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces D: ", bold: true },
                  { text: detalleF.lucesD ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Luces E: ", bold: true },
                  { text: detalleF.lucesE ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces F: ", bold: true },
                  { text: detalleF.lucesF ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces G: ", bold: true },
                  { text: detalleF.lucesG ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces H: ", bold: true },
                  { text: detalleF.lucesH ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Luces I: ", bold: true },
                  { text: detalleF.lucesI ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces J: ", bold: true },
                  { text: detalleF.lucesJ ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces K: ", bold: true },
                  { text: detalleF.lucesK ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces L: ", bold: true },
                  { text: detalleF.lucesL ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Luces M: ", bold: true },
                  { text: detalleF.lucesM ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces N: ", bold: true },
                  { text: detalleF.lucesN ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces O: ", bold: true },
                  { text: detalleF.lucesO ? "Si" : "No" }
                ]
              },
              {
                text: ""
              }
            ]
          },
          { text: "Otros Aspectos", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Fricciones: ", bold: true },
                  { text: detalleF.fricciones }
                ]
              },
              {
                text: [
                  { text: "Señalización: ", bold: true },
                  { text: detalleF.senalizacion }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Guardafangos Izquierdo: ", bold: true },
                  { text: detalleF.guardaFangosI }
                ]
              },
              {
                text: [
                  { text: "Guardafangos Derecho: ", bold: true },
                  { text: detalleF.guardaFangosD }
                ]
              }
            ]
          },
          { text: "Limpieza", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Piso: ", bold: true },
                  { text: detalleF.limpPiso ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Techo: ", bold: true },
                  { text: detalleF.limpTecho ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Laterales: ", bold: true },
                  { text: detalleF.limpLateral ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Exterior: ", bold: true },
                  { text: detalleF.limpExt ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Puertas: ", bold: true },
                  { text: detalleF.limpPuerta ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Eliminación De Manchas: ", bold: true },
                  { text: detalleF.limpMancha ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Eliminación De Olores: ", bold: true },
                  { text: detalleF.limpOlor ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Refuerzos Con Impermeabilizante: ", bold: true },
                  { text: detalleF.limpRefuerzo ? "Si" : "No" }
                ]
              }
            ]
          },
        ]
        return detalleFurgon;
        break;
      case "generador":
        let detalleG = detalleCondicion as CondicionGenerador;
        let detalleGenerador = [
          { text: "Detalle De Condición", bold: true, alignment: "center", fontSize: 18, margin: [0, 10, 0, 5] },
          { text: "Estructura Exterior", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Puertas Golpeadas: ", bold: true },
                  { text: detalleG.estExPuertasGolpeadas ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Puertas Quebradas: ", bold: true },
                  { text: detalleG.estExPuertasQuebradas ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Puertas Faltantes: ", bold: true },
                  { text: detalleG.estExPuertasFaltantes ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Puertas Sueltas: ", bold: true },
                  { text: detalleG.estExPuertasSueltas ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Bisagras o Cerrojos Quebrados: ", bold: true },
                  { text: detalleG.estExBisagrasQuebradas ? "Si" : "No" }
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
                  { text: detalleG.panelGolpes ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Tornillos Faltantes: ", bold: true },
                  { text: detalleG.panelTornillosFaltantes ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Otros: ", bold: true },
                  { text: detalleG.panelOtros ? "Si" : "No" }
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
                  { text: detalleG.soporteGolpes ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Tornillos Faltantes: ", bold: true },
                  { text: detalleG.soporteTornillosFaltantes ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Marco o Uniones Quebradas: ", bold: true },
                  { text: detalleG.soporteMarcoQuebrado ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Marco Flojo: ", bold: true },
                  { text: detalleG.soporteMarcoFlojo ? "Si" : "No" }
                ]
              },
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Bisagras o Cerrojos Quebrados: ", bold: true },
                  { text: detalleG.soporteBisagrasQuebradas ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Soldaduras En Buen Estado: ", bold: true },
                  { text: detalleG.soporteSoldaduraEstado ? "Si" : "No" }
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
                  { text: detalleG.revIntCablesQuemados ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Cables Sueltos: ", bold: true },
                  { text: detalleG.revIntCablesSueltos ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Reparaciones Impropias: ", bold: true },
                  { text: detalleG.revIntReparacionesImpropias ? "Si" : "No" }
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
                  { text: detalleG.tanqueAgujeros ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Soporte Del Tanque Dañados: ", bold: true },
                  { text: detalleG.tanqueSoporteDanado ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Medidor De Diesel: ", bold: true },
                  { text: detalleG.tanqueMedidorDiesel ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Codo De Suministro Quebrado o Flojo: ", bold: true },
                  { text: detalleG.tanqueCodoQuebrado ? "Si" : "No" }
                ]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Tapón Del Tanque: ", bold: true },
                  { text: detalleG.tanqueTapon ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Tubería De Succión y Retorno: ", bold: true },
                  { text: detalleG.tanqueTuberia ? "Si" : "No" }
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
                  { text: detalleG.pFaltMedidorAceite ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Tapa De Aceite: ", bold: true },
                  { text: detalleG.pFaltTapaAceite ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Tapón De Radiador: ", bold: true },
                  { text: detalleG.pFaltTaponRadiador ? "Si" : "No" }
                ]
              }
            ]
          },
        ]
        return detalleGenerador;
        break;
    }
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
      //tabla.widths.push('*');
    }

    tabla.table.body.push(encabezados);

    for (let dato of datos) {
      let fila = []
      for (let columna of columnas) {
        //Validamos si el contenido es un texto
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
    //tabla.table.body.push("s")
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

  limpiarVariables(): void {
    this.setDatos([]);
  }

  validarPermiso(permiso: string): boolean {
    return this.configService.opcionDisponible(this.recurso.value.id, permiso);
  }

  setCargando(estado: boolean): void {
    this.cargando.next(estado);
  }

  getCargando(): Observable<boolean> {
    return this.cargando.asObservable();
  }

  getRecurso(): Recurso {
    return this.recurso.value;
  }

  getEmpresa(): Empresa {
    return this.estacion.sucursal.empresa;
  }

  errorPermiso(permiso: string): void {
    this.sweetService.sweet_error_permiso_recurso(this.recurso.value.nombre, permiso);
  }

  getEstacionTrabajo(): Estaciontrabajo {
    return this.estacion;
  }

  paginaAnterior(): void {
    this.configService.regresar();
  }

  setConfiguracionComponent(configuracionComponent: ConfiguracionComponent): void {
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

  setMenuOpcionesTabla(menuOpciones: MenuOpciones[]): void {
    this.menuOpcionesTabla.next(menuOpciones);
  }

  getMenuOpcionesTabla(): Observable<MenuOpciones[]> {
    return this.menuOpcionesTabla.asObservable();
  }

  configurarPaginador(res: any): void {
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

  setPaginador(paginador: Paginador): void {
    this.paginador.next(paginador);
  }

  getPaginador(): Observable<Paginador> {
    return this.paginador.asObservable();
  }

  setColumnas(columnas: ColumnaTabla[]) {
    this.columnas.next(columnas);
  }

  getColumnas(): Observable<ColumnaTabla[]> {
    return this.columnas.asObservable();
  }

  cargarPagina(filtros: QueryFilter[]): void {
    this.sweetService.sweet_carga("Cargando Información");
    if (this.validarPermiso('Consultar')) {
      let filter = "?";

      for (let filtro of filtros) {
        filter += `${filtro.filtro}=${filtro.parametro}&`
      }

      this.http.get(this.urlEndPoint + filter).pipe(
        first(),
        tap((res: any) => this.configurarPaginador(res)),
        map((response: any) => response.aguilaData as CondicionActivo[]),
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

  getDatos(): Observable<any[]> {
    return this.listaDatos.asObservable();
  }

  setDatos(lista: CondicionActivo[]): void {
    this.listaDatos.next(lista);
  }

  getFormatoFechaHora() {
    return this.formatoFechaHora;
  }
}
