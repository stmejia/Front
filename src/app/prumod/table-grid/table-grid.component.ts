import { SweetService } from './../../@page/services/sweet.service';
import { AuthService } from './../../@aguila/security/services/auth.service';
import { Observable } from 'rxjs';
import { Arbol } from "./../data/models/arbol";
import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag
} from "@angular/cdk/drag-drop";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject } from 'rxjs';
import { Img, PdfMakeWrapper } from 'pdfmake-wrapper';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver'

@Component({
  selector: "app-table-grid",
  templateUrl: "./table-grid.component.html",
  styleUrls: ["./table-grid.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TableGridComponent implements OnInit {

  //Lista que contiene toda la escructura necesaria para la agrupacion
  dataArbol: Arbol[];

  //lista que contiene los grupos que se formaran
  grupos: Columna[] = [];

  cargando: boolean = true;
  mostrarTabla: boolean = true;

  datos: DatoTabla[] = [];
  datosTabla = new BehaviorSubject<any[]>(null);

  //Ancho total disponible 875 con margenes laterales de 10 (total 20)
  columnas: Columna[] = [
    { nombre: "Autor", targetId: "author", visible: true, orden: null, texto: true, width: 100, aligment: 'left' },
    { nombre: "Año Publicación", targetId: "publisher_date", visible: true, orden: null, texto: true, width: 75, aligment: 'center' },
    { nombre: "Titulo", targetId: "title", visible: true, orden: null, texto: true, width: 100, aligment: 'left' },
    { nombre: "Editora", targetId: "publisher", visible: true, orden: null, texto: true, width: 100, aligment: 'left' },
    { nombre: "Idioma", targetId: "language", visible: true, orden: null, texto: true, width: 75, aligment: 'center' },
    { nombre: "Paginas", targetId: "pages", visible: true, orden: null, texto: true, width: 75, aligment: 'center' },
    { nombre: "Contenido", targetId: "content_short", visible: true, orden: null, texto: true, width: 300, aligment: 'justify' },
    { nombre: "Portada", targetId: "thumbnail", visible: true, orden: null, texto: false, img: true, width: 50 },
  ];

  private fecha = new Date();

  //PDF Make
  private pdf: PdfMakeWrapper = new PdfMakeWrapper();

  //Excel
  private workbook: Workbook;


  constructor(private http: HttpClient, private authService: AuthService, private sweetService: SweetService) {
    PdfMakeWrapper.setFonts(pdfFonts);
  }

  getDatos(): Observable<any[]> {
    return this.datosTabla.asObservable();
  }

  ngOnInit(): void {
    this.http.get("https://www.etnassoft.com/api/v1/get/?category=libros_programacion&criteria=most_viewed?results_range=0&num_items=200")
      .subscribe((res: any) => {
        this.datosTabla.next(res as DatoTabla[]);
        this.datos = res.map(v => v);
        this.cargando = false;
      });
  }

  async drop(event: CdkDragDrop<Columna[]>) {
    let startTime = performance.now();
    if (event.previousContainer === event.container) {
      await moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      if (event.previousContainer.id == "listaEncabezado") {
        if (this.grupos.length < 3) {
          await transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
          this.agrupar();
        }
      } else {
        await transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        this.agrupar();
      }

    }
    let duration = performance.now() - startTime;
    console.log(duration);

  }

  agrupar() {
    this.dataArbol = [];
    if (this.grupos.length > 0) {
      for (let i = 0; i < this.grupos.length; i++) {
        let arbol = new Arbol();
        //nivel 1
        if (i == 0) {
          let elementos = this.datos;
          for (let item of elementos) {
            arbol = new Arbol();
            arbol.nombre = `${this.grupos[i].nombre}: ${item[this.grupos[i].targetId]}`;
            arbol.data = elementos.filter(
              (el) => el[this.grupos[i].targetId] == item[this.grupos[i].targetId]
            );
            elementos = elementos.filter(
              (el) => el[this.grupos[i].targetId] !== item[this.grupos[i].targetId]
            );
            if (arbol.data.length > 0) {
              this.dataArbol.push(arbol);
            }
          }
          //this.dataSource = [];
          this.mostrarTabla = false;
        }
        //nivel 2
        if (i == 1) {
          for (let ar of this.dataArbol) {
            ar.children = [];
            let elementos = ar.data;

            for (let data of ar.data) {
              let a = new Arbol();
              a.nombre = `${this.grupos[i].nombre}: ${data[this.grupos[i].targetId]}`;
              a.data = elementos.filter(
                (el) => el[this.grupos[i].targetId] == data[this.grupos[i].targetId]
              );
              elementos = elementos.filter(
                (el) => el[this.grupos[i].targetId] !== data[this.grupos[i].targetId]
              );
              if (a.data.length > 0) {
                ar.children.push(a);
              }
            }
          }
        }
        //Nivel 3
        if (i == 2) {
          for (let ar of this.dataArbol) {
            for (let chil of ar.children) {
              chil.children = [];
              let elementos = chil.data;
              for (let data of chil.data) {
                let a = new Arbol();
                a.nombre = `${this.grupos[i].nombre}: ${data[this.grupos[i].targetId]}`;
                a.data = elementos.filter(
                  (el) => el[this.grupos[i].targetId] == data[this.grupos[i].targetId]
                );
                elementos = elementos.filter(
                  (el) => el[this.grupos[i].targetId] !== data[this.grupos[i].targetId]
                );
                if (a.data.length > 0) {
                  chil.children.push(a);
                }
              }
            }
          }
        }
        //Nivel 4
        if (i == 3) {
        }
        //Nivel 5
        if (i == 4) {
        }
      }
    }

    if (this.grupos.length == 0) {
      this.mostrarTabla = true;
    }
  }

  ordenarColumna(columna: Columna) {
    let lista: any[] = [];
    this.getDatos().subscribe(res => {
      lista = res;
    });

    if (lista.length > 0) {
      switch (typeof lista[0][columna.targetId]) {
        //Metodo de ordenamiento en base al tipo
        case "string":
          switch (columna.orden) {
            case null:
              columna.orden = true;
              lista.sort(function (a, b) {
                if (a[columna.targetId] > b[columna.targetId]) {
                  return 1;
                }
                if (a[columna.targetId] < b[columna.targetId]) {
                  return -1;
                }
                return 0;
              });
              break;

            case true:
              columna.orden = false;
              lista.sort(function (a, b) {
                if (b[columna.targetId] > a[columna.targetId]) {
                  return 1;
                }
                if (b[columna.targetId] < a[columna.targetId]) {
                  return -1;
                }
                return 0;
              });
              break;
            case false:
              columna.orden = null;
              this.datosTabla.next(this.datos.map(v => v))
              break;
          }

          // this.ordenar();
          break;

        case "boolean":
          console.log("es un Booleano");
          break;

        case "number":
          switch (columna.orden) {
            case null:
              columna.orden = true;
              lista.sort(((a, b) => a[columna.targetId] - b[columna.targetId]));
              break;
            case true:
              columna.orden = false;
              lista.sort(((a, b) => b[columna.targetId] - a[columna.targetId]));
              break;
            case false:
              columna.orden = null;
              this.datosTabla.next(this.datos.map(v => v));
              break;
          }
          break;
      }
      this.datosTabla.next(lista);
    }
  }

  async generarPDF() {
    try {
      this.sweetService.sweet_carga('Generando Documento', true);

      //Creamos siempre una nueva instancia ya que los datos se conservan
      this.pdf = new PdfMakeWrapper();

      //Configuracion de estilos
      this.pdf.styles({
        bold_12: {
          bold: true,
          fontSize: 12
        },
        textoI: {
          alignment: 'center',
          bold: true
        }
      });
      // ----- ----- -----

      //Configuracion del Documento
      this.pdf.pageSize('LEGAL');//LETTER
      this.pdf.pageOrientation('landscape');
      this.pdf.info({
        title: 'Reporte PDF',
        author: 'AguilaApp',
        subject: 'Reporte'
      });
      this.pdf.pageMargins([10, 30, 10, 30]);
      // ----- ----- -----

      //Encabezado de la Página
      let encabezado: any = {
        columns: [
          {
            text: `Fecha: ${this.fecha.getDate()}/${this.fecha.getMonth() + 1}/${this.fecha.getFullYear()}`,
            margin: [10, 10, 0, 0],
            aligment: 'left',
            style: 'bold_12'
          },
          {
            text: `Generado por: ${this.authService.usuario.username}`,
            margin: [0, 10, 10, 0],
            alignment: 'right',
            style: 'bold_12'
          }
        ]
      }

      this.pdf.header(encabezado);
      // ----- ----- -----

      //Pie de Página
      this.pdf.footer(function (currentPage: any, pageCount: any, pageSize: any) {
        return [
          { text: `Página ${currentPage} de ${pageCount}`, alignment: (currentPage % 2) ? 'left' : 'right', margin: [10, 10, 10, 0] },
        ]
      });
      // ----- ----- -----

      //----- Titulo
      let titulo: any = {
        text: 'Libros de Programación',
        alignment: 'center',
        fontSize: 24,
        bold: true
      }

      let subTitulo: any = {
        text: 'Más Populares',
        alignment: 'center',
        fontSize: 18
      }

      let totalElementos: any = {
        text: 'Total Elementos: ' + this.datos.length.toString(),
        alignment: 'right',
        fontSize: 12
      }

      this.pdf.add(titulo);
      this.pdf.add(subTitulo);
      this.pdf.add(totalElementos);

      if (this.grupos.length < 1) {
        this.pdfTabla();
      }
      if (this.grupos.length > 0) {
        this.pdfGrupo();
      }
    } catch (error) {
      this.sweetService.sweet_alerta('Error',
        'No fue posible generar el Documento PDF, vuelva a intentarlo o comuniquese con soporte',
        'error');
      console.log(error);
    }
  }

  async pdfTabla() {
    //Cuerpo del Documento
    let ancho = [];
    for (let columna of this.columnas) {
      ancho.push(columna.width || '*')
    }
    //----- Tabla
    let tabla: any = {
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 1,
        body: [],
        widths: ancho
      }
    }

    let encabezadoTabla = [];
    for (let columna of this.columnas) {
      if (columna.visible) {
        let c = {
          text: columna.nombre,
          bold: true,
          fillColor: '#000000',
          color: '#FFFFFF',
          alignment: columna.aligment || 'center',
        }
        encabezadoTabla.push(c);
      }
    }

    tabla.table.body.push(encabezadoTabla);

    for (let dato of this.datos) {
      let fila = []
      for (let columna of this.columnas) {
        //Validamos si el contenido es un texto
        if (columna.texto && columna.visible) {
          fila.push({
            text: dato[columna.targetId],
            alignment: columna.aligment || 'left'
          });
        }
        //Validamos si el contenido es una imagen
        if (columna.img && columna.visible) {
          let imagen = await new Img(dato[columna.targetId]).build();
          fila.push({
            image: imagen.image,
            width: columna.width || 50
          });
        }
      }
      tabla.table.body.push(fila);
    }
    //----- ----- -----
    this.pdf.add(tabla);

    //Se abre en una nueva pestaña 
    this.pdf.create().open();
    this.sweetService.sweet_alerta('Documento PDF', 'El documento se abrira en una pestaña nueva', 'info');
  }

  async pdfGrupo() {
    let tabla: any = {
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 1,
        body: []
      }
    }

    let niveles = this.grupos.length;

    switch (niveles) {
      case 1:
        for (let dato of this.dataArbol) {
          let tituloNivel1: any = {
            text: dato.nombre,
            bold: true,
            fontSize: 18,
            margin: [0, 0, 0, 10]
          }
          this.pdf.add(tituloNivel1);
          let tabla: any = {
            layout: 'lightHorizontalLines',
            table: {
              headerRows: 1,
              body: []
            },
            margin: [25, 0, 0, 0]
          }

          let encabezadoTabla = [];
          for (let columna of this.columnas) {
            if (columna.visible) {
              let c = {
                text: columna.nombre,
                bold: true,
                fillColor: '#000000',
                color: '#FFFFFF',
                alignment: 'center'
              }
              encabezadoTabla.push(c);
            }
          }
          tabla.table.body.push(encabezadoTabla);
          for (let data of dato.data) {
            let fila = []
            for (let columna of this.columnas) {
              if (columna.texto && columna.visible) {
                fila.push(data[columna.targetId]);
              }
              if (columna.img && columna.visible) {
                let imagen = await new Img(data[columna.targetId]).build();
                fila.push({
                  image: imagen.image,
                  width: 50
                });
              }
            }
            tabla.table.body.push(fila);
          }
          this.pdf.add(tabla);
        }
        break;
      case 2:
        for (let arbol of this.dataArbol) {
          let tituloNivel1: any = {
            text: arbol.nombre,
            bold: true,
            fontSize: 18,
            margin: [0, 5, 0, 5]
          }
          this.pdf.add(tituloNivel1);

          for (let nivel1 of arbol.children) {
            let tituloNivel2: any = {
              text: '---- ' + nivel1.nombre,
              bold: true,
              fontSize: 18,
              margin: [25, 0, 0, 10]
            }
            this.pdf.add(tituloNivel2);

            let tabla: any = {
              layout: 'lightHorizontalLines',
              table: {
                headerRows: 1,
                body: []
              },
              margin: [50, 0, 0, 0]
            }

            let encabezadoTabla = [];
            for (let columna of this.columnas) {
              if (columna.visible) {
                let c = {
                  text: columna.nombre,
                  bold: true,
                  fillColor: '#000000',
                  color: '#FFFFFF',
                  alignment: 'center'
                }
                encabezadoTabla.push(c);
              }
            }
            tabla.table.body.push(encabezadoTabla);
            for (let data of nivel1.data) {
              let fila = []
              for (let columna of this.columnas) {
                if (columna.texto && columna.visible) {
                  fila.push(data[columna.targetId]);
                }
                if (columna.img && columna.visible) {
                  let imagen = await new Img(data[columna.targetId]).build();
                  fila.push({
                    image: imagen.image,
                    width: 50
                  });
                }
              }
              tabla.table.body.push(fila);
            }
            this.pdf.add(tabla);
          }
        }
        break;
      case 3:
        for (let arbol of this.dataArbol) {
          let tituloNivel1: any = {
            text: arbol.nombre,
            bold: true,
            fontSize: 18,
            margin: [0, 5, 0, 5]
          }
          this.pdf.add(tituloNivel1);

          for (let nivel2 of arbol.children) {
            let tituloNivel2: any = {
              text: '---- ' + nivel2.nombre,
              bold: true,
              fontSize: 18,
              margin: [25, 0, 0, 5]
            }
            this.pdf.add(tituloNivel2);

            for (let nivel3 of nivel2.children) {
              let tituloNivel3: any = {
                text: '---- ---- ' + nivel3.nombre,
                bold: true,
                fontSize: 18,
                margin: [50, 0, 0, 10]
              }
              this.pdf.add(tituloNivel3);

              let tabla: any = {
                layout: 'lightHorizontalLines',
                table: {
                  headerRows: 1,
                  body: []
                },
                margin: [75, 0, 0, 0],
                width: 790
              }

              let encabezadoTabla = [];
              for (let columna of this.columnas) {
                if (columna.visible) {
                  let c = {
                    text: columna.nombre,
                    bold: true,
                    fillColor: '#000000',
                    color: '#FFFFFF',
                    alignment: 'center'
                  }
                  encabezadoTabla.push(c);
                }
              }
              tabla.table.body.push(encabezadoTabla);
              for (let data of nivel3.data) {
                let fila = []
                for (let columna of this.columnas) {
                  if (columna.texto && columna.visible) {
                    fila.push(data[columna.targetId]);
                  }
                  if (columna.img && columna.visible) {
                    let imagen = await new Img(data[columna.targetId]).build();
                    fila.push({
                      image: imagen.image,
                      width: 50
                    });
                  }
                }
                tabla.table.body.push(fila);
              }
              this.pdf.add(tabla);
            }
          }
        }
        break;
      default:
        break;
    }

    this.pdf.create().open();
    this.sweetService.sweet_alerta('Documento PDF', 'El documento se abrira en una pestaña nueva', 'info');
  }

  async generarXLSX() {
    this.workbook = new Workbook();
    try {
      this.sweetService.sweet_carga('Generando Documento', true);

      //Asignamos Propiedades al Libro
      this.workbook.creator = 'AguilaApp';
      this.workbook.lastModifiedBy = 'Usuario de Prueba';
      this.workbook.created = new Date();
      this.workbook.modified = new Date();
      this.workbook.lastPrinted = new Date();

      //Agregamos una Hoja de Trabajo
      this.workbook.addWorksheet('Aguila');
      let ws = this.workbook.getWorksheet('Aguila');

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
        //printArea: "A1:E5"
      }

      //Header y Footer
      ws.headerFooter.oddHeader =
        `&L Fecha: ${this.fecha.getDate()}/${this.fecha.getMonth() + 1}/${this.fecha.getFullYear()}` +
        `&R Generado por: ${this.authService.usuario.username}`;
      ws.headerFooter.oddFooter = "&C Página &P de &N";

      //Contenido del documento
      let header = [];
      for (let columna of this.columnas) {
        if (columna.texto && columna.visible) {
          header.push(columna.nombre);
        }
      }

      let filas = [];
      for (let dato of this.datos) {
        let fila = []
        for (let columna of this.columnas) {
          //Validamos si el contenido es un texto
          if (columna.texto && columna.visible) {
            fila.push(dato[columna.targetId]);
          }
        }
        filas.push(fila);
      }

      ws.addRow(['Libros de Programación']);
      ws.addRow(['Más Populares']);
      ws.addRow(header);
      ws.addRows(filas);

      // ----- Aplicando Estilos ----- \\

      ws.mergeCells(1, 1, 1, header.length); //Combinamos Celdas
      ws.mergeCells(2, 1, 2, header.length); //Combinamos Celdas

      ws.getCell(1, 1).font = {
        bold: true,
        size: 18
      }
      ws.getCell(1, 1).alignment = {
        vertical: 'middle',
        horizontal: 'center'
      }
      ws.getCell(2, 1).font = {
        size: 16
      }
      ws.getCell(2, 1).alignment = {
        vertical: 'middle',
        horizontal: 'center'
      }

      for (let columna = 1; columna < header.length + 1; columna++) {
        //Borde
        ws.getCell(3, columna).border = {
          bottom: { style: 'medium' }
        }
        //Fuente
        ws.getCell(3, columna).font = {
          bold: true,
          color: { argb: 'FFFFFFFF' }
        }
        //Alineacion
        ws.getCell(3, columna).alignment = {
          vertical: 'middle',
          horizontal: 'center'
        }
        //Relleno
        ws.getCell(3, columna).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF000000' }
        }
      }

      ws.columns.forEach(function (column, i) {
        var maxLength = 30;
        column["eachCell"]({ includeEmpty: true }, function (cell) {
          if (parseInt(cell.row) > 2) {
            var columnLength = cell.value ? cell.value.toString().length : 15;
            if (columnLength > maxLength) {
              maxLength = 30;
            }else{
              maxLength = columnLength;
            }
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength;
      });

      this.workbook.xlsx.writeBuffer().then(data => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, 'nombreArchivo.xlsx');
        this.sweetService.sweet_notificacion('Descargando documento', 8000);
      });

    } catch (error) {
      console.log(error);
      this.sweetService.sweet_alerta('Error', 'Erro producido', 'error');
    }
  }
}

export interface DatoTabla {
  author: string;
  publisher_date: string;
  title: string;
  publisher: string;
  language: string;
  pages: string;
}

export interface Columna {
  nombre: string;
  targetId: string;
  visible: boolean;
  orden: boolean;
  texto: boolean;
  img?: boolean;
  width?: number;
  aligment?: 'center' | 'left' | 'right' | 'justify';
}
