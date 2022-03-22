import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as moment from 'moment';
import { Img, PdfMakeWrapper, Table, Txt } from 'pdfmake-wrapper';
import { ConfigService } from 'src/app/@aguila/data/services/config.service';
import { SweetService } from './sweet.service';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TitulosReporte } from '../models/titulosReporte';
import * as fs from 'file-saver';
import { ColumnaTabla } from '../models/aguilaTabla';

@Injectable({
  providedIn: 'root'
})

export class ReportesService {

  formatoFecha: string = "DD/MM/YYYY";

  constructor(private sweetService: SweetService, private configService: ConfigService) {
    PdfMakeWrapper.setFonts(pdfFonts);
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
        if (columna.visible) {
          //Validamos si el contenido es un texto
          if (columna.tipo == "texto") {
            fila.push({
              text: dato[0],
              alignment: columna.aligment || 'left'
            });
          }
        }
      }
      encabezados.concat(fila);
      tabla.table.body.push(fila);
    }
    return tabla;
  }

  async generarPDF(body: any) {

    let pdf: PdfMakeWrapper = new PdfMakeWrapper();
    let logoEmpresa;
    let fecha = moment().format("DD-MM-YYYY HH:mm");
    let logoBasc = await new Img("./assets/img/logoBasc.jpg").width(45).alignment("center").build();

    if (this.configService.getEstacionTrabajoV().sucursal.empresa.imagenLogo) {
      logoEmpresa = await new Img(this.configService.getEstacionTrabajoV()
        .sucursal.empresa.imagenLogo.imagenDefault.urlImagen)
        .width(45).alignment("center").build();
    } else {
      logoEmpresa = await new Img(this.configService.getConfigLogoEmpresa().urlImagenDefaul)
        .width(45).alignment("center").build();
    }

    pdf.styles({
      titulos: {
        bold: true,
        fontSize: 18,
        alignment: 'center'
      },
      subTitulos: {
        bold: false,
        fontSize: 14,
        alignment: 'center'
      }
    });

    //Encabezado de la Página
    pdf.header((currentPage: any) => {


      let h: any[] = [];
      h.push({ image: logoEmpresa.image });

      //h.push({ image: logoBasc.image });

      h.push(new Txt(this.configService.getEstacionTrabajoV().sucursal.empresa.nombre).style("titulos"));

      return { columns: h };
    });

    //Pie de pagina
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

    //pdf.add(body);
    pdf.create().open();

    this.sweetService.sweet_alerta('Documento PDF', 'El documento se abrira en una pestaña nueva', 'info');
  }

  async generarPDFTabla(columnas: ColumnaTabla[], datos: any[], titulos: TitulosReporte, logo: string = "") {
    this.sweetService.sweet_carga('Generando Documento', true);
    try {
      let pdf: PdfMakeWrapper = new PdfMakeWrapper();
      let fecha = moment().format("DD-MM-YYYY HH:mm");
      let logoEmpresa;

      if (logo.length > 0) {
        logoEmpresa = await new Img(logo).width(45).alignment("center").build();
      } else {
        if (this.configService.getEstacionTrabajoV().sucursal.empresa.imagenLogo) {
          logoEmpresa = await new Img(this.configService.getEstacionTrabajoV()
            .sucursal.empresa.imagenLogo.imagenDefault.urlImagen)
            .width(45).alignment("center").build();
        } else {
          logoEmpresa = await new Img(this.configService.getConfigLogoEmpresa().urlImagenDefaul)
            .width(45).alignment("center").build();
        }
      }

      pdf.info({
        title: titulos.titulo.text,
        author: 'AguilaApp',
        subject: 'Reporte'
      });

      pdf.pageSize('LEGAL');//LETTER height = 735; tamaño = caracter * 8.5
      //pdf.pageSize({ width: 495.28, height: 'auto' });
      pdf.pageOrientation('landscape');

      pdf.header((currentPage: any) => {
        let header: any[] = [{
          columns: [
            { image: logoEmpresa.image, margin: [0, 5, 0, 0], width: 45 },
            { text: titulos.titulo.text, fontSize: titulos.titulo.size, bold: titulos.titulo.bold, alignment: "center" }
          ]
        }];
        return header;
      });

      let t = [];
      titulos.subTitulos.forEach((v, i) => {
        t.push({ text: v.text, bold: v.bold, alignment: "center", fontSize: v.size, margin: [0, -10, 0, 10] });
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
      let widths: number[] = [];
      widths = this.getWidths(columnas, 8.5, 735);
      let tabla = new Table([]).layout('lightHorizontalLines').headerRows(1).widths(widths).end;

      let encabezados = [];

      for (let columna of columnas) {
        if (columna.tipo != 'imagen' && columna.tipo != 'opcion' && columna.visible) {
          let c = {
            text: columna.titulo,
            bold: true,
            fillColor: '#000000',
            color: '#FFFFFF',
            alignment: columna.aligment || 'left',
          }
          encabezados.push(c);
        }
      }

      tabla.table.body.push(encabezados);

      for (let dato of datos) {
        let fila = []
        for (let columna of columnas) {
          if (columna.tipo == "texto" && columna.visible) {
            fila.push({
              text: this.getDatoObjeto(dato, columna.target),
              alignment: columna.aligment || 'left',
            });
          }

          if (columna.tipo == "boolean" && columna.visible) {
            fila.push({
              text: this.getDatoObjeto(dato, columna.target) ? 'Si' : 'No',
              alignment: columna.aligment || 'left'
            });
          }

          if (columna.tipo == "fecha" && columna.visible) {
            fila.push({
              text: moment(this.getDatoObjeto(dato, columna.target)).isValid() ? moment(this.getDatoObjeto(dato, columna.target)).format(columna.formatoFecha || this.formatoFecha) : "",
              alignment: columna.aligment || 'left'
            });
          }

          if (columna.tipo == 'concatenar' && columna.visible) {
            fila.push({
              text: this.getDatoObjetoConcatenar(dato, columna.targetConcatenar, columna.caracterConcatenar),
              alignment: columna.aligment || 'left'
            });
          }
        }
        encabezados.concat(fila);
        tabla.table.body.push(fila);
      }
      pdf.add(t);
      pdf.add(tabla);
      pdf.create().open();
      this.sweetService.sweet_alerta('Documento PDF', 'El documento se abrira en una pestaña nueva', 'info');
    } catch (error) {
      console.log(error);
      this.sweetService.sweet_alerta('Error al generar el documento', 'No es posible generar el documento', 'error');
    }
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

  getWidths(columnas: ColumnaTabla[], factorConversion: number, anchoMax: number) {
    let widths: number[] = [];
    let maxWidth: number = (anchoMax / columnas.length);
    let totalWidths: number = 0;
    let noColMax: number = 0;

    columnas.forEach(c => {
      let palabras = c.titulo.split(" ");
      let w: number = 0;
      palabras.forEach(p => (p.length * factorConversion) > w ? w = (p.length * factorConversion) : w = w);
      widths.push(w);
      totalWidths += w;
    });

    if (totalWidths > anchoMax) {
      let difWidth: number = 0;
      widths.forEach(w => {
        if (w > maxWidth) noColMax++;
        difWidth = totalWidths - anchoMax;
      });
      let difXCol: number = difWidth / noColMax;
      widths = widths.map(w => (w > maxWidth) ? w -= difXCol : w);
    } else {
      let difXCol: number = (anchoMax - totalWidths) / columnas.length;
      widths = widths.map(w => w += difXCol);
    }
    return widths;
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
