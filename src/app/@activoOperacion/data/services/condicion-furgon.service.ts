import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Img, PdfMakeWrapper, QR, Table } from 'pdfmake-wrapper';
import { BehaviorSubject, forkJoin, Observable, throwError } from 'rxjs';
import { catchError, first, map, tap } from 'rxjs/operators';
import { Estaciontrabajo } from 'src/app/@aguila/data/models/estaciontrabajo';
import { Recurso } from 'src/app/@aguila/data/models/recurso';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { EquipoRemolqueService } from 'src/app/@catalogos/data/services/equipo-remolque.service';
import { ColumnaTabla } from 'src/app/@page/models/aguilaTabla';
import { ConfiguracionComponent } from 'src/app/@page/models/configComponent';
import { FiltrosC, QueryFilter } from 'src/app/@page/models/filtros';
import { MenuOpciones } from 'src/app/@page/models/menu';
import { Paginador } from 'src/app/@page/models/paginador';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { environment } from 'src/environments/environment';
import { CondicionFurgon } from '../models/condicionFurgon';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Empresa } from 'src/app/@aguila/data/models/empresa';
import * as moment from 'moment';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { Estados } from 'src/app/@catalogos/data/models/estados';
import { ImagenRecursoConfiguracion } from 'src/app/@aguila/data/models/imagenRecursoConfiguracion';
import { MatDialog } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { TipoEquipoRemolque } from 'src/app/@catalogos/data/models/tipoEquipoRemolque';

@Injectable({
  providedIn: 'root'
})
export class CondicionFurgonService {

  private urlEndPoint: string = environment.UrlAguilaApi + "/api/condicionFurgon";
  private estacion: Estaciontrabajo;
  private configComponent = new BehaviorSubject<ConfiguracionComponent>(null);
  private filtrosComponent = new BehaviorSubject<FiltrosC[]>([]);
  private recurso = new BehaviorSubject<Recurso>(null);
  private cargando = new BehaviorSubject<boolean>(true);
  private menuOpcionesTabla = new BehaviorSubject<MenuOpciones[]>([]);
  private columnas = new BehaviorSubject<ColumnaTabla[]>([]);
  private paginador = new BehaviorSubject<Paginador>(null);
  private listaDatos = new BehaviorSubject<CondicionFurgon[]>([]);
  private listaDatosReporteInspecciones = new BehaviorSubject<CondicionFurgon[]>([]);

  constructor(private sweetService: SweetService, private http: HttpClient, private modal: MatDialog,
    private configService: ConfigService, private equipoRemolqueService: EquipoRemolqueService) {
    forkJoin([
      this.cargarRecurso().pipe(first(val => val != null)),
      this.equipoRemolqueService.getCargando().pipe(first(v => v === false)),
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
      map((res: any) => res.aguilaData as CondicionFurgon),
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
      .pipe(first(), map((r: AguilaResponse<CondicionFurgon>) => r.aguilaData));
  }

  crear(condicion: CondicionFurgon) {
    this.sweetService.sweet_carga('Guardando Registro');
    return this.http.post(this.urlEndPoint, condicion).pipe(
      first(),
      map((res: any) => res.aguilaData as CondicionFurgon),
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
    let linkInstructivo = `${window.location.protocol}//${window.location.hostname}/assets/instructivos/Instructivo_Condicion_Furgon.jpg`;

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

        pdf.add({ text: "CONDICIÓN DE FURGÓN", bold: true, alignment: "center", fontSize: 14, margin: [0, -10, 0, 0] });
        pdf.add({ text: "FOR-TT-CEQ-03", bold: true, alignment: "center", fontSize: 8, margin: [0, 0, 0, 5] });

        let informacion = [
          {
            columns: [
              {
                text: [
                  { text: "Piloto: ", bold: true },
                  { text: res.condicionActivo.empleado.nombres }
                ], fontSize: 10, margin: [0, 0, 0, 0]
              },
              {
                text: [
                  { text: "Serie: ", bold: true },
                  { text: res.condicionActivo.serie },
                  { text: "  No.: ", bold: true },
                  { text: res.condicionActivo.numero }
                ], fontSize: 10, alignment: "right", margin: [0, 0, 0, 0]
              },
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Inspector De Equipos: ", bold: true },
                  { text: res.condicionActivo.usuario.nombre }
                ], fontSize: 10, margin: [0, -2, 0, 0]
              },
              {
                text: [
                  { text: "Fecha ", bold: true },
                  { text: moment(res.condicionActivo.fecha).format("DD-MM-YYYY HH:mm") }
                ], alignment: "right", margin: [0, -2, 0, 0], fontSize: 10
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Predio: ", bold: true },
                  { text: res.condicionActivo.estacionTrabajo ? res.condicionActivo.estacionTrabajo.nombre : "" }
                ], alignment: "left", margin: [0, -2, 0, 0], fontSize: 10
              },
              {
                text: [
                  { text: "Tipo Condición: ", bold: true },
                  { text: res.condicionActivo.movimiento }
                ], alignment: "right", margin: [0, -2, 0, 0], fontSize: 10
              }
            ]
          },
          //{ text: "Información Del Equipo", alignment: "center", bold: true, fontSize: 12, margin: [0, 5, 0, 5] },
          {
            columns: [
              {
                text: [
                  { text: "Código De Equipo: ", bold: true },
                  { text: res.condicionActivo.activoOperacion.codigo }
                ], fontSize: 10, margin: [0, -2, 0, 0]
              },
              {
                text: [
                  { text: "Placa: ", bold: true },
                  { text: res.condicionActivo.placa }
                ], fontSize: 10, margin: [0, -2, 0, 0], alignment: "right",
              },
            ]
          }
        ]

        let detalle = [
          { text: "Detalle De Condición", bold: true, alignment: "center", fontSize: 12, margin: [0, -3, 0, 0] },
          { text: "Revisión Externa", bold: true, alignment: "center", fontSize: 12, margin: [0, 0, 0, 0] },
          {
            columns: [
              {
                text: [
                  { text: "Golpes: ", bold: true },
                  { text: res.revExtGolpe ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Separaciones: ", bold: true },
                  { text: res.revExtSeparacion ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Roturas: ", bold: true },
                  { text: res.revExtSeparacion ? "Si" : "No" }
                ], fontSize: 10
              }
            ]
          },
          { text: "Revisión Interna", bold: true, alignment: "center", fontSize: 12, margin: [0, 5, 0, 0] },
          {
            columns: [
              {
                text: [
                  { text: "Golpes: ", bold: true },
                  { text: res.revIntGolpes ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Separaciones: ", bold: true },
                  { text: res.revIntSeparacion ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Roturas: ", bold: true },
                  { text: res.revIntRotura ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Filtraciones: ", bold: true },
                  { text: res.revIntFiltra ? "Si" : "No" }
                ], fontSize: 10
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Piso Humedo: ", bold: true },
                  { text: res.revIntPisoH ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Manchas: ", bold: true },
                  { text: res.revIntManchas ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Olores: ", bold: true },
                  { text: res.revIntOlores ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: ""
              }
            ]
          },
          { text: "Revisión De Puertas", bold: true, alignment: "center", fontSize: 12, margin: [0, 5, 0, 0] },
          {
            columns: [
              {
                text: [
                  { text: "Sistema Cerrado: ", bold: true },
                  { text: res.revPuertaCerrado }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Empaque Puertas: ", bold: true },
                  { text: res.revPuertaEmpaque }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Cinta Reflectiva: ", bold: true },
                  { text: res.revPuertaCinta }
                ], fontSize: 10
              }
            ]
          },
          { text: "Luces", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 0] },
          {
            columns: [
              {
                text: [
                  { text: "Luces A: ", bold: true },
                  { text: res.lucesA ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Luces B: ", bold: true },
                  { text: res.lucesB ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Luces C: ", bold: true },
                  { text: res.lucesC ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Luces D: ", bold: true },
                  { text: res.lucesD ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Luces E: ", bold: true },
                  { text: res.lucesE ? "Si" : "No" }
                ], fontSize: 10
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Luces F: ", bold: true },
                  { text: res.lucesF ? "Si" : "No" }
                ]
              },
              {
                text: [
                  { text: "Luces G: ", bold: true },
                  { text: res.lucesG ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Luces H: ", bold: true },
                  { text: res.lucesH ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Luces I: ", bold: true },
                  { text: res.lucesI ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Luces J: ", bold: true },
                  { text: res.lucesJ ? "Si" : "No" }
                ], fontSize: 10
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Luces K: ", bold: true },
                  { text: res.lucesK ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Luces L: ", bold: true },
                  { text: res.lucesL ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Luces M: ", bold: true },
                  { text: res.lucesM ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Luces N: ", bold: true },
                  { text: res.lucesN ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Luces O: ", bold: true },
                  { text: res.lucesO ? "Si" : "No" }
                ], fontSize: 10
              }
            ]
          },
          { text: "Otros Aspectos", bold: true, alignment: "center", fontSize: 12, margin: [0, 5, 0, 0] },
          {
            columns: [
              {
                text: [
                  { text: "Fricciones: ", bold: true },
                  { text: res.fricciones }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Señalización: ", bold: true },
                  { text: res.senalizacion }
                ], fontSize: 10
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Guardafangos Izquierdo: ", bold: true },
                  { text: res.guardaFangosI }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Guardafangos Derecho: ", bold: true },
                  { text: res.guardaFangosD }
                ], fontSize: 10
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Placa Del Patín: ", bold: true },
                  { text: res.placaPatin ? "Si" : "No" }
                ], fontSize: 10
              }
            ]
          },
          { text: "Limpieza", bold: true, alignment: "center", fontSize: 12, margin: [0, 5, 0, 0] },
          {
            columns: [
              {
                text: [
                  { text: "Piso: ", bold: true },
                  { text: res.limpPiso ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Techo: ", bold: true },
                  { text: res.limpTecho ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Laterales: ", bold: true },
                  { text: res.limpLateral ? "Si" : "No" }
                ], fontSize: 10
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Exterior: ", bold: true },
                  { text: res.limpExt ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Puertas: ", bold: true },
                  { text: res.limpPuerta ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Eliminación De Manchas: ", bold: true },
                  { text: res.limpMancha ? "Si" : "No" }
                ], fontSize: 10
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Eliminación De Olores: ", bold: true },
                  { text: res.limpOlor ? "Si" : "No" }
                ], fontSize: 10
              },
              {
                text: [
                  { text: "Refuerzos Con Impermeabilizante: ", bold: true },
                  { text: res.limpRefuerzo ? "Si" : "No" }
                ], fontSize: 10
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Observaciones: ", bold: true },
                  { text: res.condicionActivo.observaciones }
                ], fontSize: 10
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Irregularidades Observaciones: ", bold: true },
                  { text: res.condicionActivo.irregularidadesObserv }
                ], fontSize: 10
              }
            ]
          }
        ];

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
        pdf.add({ text: "Condición De Llantas", alignment: "center", bold: true, fontSize: 12, margin: [0, 5, 0, 0] });
        pdf.add(tablaLlantas);

        if (res.condicionesLlantasRepuesto.length > 0) {
          pdf.add({ text: "Condición Llantas De Repuesto", alignment: "center", bold: true, fontSize: 12, margin: [0, 5, 0, 0] });
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
        ];

        pdf.add(imagenes);

        pdf.create().open();
        this.sweetService.sweet_alerta('Documento PDF', 'El documento se abrira en una pestaña nueva', 'info');
      } catch (error) {
        console.log(error);
        this.sweetService.sweet_alerta("Error", "No fue posible generar el documento.");
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
        fontSize: 10
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
            alignment: columna.aligment || 'left',
            fontSize: 8
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
        map((response: any) => response.aguilaData as CondicionFurgon[]),
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

  setDatos(list: CondicionFurgon[]) {
    this.listaDatos.next(list);
  }

  getDatos(): Observable<CondicionFurgon[]> {
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

  //Service Equipo Remolque
  getTiposEquiposRemolsqueValue() {
    return this.equipoRemolqueService.getTiposEquiposRemolqueValue();
  }

  getTiposEquiposRemolque() {
    return this.http.get(environment.UrlAguilaApi + `/api/tipoEquipoRemolque?idEmpresa=${this.getEmpresa().id}`)
      .pipe(first(), map((res: AguilaResponse<TipoEquipoRemolque[]>) => res));
  }

  setDatosEquiposRemolque(datos: any[]) {
    this.equipoRemolqueService.setDatos([]);
  }

  setFiltrosComponentEquipoRemolque(filtros: FiltrosC[]) {
    this.equipoRemolqueService.setFiltrosComponent(filtros);
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
