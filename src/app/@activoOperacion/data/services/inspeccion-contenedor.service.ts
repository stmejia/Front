import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { Img, PdfMakeWrapper, QR } from 'pdfmake-wrapper';
import { map } from 'rxjs/operators';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { Estados } from 'src/app/@catalogos/data/models/estados';
import { AguilaResponse } from 'src/app/@page/models/aguilaResponse';
import { ServicioComponente } from 'src/app/@page/models/servicioComponente';
import { SweetService } from 'src/app/@page/services/sweet.service';
import { InspeccionContenedor } from '../models/inspeccionContenedor';

@Injectable({
  providedIn: 'root'
})
export class InspeccionContenedorService extends ServicioComponente {

  constructor(protected http: HttpClient, protected sw: SweetService, protected modal: MatDialog, protected cs: ConfigService) {
    super("/api/condicionContenedor", http, sw, cs, modal);
  }

  getEstadosCondiciones() {
    return this.http.get(this.urlEndPoint + '/estados/' + this.getEmpresa().id)
      .pipe(map((r: AguilaResponse<Estados[]>) => r.aguilaData));
  }

  async imprimirCondicion(id: number) {
    this.sweetService.sweet_carga('Generando Documento', true);
    let linkInstructivo = `${window.location.protocol}//${window.location.hostname}/assets/instructivos/Instructivo_Condicion_EquipoRemolque_Cabezal.jpg`;//Actualizar
    this.consultar<InspeccionContenedor>(id).subscribe(async (res) => {
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

        pdf.pageSize('LETTER');
        pdf.pageOrientation('portrait');

        pdf.info({
          title: "Inspección De Contenedor",
          author: "AguilaApp",
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

        pdf.add({ text: "INSPECCIÓN DE SEGURIDAD PARA CONTENEDORES MARÍTIMOS", bold: true, alignment: "center", fontSize: 14, margin: [0, -10, 0, 10] });
        pdf.add({ text: "FOR-VN-CEQ-03", bold: true, alignment: "center", fontSize: 8, margin: [0, -10, 0, 10] });

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
              }
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
                  { text: "Tipo Contenedor: ", bold: true },
                  { text: (res.tipoContenedor == 'S') ? 'Seco' : 'Refrigerado' }
                ], fontSize: 12, margin: [0, 0, 0, 2]
              },
            ]
          }
        ]

        let detalleGeneral = [
          {
            text: "LISTA DE VERIFICACIÓN GENERAL", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5]
          },
          {
            columns: [

              {
                text: [
                  { text: "Exterior y Marcos: ", bold: true },
                  { text: res.exteriorMarcos ? 'Si' : 'No' }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Puertas Exterior/Interior: ", bold: true },
                  { text: res.puertasInteriorExterior }
                ], fontSize: 12
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Observaciones: ", bold: true },
                  { text: res.exteriorMarcosObs || '' }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Observaciones: ", bold: true },
                  { text: res.puertasInteriorExteriorObs || '' }
                ], fontSize: 12
              }
            ]
          },
          {
            columns: [

              {
                text: [
                  { text: "Piso Interior: ", bold: true },
                  { text: res.pisoInterior }
                ], fontSize: 12, margin: [0, 5, 0, 0]
              },
              {
                text: [
                  { text: "Techo y cubierta: ", bold: true },
                  { text: res.techoCubierta }
                ], fontSize: 12, margin: [0, 5, 0, 0]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Observaciones: ", bold: true },
                  { text: res.pisoInteriorObs || '' }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Observaciones: ", bold: true },
                  { text: res.techoCubiertaObs || '' }
                ], fontSize: 12
              }
            ]
          },
          {
            columns: [

              {
                text: [
                  { text: "Lados Izquierdo y Derecho: ", bold: true },
                  { text: res.ladosIzquierdoDerecho }
                ], fontSize: 12, margin: [0, 5, 0, 0]
              },
              {
                text: [
                  { text: "Pared Frontal: ", bold: true },
                  { text: res.paredFrontal }
                ], fontSize: 12, margin: [0, 5, 0, 0]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Observaciones: ", bold: true },
                  { text: res.ladosIzquierdoDerechoObs || '' }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Observaciones: ", bold: true },
                  { text: res.paredFrontalObs || '' }
                ], fontSize: 12
              }
            ]
          }
        ]

        let detalleOpcional = [
          {
            text: "LISTA DE VERIFICACIÓN CONTENEDOR REFRIGERADO", bold: true, alignment: "center", fontSize: 14, margin: [0, 5, 0, 5]
          },
          {
            columns: [

              {
                text: [
                  { text: "Área de Condensador y Compresor: ", bold: true },
                  { text: res.areaCondesadorCompresor }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Área Evaporador: ", bold: true },
                  { text: res.areaEvaporador }
                ], fontSize: 12
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Observaciones: ", bold: true },
                  { text: res.areaCondesadorCompresorObs || '' }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Observaciones: ", bold: true },
                  { text: res.areaEvaporadorObs || '' }
                ], fontSize: 12
              }
            ]
          },
          {
            columns: [

              {
                text: [
                  { text: "Área de la Batería: ", bold: true },
                  { text: res.areaBateria }
                ], fontSize: 12, margin: [0, 5, 0, 0]
              },
              {
                text: [
                  { text: "Caja de Control Eléctrico / Automático:(Panel de Control) ", bold: true },
                  { text: res.cajaControlElectricoAutomatico }
                ], fontSize: 12, margin: [0, 5, 0, 0]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Observaciones: ", bold: true },
                  { text: res.areaBateriaObs || '' }
                ], fontSize: 12
              },
              {
                text: [
                  { text: "Observaciones: ", bold: true },
                  { text: res.cajaControlElectricoAutomaticoObs || '' }
                ], fontSize: 12
              }
            ]
          },
          {
            columns: [

              {
                text: [
                  { text: "Cables de Conexión Eléctrica: ", bold: true },
                  { text: res.areaBateria }
                ], fontSize: 12, margin: [0, 5, 0, 0]
              }
            ]
          },
          {
            columns: [
              {
                text: [
                  { text: "Observaciones: ", bold: true },
                  { text: res.cablesConexionElectricaObs || '' }
                ], fontSize: 12
              }
            ]
          }
        ]

        pdf.add(informacion);
        pdf.add(detalleGeneral);
        pdf.add(detalleOpcional);

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
    })
  }

}
